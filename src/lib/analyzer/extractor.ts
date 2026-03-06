import { scanDirectory } from '@/lib/analyzer/scanner';
import { parseFileContent } from '@/lib/analyzer/parser';
import { calculateGraph } from '@/lib/analyzer/graph/builder';
import { detectWorkspaces } from '@/lib/analyzer/workspace';
import path from 'node:path';
import fs from 'node:fs/promises';
import { IFile } from '@/lib/db/models/File';
import { getTsconfig, createPathsMatcher } from 'get-tsconfig';

// Cache matchers by tsconfig path
function getMatcherForFile(filePath: string, matcherCache: Map<string, ((id: string) => string[]) | null>) {
    try {
        const tsconfig = getTsconfig(path.dirname(filePath), 'tsconfig.json');
        if (!tsconfig) return null;

        if (matcherCache.has(tsconfig.path)) {
            return matcherCache.get(tsconfig.path);
        }
        const matcher = createPathsMatcher(tsconfig);
        matcherCache.set(tsconfig.path, matcher);
        return matcher;
    } catch (e) {
        console.warn(`[Traceon] Failed to load tsconfig near ${filePath}:`, e instanceof Error ? e.message : e);
        return null;
    }
}

export async function extractGraphData(repoId: string, repoPath: string) {
    const scannedFiles = await scanDirectory(repoPath);

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
                imports: parsed.imports, // We keep the raw imports and resolve later in calculateGraph
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

    // Detect monorepo workspace structure
    const workspaceInfo = await detectWorkspaces(repoPath);
    if (workspaceInfo.type !== 'none') {
        console.log(`[Traceon] Detected ${workspaceInfo.type} workspace with ${workspaceInfo.packages.length} packages`);
    }

    const matcherCache = new Map<string, ((id: string) => string[]) | null>();
    // Calculate Graph - resolveImportPath needs access to per-file matcher
    const graphData = calculateGraph(filesToReturn as unknown as IFile[], (id: string, basePath?: string) => {
        if (!basePath) return null;
        const matcher = getMatcherForFile(basePath, matcherCache);
        return matcher ? matcher(id) : null;
    }, repoPath, workspaceInfo.type !== 'none' ? workspaceInfo : null);
    return { graphData, filesToReturn };
}
