import dbConnect from '@/lib/db/connection';
import Repository from '@/lib/db/models/Repository';
import File from '@/lib/db/models/File';
import { cloneRepository } from '@/lib/analyzer/clone';
import { scanDirectory } from '@/lib/analyzer/scanner';
import { parseFileContent } from '@/lib/analyzer/parser';
import fs from 'fs/promises';
import path from 'path';

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

        const filesToInsert = [];

        for (const file of scannedFiles) {
            let loc = 0;
            let imports: string[] = [];
            let exports: string[] = [];
            let functions: string[] = [];
            let classes: string[] = [];

            try {
                const fullPath = path.join(repoPath, file.path);

                // Read and parse only JS/TS code files
                if (PARSING_EXTENSIONS.has(file.extension)) {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    const parsed = parseFileContent(content, file.name);

                    loc = parsed.loc;
                    imports = parsed.imports;
                    exports = parsed.exports;
                    functions = parsed.functions;
                    classes = parsed.classes;
                } else {
                    // Just count lines for other files if needed, or leave at 0
                    loc = 0;
                }
            } catch (err) {
                console.warn(`Failed to parse file ${file.path}:`, err);
            }

            filesToInsert.push({
                repositoryId: repoId,
                path: file.path,
                name: file.name,
                extension: file.extension,
                type: 'file',
                loc,
                imports,
                exports,
                functions,
                classes,
            });
        }

        if (filesToInsert.length > 0) {
            // Chunking to avoid MongoDB document size limits on huge inserts
            const chunkSize = 500;
            for (let i = 0; i < filesToInsert.length; i += chunkSize) {
                await File.insertMany(filesToInsert.slice(i, i + chunkSize));
            }
        }

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
