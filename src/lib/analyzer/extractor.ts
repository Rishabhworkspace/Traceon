import { scanDirectory } from '@/lib/analyzer/scanner';
import { parseFileContent } from '@/lib/analyzer/parser';
import { calculateGraph } from '@/lib/analyzer/graph/builder';
import path from 'node:path';
import fs from 'node:fs/promises';
import { IFile } from '@/lib/db/models/File';
import { getTsconfig, createPathsMatcher } from 'get-tsconfig';

export async function extractGraphData(repoId: string, repoPath: string) {
    const scannedFiles = await scanDirectory(repoPath);

    const tsconfig = getTsconfig(repoPath);
    const pathsMatcher = tsconfig ? createPathsMatcher(tsconfig) : null;

    const PARSING_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.vue', '.svelte', '.html', '.css', '.scss', '.astro']);

    const filesToProcess = scannedFiles.filter(f => PARSING_EXTENSIONS.has(f.extension)).map(f => ({
        ...f,
        fullPath: path.join(repoPath, f.path)
    }));
    const otherFiles = scannedFiles.filter(f => !PARSING_EXTENSIONS.has(f.extension));

    const filesToReturn = [];

    // Parse AST/Regex files
    for (const file of filesToProcess) {
        try {
            const content = await fs.readFile(file.fullPath, 'utf-8');
            const parsed = parseFileContent(content, file.name);
            filesToReturn.push({
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
        } catch {
            filesToReturn.push({
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

    // Calculate basic LOC for non-parsed files
    for (const file of otherFiles) {
        let loc = 0;
        try {
            const fullPath = path.join(repoPath, file.path);
            const content = await fs.readFile(fullPath, 'utf-8');
            loc = content.split('\n').length;
        } catch {
            // Unreadable or binary file
            loc = 0;
        }

        filesToReturn.push({
            repositoryId: repoId,
            path: file.path,
            name: file.name,
            extension: file.extension,
            type: 'file',
            loc,
            imports: [],
            exports: [],
            functions: [],
            classes: [],
        });
    }

    const graphData = calculateGraph(filesToReturn as unknown as IFile[], pathsMatcher, repoPath);
    return { graphData, filesToReturn };
}
