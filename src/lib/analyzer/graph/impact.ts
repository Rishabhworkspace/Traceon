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
 * Calculate an impact score for a given node.
 * Score is based on: number of dependents, their LOC, and whether critical modules are affected.
 */
function calculateImpactScore(
    targetNode: IGraphNode,
    affectedNodes: string[],
    nodesMap: Map<string, IGraphNode>,
    criticalModules: string[]
): number {
    if (affectedNodes.length === 0) return 0;

    const totalNodes = nodesMap.size;
    const affectedRatio = affectedNodes.length / totalNodes;

    // Weight by LOC of affected files
    let totalAffectedLOC = 0;
    let totalProjectLOC = 0;
    for (const [, node] of nodesMap) {
        totalProjectLOC += node.loc;
        if (affectedNodes.includes(node.id)) {
            totalAffectedLOC += node.loc;
        }
    }
    const locRatio = totalProjectLOC > 0 ? totalAffectedLOC / totalProjectLOC : 0;

    // Bonus if critical modules are affected
    const criticalAffected = affectedNodes.filter((id) => criticalModules.includes(id)).length;
    const criticalBonus = criticalAffected * 0.15;

    // Combined score (0–100)
    const rawScore = (affectedRatio * 40) + (locRatio * 40) + (criticalBonus * 20);
    return Math.min(100, Math.round(rawScore * 100) / 100);
}

function getRiskLevel(score: number): 'low' | 'moderate' | 'critical' {
    if (score >= 50) return 'critical';
    if (score >= 20) return 'moderate';
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

    const impactScore = calculateImpactScore(targetNode, allAffected, nodesMap, criticalModules);
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
