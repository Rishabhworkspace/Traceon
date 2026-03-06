import path from 'node:path';
import { IFile } from '@/lib/db/models/File';
import { IGraphNode, IGraphEdge, IMetrics } from '@/lib/db/models/AnalysisResult';

export function determineNodeType(filePath: string): IGraphNode['type'] | 'type' {
    const name = path.basename(filePath).toLowerCase();
    const fullPath = filePath.toLowerCase();

    // 1. Next.js / React Entry Points
    if (
        name === 'page.tsx' || name === 'page.jsx' || name === 'page.js' ||
        name === 'layout.tsx' || name === 'layout.jsx' || name === 'layout.js' ||
        name === 'route.ts' || name === 'route.js' ||
        name === 'template.tsx' || name.startsWith('app.') || name === 'index.tsx' ||
        name === 'main.tsx' || name === 'main.ts' || name === 'index.ts' || name === 'server.ts'
    ) {
        return 'entry';
    }

    // 2. Components / UI
    if (
        fullPath.includes('/components/') || fullPath.includes('/ui/') || fullPath.includes('/views/') ||
        fullPath.includes('/pages/') || name.endsWith('component.ts') || name.endsWith('.tsx') || name.endsWith('.jsx') || name.endsWith('.vue') || name.endsWith('.svelte') || name.endsWith('.astro')
    ) {
        return 'component';
    }

    // 3. Types / Interfaces
    if (
        fullPath.includes('/types/') || fullPath.includes('/interfaces/') || name.endsWith('.d.ts') || name.includes('types.ts')
    ) {
        return 'type' as any; // Using 'any' since interface IGraphNode['type'] might not literally allow 'type' yet, but frontend handles fallback types.
    }

    // 4. Utilities / Lib
    if (
        fullPath.includes('/utils/') || fullPath.includes('/lib/') || fullPath.includes('/helpers/') ||
        fullPath.includes('/services/') || fullPath.includes('/hooks/') || fullPath.includes('/context/') ||
        fullPath.includes('/store/') || fullPath.includes('/actions/') || fullPath.includes('/controllers/')
    ) {
        return 'utility';
    }

    // 5. Config
    if (
        name.includes('config') || name.endsWith('.json') || name.includes('setup') || name === '.env' || name.includes('middleware') || name.includes('theme')
    ) {
        return 'config';
    }

    return 'module';
}

