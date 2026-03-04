import dbConnect from '@/lib/db/connection';
import Repository from '@/lib/db/models/Repository';
import File, { IFile } from '@/lib/db/models/File';
import AnalysisResult from '@/lib/db/models/AnalysisResult';
import { scanDirectory } from '@/lib/analyzer/scanner';
import { parseFileContent } from '@/lib/analyzer/parser';
import { calculateGraph } from '@/lib/analyzer/graph/builder';
import path from 'node:path';
import fs from 'node:fs/promises';

export async function runAnalysisPipeline(repoId: string, repoPath: string, cleanupFunction?: (() => Promise<void>) | null) {
    try {
        await dbConnect();

        // 1. Mark as scanning
        await Repository.findByIdAndUpdate(repoId, { status: 'scanning' });

        // 2. Scan files
        const scannedFiles = await scanDirectory(repoPath);

        // 3. Build parsed file records
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

        // 4. Parse files inline (no worker threads — compatible with Vercel serverless)
        const filesToInsert = [];

        for (const file of filesToProcess) {
            try {
                const content = await fs.readFile(file.fullPath, 'utf-8');
                const parsed = parseFileContent(content, file.name);
                filesToInsert.push({
                    repositoryId: repoId,
                    path: file.path,
                    name: file.name,
                    extension: file.extension,
                    type: 'file',
                    loc: parsed.loc,
                    imports: parsed.imports,
                    exports: parsed.exports,
                    functions: parsed.functions,
                    classes: parsed.classes,
                });
            } catch (err) {
                console.warn(`Failed to parse file ${file.path}:`, err);
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

        // 5. Build the Dependency Graph and compute metrics
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
        // 6. Cleanup temp files
        if (cleanupFunction) {
            await cleanupFunction();
        }
    }
}
