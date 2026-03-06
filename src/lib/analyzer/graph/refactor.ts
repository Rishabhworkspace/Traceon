import { IGraphNode, IGraphEdge, IMetrics } from '@/lib/db/models/AnalysisResult';

export interface GodObject {
    nodeId: string;
    label: string;
    path: string;
    nodeType: string;
    inDegree: number;
    outDegree: number;
    totalDegree: number;
    loc: number;
    severity: 'warning' | 'critical';
    reason: string;
    suggestion: string;
    dependents: string[];
    dependencies: string[];
}

export interface RefactoringSummary {
    godObjects: GodObject[];
    highCouplingPairs: { source: string; target: string; sharedDeps: number }[];
    totalIssues: number;
    healthScore: number; // 0-100, higher is better
}

/**
 * Detect "God Objects" — files with disproportionately high connectivity.
 * These are nodes whose total degree (inDegree + outDegree) is significantly
 * above the mean, making them fragile hotspots.
 */
function detectGodObjects(
    nodes: IGraphNode[],
    edges: IGraphEdge[],
    metrics: IMetrics
): GodObject[] {
    if (nodes.length === 0) return [];

    // Calculate mean and standard deviation of total degree
    const degrees = nodes.map(n => n.inDegree + n.outDegree);
    const mean = degrees.reduce((a, b) => a + b, 0) / degrees.length;
    const variance = degrees.reduce((a, d) => a + Math.pow(d - mean, 2), 0) / degrees.length;
    const stdDev = Math.sqrt(variance);

    // Threshold: mean + 1.5 * stdDev (or minimum of 5 for small projects)
    const threshold = Math.max(5, mean + 1.5 * stdDev);

    // Build adjacency maps
    const dependentsOf = new Map<string, string[]>();
    const dependenciesOf = new Map<string, string[]>();
    for (const edge of edges) {
        if (!dependentsOf.has(edge.target)) dependentsOf.set(edge.target, []);
        dependentsOf.get(edge.target)!.push(edge.source);

        if (!dependenciesOf.has(edge.source)) dependenciesOf.set(edge.source, []);
        dependenciesOf.get(edge.source)!.push(edge.target);
    }

    const godObjects: GodObject[] = [];

    for (const node of nodes) {
        const totalDegree = node.inDegree + node.outDegree;
        if (totalDegree < threshold) continue;

        // Skip config/json files — they're expected to be widely imported
        const ext = node.path.split('.').pop()?.toLowerCase() || '';
        if (['json', 'css', 'scss', 'svg', 'md'].includes(ext)) continue;

        const isCritical = totalDegree > mean + 3 * stdDev || totalDegree >= 20;
        const severity = isCritical ? 'critical' : 'warning';

        // Generate contextual reason and suggestion
        let reason: string;
        let suggestion: string;

        if (node.inDegree > node.outDegree * 3) {
            // Hub: many files depend on this one
            reason = `This file is imported by ${node.inDegree} other files, making it a central hub. Any change here cascades across the project.`;
            suggestion = `Consider splitting this into smaller, focused modules. Extract subsets of functionality into separate files (e.g., separate utilities, constants, or type definitions) to reduce blast radius.`;
        } else if (node.outDegree > node.inDegree * 3) {
            // Fan-out: this file imports too many things
            reason = `This file imports ${node.outDegree} other files, indicating it may be doing too much. High fan-out signals a "God module" that orchestrates everything.`;
            suggestion = `Consider applying the Facade pattern — create intermediate modules that group related imports, then import those facades instead. This reduces direct coupling.`;
        } else {
            // Balanced but very high overall
            reason = `This file has ${node.inDegree} dependents and ${node.outDegree} dependencies (${totalDegree} total connections), far above the project average of ${mean.toFixed(1)}.`;
            suggestion = `Extract shared logic into a dedicated utility layer. Consider the Single Responsibility Principle — this file likely handles multiple concerns that could be separated.`;
        }

        godObjects.push({
            nodeId: node.id,
            label: node.label,
            path: node.path,
            nodeType: node.type,
            inDegree: node.inDegree,
            outDegree: node.outDegree,
            totalDegree,
            loc: node.loc,
            severity,
            reason,
            suggestion,
            dependents: dependentsOf.get(node.id) || [],
            dependencies: dependenciesOf.get(node.id) || [],
        });
    }

    // Sort: critical first, then by total degree descending
    godObjects.sort((a, b) => {
        if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1;
        return b.totalDegree - a.totalDegree;
    });

    return godObjects;
}

/**
 * Detect highly coupled pairs — two files that share many common dependencies,
 * suggesting they might benefit from being merged or having shared logic extracted.
 */
function detectHighCouplingPairs(
    nodes: IGraphNode[],
    edges: IGraphEdge[]
): { source: string; target: string; sharedDeps: number }[] {
    // Build dependency sets per node
    const depsOf = new Map<string, Set<string>>();
    for (const edge of edges) {
        if (!depsOf.has(edge.source)) depsOf.set(edge.source, new Set());
        depsOf.get(edge.source)!.add(edge.target);
    }

    const pairs: { source: string; target: string; sharedDeps: number }[] = [];
    const nodeIds = Array.from(depsOf.keys());

    // Compare pairs (limit to top nodes by dependency count to avoid O(n²) explosion)
    const topNodes = nodeIds
        .map(id => ({ id, count: depsOf.get(id)!.size }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50) // Only check top 50 most-connected
        .map(n => n.id);

    for (let i = 0; i < topNodes.length; i++) {
        for (let j = i + 1; j < topNodes.length; j++) {
            const depsA = depsOf.get(topNodes[i])!;
            const depsB = depsOf.get(topNodes[j])!;

            let shared = 0;
            for (const dep of depsA) {
                if (depsB.has(dep)) shared++;
            }

            if (shared >= 3) {
                pairs.push({ source: topNodes[i], target: topNodes[j], sharedDeps: shared });
            }
        }
    }

    pairs.sort((a, b) => b.sharedDeps - a.sharedDeps);
    return pairs.slice(0, 10); // Top 10 pairs
}

/**
 * Calculate an overall codebase health score (0-100).
 * Higher is better. Penalize for god objects, circular deps, and high density.
 */
function calculateHealthScore(
    metrics: IMetrics,
    godObjectCount: number,
    couplingPairCount: number
): number {
    let score = 100;

    // Penalize for circular dependencies
    score -= Math.min(25, metrics.circularDependencies.length * 5);

    // Penalize for high dependency density
    if (metrics.dependencyDensity > 3) score -= 15;
    else if (metrics.dependencyDensity > 2) score -= 8;
    else if (metrics.dependencyDensity > 1.5) score -= 3;

    // Penalize for god objects
    score -= Math.min(30, godObjectCount * 6);

    // Penalize for high coupling pairs
    score -= Math.min(15, couplingPairCount * 3);

    return Math.max(0, Math.round(score));
}

/**
 * Main entry: generate a full refactoring analysis.
 */
export function generateRefactoringSuggestions(
    nodes: IGraphNode[],
    edges: IGraphEdge[],
    metrics: IMetrics
): RefactoringSummary {
    const godObjects = detectGodObjects(nodes, edges, metrics);
    const highCouplingPairs = detectHighCouplingPairs(nodes, edges);
    const healthScore = calculateHealthScore(metrics, godObjects.length, highCouplingPairs.length);

    return {
        godObjects,
        highCouplingPairs,
        totalIssues: godObjects.length + highCouplingPairs.length,
        healthScore,
    };
}