export function resolveImportPath(
    importerPath: string,
    rawImport: string,
    existingFiles: Map<string, IFile>,
    pathsMatcher?: ((id: string, basePath?: string) => string[] | null) | null,
    repoPath?: string
): string | null {
    // Return null if obvious external library (e.g. 'react', 'lodash')
    // We allow absolute-looking imports (like 'components/Button') to pass down for fallback checks
    if (!rawImport.startsWith('.') && !rawImport.startsWith('/') && !rawImport.startsWith('@/') && !rawImport.startsWith('~/')) {
        // It might be external, OR it might be an absolute path from baseUrl like 'src/components/...'
    }

    // Strip out suffix loaders (e.g. import logo from './logo.svg?url')
    let cleanImport = rawImport.split('?')[0];

    // Strip out extensions inside the import string to normalize attempts
    cleanImport = cleanImport.replace(/\.(ts|tsx|js|jsx)$/, '');

    const dir = path.dirname(importerPath);
    const attemptPaths: string[] = [];

    // 1. Precise Alias resolution using get-tsconfig if available
    let wasResolvedByTsConfig = false;
    if (pathsMatcher && repoPath) {
        // Try passing the raw import through the alias matcher
        const absoluteImporterPath = path.join(repoPath, importerPath);
        const tsconfigMatches = pathsMatcher(rawImport, absoluteImporterPath);
        if (tsconfigMatches && tsconfigMatches.length > 0) {
            // tsconfigMatches returns ABSOLUTE paths on the disk based on the tsconfig location.
            // Our "existingFiles" holds RELATIVE paths from the repo root.
            for (const absoluteMatch of tsconfigMatches) {
                // Convert absolute mapped path to repo-relative
                const relFromRoot = path.relative(repoPath, absoluteMatch).replace(/\\/g, '/');

                // Add exact match, as well as stripped versions in case it points to a dir
                const strippedRel = relFromRoot.replace(/\.(ts|tsx|js|jsx)$/, '');
                attemptPaths.push(strippedRel);
                wasResolvedByTsConfig = true;
            }
        }
    }

    if (!wasResolvedByTsConfig) {
        if (cleanImport.startsWith('@/') || cleanImport.startsWith('~/')) {
            // Very common aliases for 'src/' or root
            const stripped = cleanImport.substring(2);
            attemptPaths.push(`src/${stripped}`);
            attemptPaths.push(`app/${stripped}`);
            attemptPaths.push(stripped); // From root
        } else if (cleanImport.startsWith('/')) {
            attemptPaths.push(cleanImport.substring(1)); // Absolute to root
        } else if (cleanImport.startsWith('.')) {
            // Relative imports
            attemptPaths.push(path.join(dir, cleanImport).replace(/\\/g, '/'));
        } else {
            // Looks like 'utils/math', external module 'lodash', or an implicit relative like 'style.css'
            attemptPaths.push(cleanImport);
            attemptPaths.push(path.join(dir, cleanImport).replace(/\\/g, '/')); // Implicit relative
            attemptPaths.push(`src/${cleanImport}`);
            attemptPaths.push(`lib/${cleanImport}`);
        }
    }

    // Since node often omits extensions or uses index, we must try multiple combinations for EVERY attempt path
    const candidates = new Set<string>();

    for (const baseAttempt of attemptPaths) {
        candidates.add(baseAttempt);
        candidates.add(`${baseAttempt}.ts`);
        candidates.add(`${baseAttempt}.tsx`);
        candidates.add(`${baseAttempt}.js`);
        candidates.add(`${baseAttempt}.jsx`);
        candidates.add(`${baseAttempt}.d.ts`);
        candidates.add(`${baseAttempt}/index.ts`);
        candidates.add(`${baseAttempt}/index.tsx`);
        candidates.add(`${baseAttempt}/index.js`);
        candidates.add(`${baseAttempt}/index.jsx`);
        candidates.add(`${baseAttempt}.json`);
        candidates.add(`${baseAttempt}.css`); // For style imports
        candidates.add(`${baseAttempt}.scss`);
        candidates.add(`${baseAttempt}.vue`);
        candidates.add(`${baseAttempt}.svelte`);
        candidates.add(`${baseAttempt}.astro`);
        candidates.add(`${baseAttempt}.svg`);
    }

    for (const attempt of candidates) {
        if (existingFiles.has(attempt)) {
            return attempt;
        }
    }

    // Final fallback: If we still haven't found it, do a fuzzy search against all existing keys across the repo.
    // E.g. raw import '@core/utils/math' might map exactly to 'packages/core/src/utils/math.ts'
    if (cleanImport.length > 2) {
        const fuzzyTarget = cleanImport.startsWith('@/') || cleanImport.startsWith('~/')
            ? cleanImport.substring(2)
            : cleanImport;

        // Skip fuzzy matching for obvious external libraries (no path separators) unless it's a known internal alias
        const isExternalLike = !rawImport.startsWith('.') && !rawImport.startsWith('/') && !rawImport.startsWith('@/') && !rawImport.startsWith('~/');
        const hasPathChars = fuzzyTarget.includes('/');

        if (!isExternalLike || hasPathChars) {
            // Look for the end of the paths
            for (const [existingPath] of existingFiles.entries()) {
                // Strip extension from existing path for matching
                const existingNoExt = existingPath.replace(/\.[^/.]+$/, "");

                // Ensure strict suffix matching by checking if next char to the left is a slash
                if (
                    existingNoExt === fuzzyTarget ||
                    existingPath === fuzzyTarget ||
                    existingNoExt.endsWith(`/${fuzzyTarget}`) ||
                    existingPath.endsWith(`/${fuzzyTarget}`)
                ) {
                    return existingPath;
                }
            }
        }
    }

    return null;
}

