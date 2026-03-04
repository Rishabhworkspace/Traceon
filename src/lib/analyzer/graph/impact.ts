import { IGraphNode, IGraphEdge } from '@/lib/db/models/AnalysisResult';

export interface ImpactResult {
    targetNodeId: string;
    targetLabel: string;
    impactScore: number;
    riskLevel: 'low' | 'moderate' | 'critical';
    directDependents: string[];
    transitiveDependents: string[];
    totalAffected: number;
    affectedNodes: string[];
}

/**
 * Perform reverse BFS from a target node to find all dependents.
 * "Dependents" = files that import the target (directly or transitively).
 */
function reverseBFS(
    targetId: string,
    nodes: IGraphNode[],
    edges: IGraphEdge[]
): { direct: string[]; transitive: string[]; allAffected: string[] } {
    // Build reverse adjacency: target -> [sources that import target]
    const reverseAdj = new Map<string, string[]>();
    for (const edge of edges) {
        if (!reverseAdj.has(edge.target)) reverseAdj.set(edge.target, []);
        reverseAdj.get(edge.target)!.push(edge.source);
    }

    const visited = new Set<string>();
    const direct: string[] = [];
    const transitive: string[] = [];
    const queue: { id: string; depth: number }[] = [];

    // Seed with the target node
    visited.add(targetId);
    const directSources = reverseAdj.get(targetId) || [];

    for (const src of directSources) {
        if (!visited.has(src)) {
            visited.add(src);
            direct.push(src);
            queue.push({ id: src, depth: 1 });
        }
    }

    // BFS for transitive dependents
    while (queue.length > 0) {
        const current = queue.shift()!;
        const neighbors = reverseAdj.get(current.id) || [];

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                transitive.push(neighbor);
                queue.push({ id: neighbor, depth: current.depth + 1 });
            }
        }
    }

    const allAffected = [...direct, ...transitive];
    return { direct, transitive, allAffected };
}

/**
 * Classify a file path to determine if it's a low-importance file type.
 * Config files, type declarations, and test files should not easily score critical.
 */
function isLowImportanceFile(filePath: string): boolean {
    const name = filePath.toLowerCase();
    return (
        name.includes('.config.') ||
        name.includes('.setup.') ||
        name.includes('.test.') ||
        name.includes('.spec.') ||
        name.includes('__test') ||
        name.includes('__mock') ||
        name.endsWith('.d.ts') ||
        name.endsWith('.json') ||
        name.includes('/types/') ||
        name.includes('/types.ts') ||
        name.includes('.css') ||
        name.includes('.scss')
    );
}

/**
 * Calculate an impact score for a given node.
 * 
 * The score uses a logarithmic scale for the affected-files ratio to prevent
 * small projects from inflating scores. It also accounts for:
 * - Direct vs transitive dependents (direct weigh more)
 * - Whether the target is a low-importance file (dampened score)
 * - Critical module overlap (small bonus, capped)
 * 
 * Score range: 0–100
 */
function calculateImpactScore(
    targetNode: IGraphNode,
    directCount: number,
    transitiveCount: number,
    totalNodes: number,
    criticalModules: string[],
    affectedNodes: string[]
): number {
    if (directCount === 0 && transitiveCount === 0) return 0;

    const totalAffected = directCount + transitiveCount;

    // --- Component 1: Direct dependents ratio (0–35 pts) ---
    // Use logarithmic scaling so a file with 2 direct deps in a 100-file project
    // doesn't score the same as one with 20 direct deps.
    const directRatio = directCount / totalNodes;
    const directScore = Math.min(35, Math.log1p(directRatio * 100) / Math.log1p(100) * 35);

    // --- Component 2: Transitive spread (0–30 pts) ---
    // Transitive dependents matter less per-file than direct; use sqrt scaling
    const transitiveRatio = transitiveCount / totalNodes;
    const transitiveScore = Math.min(30, Math.sqrt(transitiveRatio) * 30);

    // --- Component 3: Overall reach fraction (0–25 pts) ---
    // What fraction of the entire project is affected? Uses log scale.
    const reachRatio = totalAffected / totalNodes;
    const reachScore = Math.min(25, Math.log1p(reachRatio * 50) / Math.log1p(50) * 25);

    // --- Component 4: Critical module overlap (0–10 pts) ---
    const criticalAffected = affectedNodes.filter(id => criticalModules.includes(id)).length;
    const criticalScore = Math.min(10, criticalAffected * 2.5);

    let rawScore = directScore + transitiveScore + reachScore + criticalScore;

    // --- Dampening for low-importance file types ---
    if (isLowImportanceFile(targetNode.path)) {
        rawScore *= 0.5;
    }

    return Math.min(100, Math.round(rawScore * 10) / 10);
}

function getRiskLevel(score: number): 'low' | 'moderate' | 'critical' {
    if (score >= 60) return 'critical';
    if (score >= 30) return 'moderate';
    return 'low';
}

/**
 * Main entry: analyze the impact of changing a specific file.
 */
export function analyzeImpact(
    targetNodeId: string,
    nodes: IGraphNode[],
    edges: IGraphEdge[],
    criticalModules: string[]
): ImpactResult | null {
    const nodesMap = new Map<string, IGraphNode>();
    nodes.forEach((n) => nodesMap.set(n.id, n));

    const targetNode = nodesMap.get(targetNodeId);
    if (!targetNode) return null;

    const { direct, transitive, allAffected } = reverseBFS(targetNodeId, nodes, edges);

    const impactScore = calculateImpactScore(
        targetNode,
        direct.length,
        transitive.length,
        nodes.length,
        criticalModules,
        allAffected
    );
    const riskLevel = getRiskLevel(impactScore);

    return {
        targetNodeId,
        targetLabel: targetNode.label,
        impactScore,
        riskLevel,
        directDependents: direct,
        transitiveDependents: transitive,
        totalAffected: allAffected.length,
        affectedNodes: allAffected,
    };
}

/**
 * Generate full impact report for ALL nodes in the graph.
 * Returns sorted by impact score descending.
 */
export function generateFullImpactReport(
    nodes: IGraphNode[],
    edges: IGraphEdge[],
    criticalModules: string[]
): ImpactResult[] {
    const results: ImpactResult[] = [];

    for (const node of nodes) {
        const result = analyzeImpact(node.id, nodes, edges, criticalModules);
        if (result && result.totalAffected > 0) {
            results.push(result);
        }
    }

    // Sort by impact score descending
    results.sort((a, b) => b.impactScore - a.impactScore);
    return results;
}
