import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import Repository from '@/lib/db/models/Repository';
import File from '@/lib/db/models/File';
import { cloneRepository } from '@/lib/analyzer/clone';
import { scanDirectory } from '@/lib/analyzer/scanner';
import { parseFileContent } from '@/lib/analyzer/parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { repoUrl, sessionId: clientSessionId } = await req.json();

        if (!repoUrl || typeof repoUrl !== 'string') {
            return NextResponse.json({ message: 'Valid repository URL is required' }, { status: 400 });
        }

        // Basic GitHub URL validation
        const githubRegex = /^https:\/\/github\.com\/([\w-]+)\/([\w-.]+)(?:\.git)?$/;
        const match = repoUrl.match(githubRegex);

        if (!match) {
            return NextResponse.json({ message: 'Must be a valid GitHub repository URL' }, { status: 400 });
        }

        const owner = match[1];
        let name = match[2];
        if (name.endsWith('.git')) {
            name = name.slice(0, -4);
        }

        // Connect to database
        await dbConnect();

        // Generate or use existing sessionId for guest users
        const sessionId = session?.user?.id ? null : (clientSessionId || uuidv4());
        const userId = session?.user?.id || null;

        // Create the initial repository record
        const repository = await Repository.create({
            userId,
            repoUrl,
            name,
            owner,
            status: 'pending',
            sessionId,
        });

        // Start background processing immediately but don't await this promise fully
        startAnalysis(repository._id.toString(), repoUrl).catch(err => {
            console.error('Background analysis failed entirely:', err);
        });

        return NextResponse.json({
            success: true,
            repositoryId: repository._id,
            sessionId,
        }, { status: 202 });

    } catch (error: unknown) {
        console.error('Analyze trigger error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal server error', error: msg }, { status: 500 });
    }
}

// Fire and forget function to handle cloning and scanning
async function startAnalysis(repoId: string, url: string) {
    let cleanupFunction: (() => Promise<void>) | null = null;
    try {
        // 1. Mark as cloning
        await Repository.findByIdAndUpdate(repoId, { status: 'cloning' });

        // 2. Clone the repository
        const cloneResult = await cloneRepository(url);
        cleanupFunction = cloneResult.cleanup;
        const { repoPath } = cloneResult;

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
