import { IGraphNode, IGraphEdge, IMetrics } from '@/lib/db/models/AnalysisResult';

/**
 * Generate a structured architecture summary from graph data.
 * This produces a markdown-style summary that can be displayed directly or
 * further enhanced by an AI model.
 */
export function generateArchitectureSummary(
    nodes: IGraphNode[],
    edges: IGraphEdge[],
    metrics: IMetrics,
    repoName?: string
): string {
    const lines: string[] = [];

    const title = repoName || 'Repository';
    lines.push(`# Architecture Summary — ${title}`);
    lines.push('');

    // --- Overview ---
    lines.push('## Overview');
    lines.push(`This codebase contains **${metrics.totalFiles} files** with **${metrics.totalDependencies} dependency connections** (density: ${metrics.dependencyDensity.toFixed(2)} deps/file).`);
    lines.push('');

    // --- File Type Breakdown ---
    lines.push('## File Type Distribution');
    const sortedTypes = Object.entries(metrics.fileTypeDistribution)
        .sort(([, a], [, b]) => b - a);
    for (const [ext, count] of sortedTypes) {
        const pct = ((count / metrics.totalFiles) * 100).toFixed(1);
        lines.push(`- **.${ext}**: ${count} files (${pct}%)`);
    }
    lines.push('');

    // --- Architectural Layers ---
    lines.push('## Architectural Layers');
    const layerCounts: Record<string, number> = {};
    const layerFiles: Record<string, string[]> = {};
    for (const node of nodes) {
        const layer = node.type || 'other';
        layerCounts[layer] = (layerCounts[layer] || 0) + 1;
        if (!layerFiles[layer]) layerFiles[layer] = [];
        layerFiles[layer].push(node.path);
    }
    const layerLabels: Record<string, string> = {
        entry: '🟡 Entry Points',
        component: '🟣 Components / UI',
        utility: '🔵 Utilities / Libraries',
        module: '🟢 Modules',
        config: '🟠 Configuration',
        type: '⚪ Type Definitions',
        other: '⚫ Other',
    };
    for (const [layer, count] of Object.entries(layerCounts).sort(([, a], [, b]) => b - a)) {
        const label = layerLabels[layer] || layer;
        lines.push(`- **${label}**: ${count} files`);
    }
    lines.push('');

    // --- Critical Modules (Top Hub Files) ---
    lines.push('## Critical Modules');
    lines.push('These files have the highest connectivity and are architectural hotspots:');
    lines.push('');

    const topNodes = [...nodes]
        .sort((a, b) => (b.inDegree * 2 + b.outDegree) - (a.inDegree * 2 + a.outDegree))
        .slice(0, 10);

    for (const node of topNodes) {
        const total = node.inDegree + node.outDegree;
        if (total === 0) continue;
        lines.push(`- **\`${node.path}\`** — ${node.inDegree} dependents, ${node.outDegree} dependencies (${node.loc} LOC)`);
    }
    lines.push('');

    // --- Entry Points ---
    const entryPoints = nodes.filter(n => n.type === 'entry');
    if (entryPoints.length > 0) {
        lines.push('## Entry Points');
        lines.push('These files serve as the main entry points of the application:');
        lines.push('');
        for (const ep of entryPoints.slice(0, 15)) {
            lines.push(`- \`${ep.path}\` (${ep.loc} LOC)`);
        }
        lines.push('');
    }

    // --- Circular Dependencies ---
    if (metrics.circularDependencies.length > 0) {
        lines.push('## ⚠️ Circular Dependencies');
        lines.push(`Found **${metrics.circularDependencies.length}** circular dependency chain(s):`);
        lines.push('');
        for (const cycle of metrics.circularDependencies.slice(0, 5)) {
            lines.push(`- ${cycle.map(c => `\`${c}\``).join(' → ')}`);
        }
        lines.push('');
    }

    // --- Dependency Flow Summary ---
    lines.push('## Dependency Flow');
    const isolatedNodes = nodes.filter(n => n.inDegree === 0 && n.outDegree === 0);
    const leafNodes = nodes.filter(n => n.inDegree === 0 && n.outDegree > 0);
    const sinkNodes = nodes.filter(n => n.inDegree > 0 && n.outDegree === 0);
    const connectorNodes = nodes.filter(n => n.inDegree > 0 && n.outDegree > 0);

    lines.push(`- **Isolated files** (no connections): ${isolatedNodes.length}`);
    lines.push(`- **Leaf consumers** (only import, not imported): ${leafNodes.length}`);
    lines.push(`- **Pure providers** (only imported, don\'t import): ${sinkNodes.length}`);
    lines.push(`- **Connectors** (both import and are imported): ${connectorNodes.length}`);
    lines.push('');

    // --- Directory Clusters ---
    lines.push('## Directory Clusters');
    const dirCounts: Record<string, number> = {};
    for (const node of nodes) {
        const parts = node.path.split('/');
        const topDir = parts.length > 1 ? parts[0] : '(root)';
        dirCounts[topDir] = (dirCounts[topDir] || 0) + 1;
    }
    const sortedDirs = Object.entries(dirCounts).sort(([, a], [, b]) => b - a).slice(0, 15);
    for (const [dir, count] of sortedDirs) {
        lines.push(`- **${dir}/**: ${count} files`);
    }
    lines.push('');

    lines.push('---');
    lines.push(`*Generated by Traceon at ${new Date().toISOString()}*`);

    return lines.join('\n');
}
