import dbConnect from '@/lib/db/connection';
import Repository from '@/lib/db/models/Repository';
import File, { IFile } from '@/lib/db/models/File';
import AnalysisResult from '@/lib/db/models/AnalysisResult';
import { scanDirectory } from '@/lib/analyzer/scanner';
import { calculateGraph } from '@/lib/analyzer/graph/builder';
import path from 'node:path';
import os from 'node:os';

interface WorkerFileResult {
    path: string;
    name: string;
    extension: string;
    loc: number;
    error: string | null;
    parsed: {
        imports: string[];
        exports: string[];
        functions: string[];
        classes: string[];
    };
}

export async function runAnalysisPipeline(repoId: string, repoPath: string, cleanupFunction?: (() => Promise<void>) | null) {
    try {
        await dbConnect();

        // 3. Mark as scanning
        await Repository.findByIdAndUpdate(repoId, { status: 'scanning' });

        // 4. Scan files
        const scannedFiles = await scanDirectory(repoPath);

        // 5. Build parsed file records
        const PARSING_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

        await Repository.findByIdAndUpdate(repoId, {
            status: 'parsing',
            fileCount: scannedFiles.length,
        });

        const filesToProcess = scannedFiles.filter(f => PARSING_EXTENSIONS.has(f.extension)).map(f => ({
            ...f,
            fullPath: path.join(repoPath, f.path)
        }));
        const otherFiles = scannedFiles.filter(f => !PARSING_EXTENSIONS.has(f.extension));

        // Group files into chunks for workers
        const numWorkers = Math.min(os.cpus().length, 4) || 1;
        const workerChunkSize = Math.max(1, Math.ceil(filesToProcess.length / numWorkers));
        const chunks = [];
        for (let i = 0; i < filesToProcess.length; i += workerChunkSize) {
            chunks.push(filesToProcess.slice(i, i + workerChunkSize));
        }

        const workerPromises = chunks.map((chunk) => {
            return new Promise<WorkerFileResult[]>(async (resolve, reject) => {
                try {
                    // Dynamically eval to completely bypass Turbopack's static analysis crashing on worker_threads
                    const { Worker } = eval('require("node:worker_threads")');

                    const workerPath = path.resolve(process.cwd(), 'workers/parse-worker.js');
                    const worker = new Worker(workerPath, {
                        workerData: { files: chunk }
                    });

                    worker.on('message', resolve);
                    worker.on('error', reject);
                    worker.on('exit', (code: number) => {
                        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
                    });
                } catch (e) {
                    reject(e);
                }
            });
        });

        const workerResults = await Promise.all(workerPromises);
        const parsedFilesData = workerResults.flat();

        const filesToInsert = [];

        // Add the parsed files
        for (const data of parsedFilesData) {
            if (data.error) {
                console.warn(`Worker failed to parse file ${data.path}:`, data.error);
            }
            filesToInsert.push({
                repositoryId: repoId,
                path: data.path,
                name: data.name,
                extension: data.extension,
                type: 'file',
                loc: data.loc || 0,
                imports: data.parsed.imports,
                exports: data.parsed.exports,
                functions: data.parsed.functions,
                classes: data.parsed.classes,
            });
        }

        // Add the unparsed files (just basic metadata)
        for (const file of otherFiles) {
            filesToInsert.push({
                repositoryId: repoId,
                path: file.path,
                name: file.name,
                extension: file.extension,
                type: 'file',
                loc: 0,
                imports: [],
                exports: [],
                functions: [],
                classes: [],
            });
        }

        if (filesToInsert.length > 0) {
            // Chunking to avoid MongoDB document size limits on huge inserts
            const chunkSize = 500;
            for (let i = 0; i < filesToInsert.length; i += chunkSize) {
                await File.insertMany(filesToInsert.slice(i, i + chunkSize));
            }
        }

        // 6. Build the Dependency Graph and compute metrics
        const graphData = calculateGraph(filesToInsert as unknown as IFile[]);

        await AnalysisResult.create({
            repositoryId: repoId,
            nodes: graphData.nodes,
            edges: graphData.edges,
            metrics: graphData.metrics,
        });

        await Repository.findByIdAndUpdate(repoId, {
            status: 'complete',
            analyzedAt: new Date(),
        });

    } catch (err: unknown) {
        console.error('Analysis process failed:', err);
        const msg = err instanceof Error ? err.message : 'Unknown error occurred during analysis';
        await Repository.findByIdAndUpdate(repoId, {
            status: 'failed',
            errorMessage: msg
        });
    } finally {
        // 7. Cleanup temp files
        if (cleanupFunction) {
            await cleanupFunction();
        }
    }
}
