import path from 'node:path';
import { IFile } from '@/lib/db/models/File';
import { IGraphNode, IGraphEdge, IMetrics } from '@/lib/db/models/AnalysisResult';

export function determineNodeType(filePath: string): IGraphNode['type'] {
    const name = path.basename(filePath).toLowerCase();

    if (name.includes('index') || name.includes('main') || name.includes('app.ts')) {
        return 'entry';
    }
    if (filePath.includes('/components/') || name.endsWith('component.ts') || name.endsWith('.tsx') || name.endsWith('.jsx')) {
        return 'component';
    }
    if (filePath.includes('/utils/') || filePath.includes('/lib/') || filePath.includes('/helpers/')) {
        return 'utility';
    }
    if (name.includes('config') || name.endsWith('.json') || name.includes('setup')) {
        return 'config';
    }
    return 'module';
}

export function resolveImportPath(importerPath: string, rawImport: string, existingFiles: Map<string, IFile>): string | null {
    // Return null if external library (e.g. 'react', 'lodash')
    if (!rawImport.startsWith('.') && !rawImport.startsWith('/') && !rawImport.startsWith('@/')) {
        return null;
    }

    const dir = path.dirname(importerPath);
    let resolvedPath = '';

    if (rawImport.startsWith('@/')) {
        // Alias mapping (crudely basic mapping to src/ for now)
        resolvedPath = rawImport.replace(/^@\//, 'src/');
    } else if (rawImport.startsWith('/')) {
        resolvedPath = rawImport.substring(1); // Absolute to root
    } else {
        // Relative imports
        resolvedPath = path.join(dir, rawImport).replace(/\\/g, '/');
    }

    // Since node often omits extensions or uses index, we must try multiple combinations
    const candidates = [
        resolvedPath,
        `${resolvedPath}.ts`,
        `${resolvedPath}.tsx`,
        `${resolvedPath}.js`,
        `${resolvedPath}.jsx`,
        `${resolvedPath}/index.ts`,
        `${resolvedPath}/index.tsx`,
        `${resolvedPath}/index.js`,
        `${resolvedPath}/index.jsx`,
        `${resolvedPath}.json`
    ];

    for (const attempt of candidates) {
        if (existingFiles.has(attempt)) {
            return attempt;
        }
    }

    // Try stripping current extension or weird alias matches if needed...
    return null;
}

export function calculateGraph(files: IFile[]) {
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
            const targetPath = resolveImportPath(sourceId, rawImport, existingMap);

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