export function calculateGraph(
    files: IFile[],
    pathsMatcher?: ((id: string, basePath?: string) => string[] | null) | null,
    repoPath?: string
) {
    const existingMap = new Map<string, IFile>();
    files.forEach(f => existingMap.set(f.path, f));

    const nodesMap = new Map<string, IGraphNode>();
    const edges: IGraphEdge[] = [];

    let totalDependencies = 0;

    // 1. Build Base Nodes
    for (const file of files) {
        nodesMap.set(file.path, {
            id: file.path,
            label: path.basename(file.path),
            type: determineNodeType(file.path),
            path: file.path,
            imports: file.imports,
            exports: file.exports,
            loc: file.loc,
            inDegree: 0,
            outDegree: 0
        });
    }

    // 2. Resolve Edges & Update Degrees
    for (const file of files) {
        const sourceId = file.path;

        // Track unique targets from this file to avoid duplicate edges
        const uniqueTargets = new Set<string>();

        // We assume "file.imports" holds raw import strings
        for (const rawImport of file.imports) {
            const targetPath = resolveImportPath(sourceId, rawImport, existingMap, pathsMatcher, repoPath);

            // If it resolves to an internal file, draw an edge
            if (targetPath && targetPath !== sourceId) {
                uniqueTargets.add(targetPath);
            }
        }

        for (const targetId of uniqueTargets) {
            edges.push({
                source: sourceId,
                target: targetId,
                relationship: 'imports',
                weight: 1
            });
            totalDependencies++;

            // Update Degrees
            const sourceNode = nodesMap.get(sourceId);
            const targetNode = nodesMap.get(targetId);

            if (sourceNode) sourceNode.outDegree += 1;
            if (targetNode) targetNode.inDegree += 1;
        }
    }

    const nodes = Array.from(nodesMap.values());

    // 3. Identify Critical Modules (Top 5% files by inDegree + outDegree)
    const sortedByImpact = [...nodes].sort((a, b) => {
        const scoreA = a.inDegree * 2 + a.outDegree;
        const scoreB = b.inDegree * 2 + b.outDegree;
        return scoreB - scoreA; // Descending
    });

    const criticalCount = Math.max(1, Math.ceil(nodes.length * 0.05));
    const criticalModules = sortedByImpact.slice(0, criticalCount).map(n => n.id);

    // 4. File Type Distribution
    const distribution: Record<string, number> = {};
    for (const file of files) {
        let ext = file.extension || 'none';
        if (ext.startsWith('.')) ext = ext.substring(1);
        if (!ext) ext = 'none';

        distribution[ext] = (distribution[ext] || 0) + 1;
    }

    // 5. Detect Circular Dependencies (DFS)
    const circularDependencies: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const dfsPathArr: string[] = [];

    // Quick map for adjacency
    const adjMap = new Map<string, string[]>();
    for (const edge of edges) {
        if (!adjMap.has(edge.source)) adjMap.set(edge.source, []);
        adjMap.get(edge.source)!.push(edge.target);
    }

    function dfs(nodeId: string) {
        if (recStack.has(nodeId)) {
            // Cycle found! Extract the cycle path
            const cycleStartIndex = dfsPathArr.indexOf(nodeId);
            if (cycleStartIndex !== -1) {
                const cycle = dfsPathArr.slice(cycleStartIndex).concat(nodeId);
                circularDependencies.push(cycle);
            }
            return;
        }

        if (visited.has(nodeId)) return;

        visited.add(nodeId);
        recStack.add(nodeId);
        dfsPathArr.push(nodeId);

        const neighbors = adjMap.get(nodeId) || [];
        for (const neighbor of neighbors) {
            dfs(neighbor);
        }

        dfsPathArr.pop();
        recStack.delete(nodeId);
    }

    // Run DFS starting from every node to ensure forest covering
    for (const node of nodes) {
        if (!visited.has(node.id)) {
            dfs(node.id);
        }
    }

    // Keep top max 20 unique cycles to prevent payload blowup
    const uniqueCyclesMap = new Map<string, string[]>();
    for (const cycle of circularDependencies) {
        const key = [...new Set(cycle)].sort().join('|');
        if (!uniqueCyclesMap.has(key)) {
            uniqueCyclesMap.set(key, cycle);
        }
        if (uniqueCyclesMap.size >= 20) break;
    }
    const finalCycles = Array.from(uniqueCyclesMap.values());

    const metrics: IMetrics = {
        totalFiles: nodes.length,
        totalDependencies,
        dependencyDensity: nodes.length ? totalDependencies / nodes.length : 0,
        criticalModules,
        circularDependencies: finalCycles,
        fileTypeDistribution: distribution
    };

    return { nodes, edges, metrics };
}
