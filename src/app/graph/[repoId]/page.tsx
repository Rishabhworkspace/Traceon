'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Loader2, ArrowLeft, FileText, Wrench } from 'lucide-react';

import CustomNode from '@/components/graph/CustomNode';
import CustomEdge from '@/components/graph/CustomEdge';
import FileInspector from '@/components/graph/FileInspector';
import GraphLegend from '@/components/graph/GraphLegend';
import GraphToolbar from '@/components/graph/GraphToolbar';
import ImpactPanel from '@/components/graph/ImpactPanel';
import AIChatPanel from '@/components/graph/AIChatPanel';
import ArchitecturePanel from '@/components/graph/ArchitecturePanel';
import RefactoringPanel from '@/components/graph/RefactoringPanel';
import TimelineSlider from '@/components/graph/TimelineSlider';

interface APIGraphNode {
    id: string;
    label: string;
    type: string;
    path: string;
    imports: string[];
    exports: string[];
    loc: number;
    inDegree: number;
    outDegree: number;
}

interface APIGraphEdge {
    source: string;
    target: string;
    relationship: string;
    weight: number;
}

interface APIMetrics {
    totalFiles: number;
    totalDependencies: number;
    dependencyDensity: number;
    criticalModules: string[];
    circularDependencies: string[][];
    fileTypeDistribution: Record<string, number>;
}

interface APIHistorySnapshot {
    commitHash: string;
    message: string;
    date: string;
    nodes: APIGraphNode[];
    edges: APIGraphEdge[];
}

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;

function getLayoutedElements(
    nodes: Node[],
    edges: Edge[],
    direction = 'TB'
) {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - NODE_WIDTH / 2,
                y: nodeWithPosition.y - NODE_HEIGHT / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
}

export default function GraphPage() {
    const params = useParams();
    const router = useRouter();
    const repoId = params.repoId as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const [rawNodes, setRawNodes] = useState<APIGraphNode[]>([]);
    const [history, setHistory] = useState<APIHistorySnapshot[]>([]);
    const [activeHistoryIndex, setActiveHistoryIndex] = useState<number | null>(null);

    const [metrics, setMetrics] = useState<APIMetrics | null>(null);
    const [selectedNode, setSelectedNode] = useState<APIGraphNode | null>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);
    const [isHeatmap, setIsHeatmap] = useState(false);
    const [impactOpen, setImpactOpen] = useState(false);
    const [archOpen, setArchOpen] = useState(false);
    const [refactorOpen, setRefactorOpen] = useState(false);

    // Fetch graph data
    useEffect(() => {
        window.scrollTo(0, 0); // Ensure page starts at the top
        if (!repoId) return;

        async function fetchGraph() {
            try {
                const res = await fetch(`/api/graph/${repoId}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.message || 'Failed to load graph');

                setRawNodes(data.data.nodes);
                setMetrics(data.data.metrics);

                // Support History Commits
                const allSnapshots = [
                    { commitHash: 'HEAD', message: 'Current Repository State', date: new Date().toISOString(), nodes: data.data.nodes, edges: data.data.edges },
                    ...(data.data.history || [])
                ];

                setHistory(allSnapshots);
                setRawNodes(allSnapshots[0].nodes);
                setActiveHistoryIndex(0); // HEAD
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchGraph();
    }, [repoId]);

    // Graph recalculation effect when history changes
    useEffect(() => {
        if (!history || history.length === 0 || activeHistoryIndex === null) return;

        const currentSnapshot = history[activeHistoryIndex];
        const prevSnapshot = history[activeHistoryIndex + 1]; // Older commit

        const targetNodes = currentSnapshot.nodes;
        const targetEdges = currentSnapshot.edges;

        const rfNodes: Node[] = [];
        const rfEdges: Edge[] = [];

        const criticalSet = new Set(metrics?.criticalModules || []);

        if (!prevSnapshot) {
            // No diffing possible, just render standard graph
            targetNodes.forEach((n: APIGraphNode) => rfNodes.push({
                id: n.id,
                type: 'custom',
                position: { x: 0, y: 0 },
                data: {
                    label: n.label,
                    nodeType: n.type,
                    loc: n.loc,
                    inDegree: n.inDegree,
                    outDegree: n.outDegree,
                    isCritical: criticalSet.has(n.id),
                    isHighlighted: false,
                    isHeatmap: false,
                    filePath: n.path,
                    diffStatus: 'unchanged'
                },
            }));

            targetEdges.forEach((e: APIGraphEdge, i: number) => rfEdges.push({
                id: `e-${i}`,
                source: e.source,
                target: e.target,
                type: 'custom',
                data: { isHighlighted: false, diffStatus: 'unchanged' },
                animated: false,
            }));
        } else {
            // Diff against older commit
            const baseEdgeSet = new Set(prevSnapshot.edges.map((e: APIGraphEdge) => `${e.source}->${e.target}`));
            const prevNodesMap = new Map(prevSnapshot.nodes.map((n: APIGraphNode) => [n.id, n]));

            let idCounter = 0;
            const targetNodeIds = new Set(targetNodes.map((n: APIGraphNode) => n.id));

            targetNodes.forEach((n: APIGraphNode) => {
                rfNodes.push({
                    id: n.id,
                    type: 'custom',
                    position: { x: 0, y: 0 },
                    data: {
                        label: n.label,
                        nodeType: n.type,
                        loc: n.loc,
                        inDegree: n.inDegree,
                        outDegree: n.outDegree,
                        isCritical: criticalSet.has(n.id),
                        isHighlighted: false,
                        isHeatmap: false,
                        filePath: n.path,
                        diffStatus: prevNodesMap.has(n.id) ? 'unchanged' : 'added'
                    },
                });
            });

            targetEdges.forEach((e: APIGraphEdge) => {
                const isAdded = !baseEdgeSet.has(`${e.source}->${e.target}`);
                rfEdges.push({
                    id: `e-${idCounter++}`,
                    source: e.source,
                    target: e.target,
                    type: 'custom',
                    data: { isHighlighted: false, diffStatus: isAdded ? 'added' : 'unchanged' },
                    animated: false,
                });
            });

            // Added deleted edges from previous snapshot
            const targetEdgeSet = new Set(targetEdges.map((e: APIGraphEdge) => `${e.source}->${e.target}`));
            for (const prevEdge of prevSnapshot.edges) {
                if (!targetEdgeSet.has(`${prevEdge.source}->${prevEdge.target}`)) {
                    // Deleted Edge! Include the nodes if they were completely deleted
                    [prevEdge.source, prevEdge.target].forEach(nodeId => {
                        if (!targetNodeIds.has(nodeId)) {
                            targetNodeIds.add(nodeId);
                            const oldNode = prevNodesMap.get(nodeId)!;
                            rfNodes.push({
                                id: oldNode.id,
                                type: 'custom',
                                position: { x: 0, y: 0 },
                                data: {
                                    label: oldNode.label,
                                    nodeType: oldNode.type,
                                    loc: oldNode.loc,
                                    inDegree: oldNode.inDegree,
                                    outDegree: oldNode.outDegree,
                                    isCritical: false,
                                    isHighlighted: false,
                                    isHeatmap: false,
                                    filePath: oldNode.path,
                                    diffStatus: 'deleted'
                                },
                            });
                        }
                    });

                    rfEdges.push({
                        id: `e-${idCounter++}`,
                        source: prevEdge.source,
                        target: prevEdge.target,
                        type: 'custom',
                        data: { isHighlighted: false, diffStatus: 'deleted' },
                        animated: true,
                    });
                }
            }
        }

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges);

        setRawNodes(rfNodes.map(n => ({ id: n.id, label: n.data.label as string, type: n.data.nodeType as string, path: n.data.filePath as string, imports: [], exports: [], loc: n.data.loc as number, inDegree: n.data.inDegree as number, outDegree: n.data.outDegree as number })));
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

    }, [activeHistoryIndex, history, metrics, setNodes, setEdges]);

    // Keep a ref to edges for hover lookups (avoids infinite loop)
    const edgesRef = useRef<Edge[]>([]);
    useEffect(() => {
        edgesRef.current = edges;
    }, [edges]);

    // Hover highlight connections
    useEffect(() => {
        if (!hoveredNodeId) {
            // Reset highlights
            setNodes((nds) =>
                nds.map((n) => ({
                    ...n,
                    data: { ...n.data, isHighlighted: false },
                }))
            );
            setEdges((eds) =>
                eds.map((e) => ({
                    ...e,
                    data: { ...e.data, isHighlighted: false },
                }))
            );
            return;
        }

        const currentEdges = edgesRef.current;
        const connectedEdges = currentEdges.filter(
            (e) => e.source === hoveredNodeId || e.target === hoveredNodeId
        );
        const connectedNodeIds = new Set<string>();
        connectedNodeIds.add(hoveredNodeId);
        connectedEdges.forEach((e) => {
            connectedNodeIds.add(e.source);
            connectedNodeIds.add(e.target);
        });
        const connectedEdgeIds = new Set(connectedEdges.map((e) => e.id));

        setNodes((nds) =>
            nds.map((n) => ({
                ...n,
                data: { ...n.data, isHighlighted: connectedNodeIds.has(n.id) },
            }))
        );
        setEdges((eds) =>
            eds.map((e) => ({
                ...e,
                data: { ...e.data, isHighlighted: connectedEdgeIds.has(e.id) },
            }))
        );
    }, [hoveredNodeId, setNodes, setEdges]);

    // Search & filter
    useEffect(() => {
        setNodes((nds) =>
            nds.map((n) => {
                const matchesSearch = !searchQuery || String(n.data.label || '').toLowerCase().includes(searchQuery.toLowerCase());
                const matchesFilter = !filterType || String(n.data.nodeType || '') === filterType;
                const visible = matchesSearch && matchesFilter;
                return {
                    ...n,
                    hidden: !visible,
                    style: { ...n.style, opacity: visible ? 1 : 0.1 },
                    data: { ...n.data, isHeatmap },
                };
            })
        );
    }, [searchQuery, filterType, isHeatmap, setNodes]);

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            const raw = rawNodes.find((n) => n.id === node.id);
            setSelectedNode(raw || null);
        },
        [rawNodes]
    );

    const onNodeMouseEnter = useCallback(
        (_: React.MouseEvent, node: Node) => {
            setHoveredNodeId(node.id);
        },
        []
    );

    const onNodeMouseLeave = useCallback(() => {
        setHoveredNodeId(null);
    }, []);

    const isCritical = useMemo(() => {
        if (!selectedNode || !metrics) return false;
        return metrics.criticalModules.includes(selectedNode.id);
    }, [selectedNode, metrics]);

    // Impact: highlight affected nodes on graph
    const handleImpactHighlight = useCallback((nodeIds: string[]) => {
        const set = new Set(nodeIds);
        setNodes((nds) =>
            nds.map((n) => ({
                ...n,
                data: { ...n.data, isHighlighted: set.has(n.id) },
            }))
        );
    }, [setNodes]);

    const handleClearImpactHighlight = useCallback(() => {
        setNodes((nds) =>
            nds.map((n) => ({
                ...n,
                data: { ...n.data, isHighlighted: false },
            }))
        );
    }, [setNodes]);

    // Locate a specific node on the graph (used by refactoring panel)
    const handleLocateNode = useCallback((nodeId: string) => {
        setNodes((nds) =>
            nds.map((n) => ({
                ...n,
                data: { ...n.data, isHighlighted: n.id === nodeId },
            }))
        );
    }, [setNodes]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#080808' }}>
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-sm text-gray-400 font-mono">Loading dependency graph...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#080808' }}>
                <p className="text-red-400 text-sm">{error}</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-[calc(100vh-3.5rem)] relative overflow-hidden" style={{ background: '#080808' }}>
            {/* Back button */}
            <button
                onClick={() => router.push('/dashboard')}
                className="absolute top-5 left-5 z-30 flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-lg px-3 py-2"
            >
                <ArrowLeft size={14} />
                Dashboard
            </button>

            {/* Phase 2 Action Buttons */}
            <div className="absolute top-5 left-40 z-30 flex items-center gap-2">
                <button
                    onClick={() => { setArchOpen(v => !v); setRefactorOpen(false); }}
                    className={`flex items-center gap-2 text-xs transition-colors bg-black/60 backdrop-blur-sm border rounded-lg px-3 py-2 ${archOpen ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 'text-gray-400 hover:text-white border-white/[0.06]'
                        }`}
                    title="Architecture Summary"
                >
                    <FileText size={14} />
                    Architecture
                </button>
                <button
                    onClick={() => { setRefactorOpen(v => !v); setArchOpen(false); }}
                    className={`flex items-center gap-2 text-xs transition-colors bg-black/60 backdrop-blur-sm border rounded-lg px-3 py-2 ${refactorOpen ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' : 'text-gray-400 hover:text-white border-white/[0.06]'
                        }`}
                    title="Refactoring Suggestions"
                >
                    <Wrench size={14} />
                    Refactor
                </button>
            </div>

            {/* Toolbar */}
            {metrics && (
                <GraphToolbar
                    totalFiles={metrics.totalFiles}
                    totalDeps={metrics.totalDependencies}
                    density={metrics.dependencyDensity}
                    circularCount={metrics.circularDependencies.length}
                    onSearch={setSearchQuery}
                    onFilterType={setFilterType}
                    activeFilter={filterType}
                    isHeatmap={isHeatmap}
                    onToggleHeatmap={setIsHeatmap}
                />
            )}

            {/* React Flow Canvas */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onNodeMouseEnter={onNodeMouseEnter}
                onNodeMouseLeave={onNodeMouseLeave}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.1}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.03)" />
                <Controls
                    showInteractive={false}
                    style={{
                        background: 'rgba(13,13,13,0.9)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                    }}
                />
                <MiniMap
                    style={{
                        background: 'rgba(13,13,13,0.9)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                        bottom: '90px', // Lifted slightly above the ChatPanel
                    }}
                    nodeColor={(node) => {
                        const type = node.data?.nodeType as string;
                        const colors: Record<string, string> = {
                            entry: '#f59e0b', component: '#8b5cf6', utility: '#06b6d4',
                            module: '#10b981', config: '#f97316', other: '#64748b',
                        };
                        return colors[type] || '#64748b';
                    }}
                    maskColor="rgba(0,0,0,0.7)"
                />
            </ReactFlow>

            {/* Legend */}
            <GraphLegend />

            {/* Impact Panel */}
            <ImpactPanel
                repoId={repoId}
                selectedNodeId={selectedNode?.id || null}
                onHighlightNodes={handleImpactHighlight}
                onClearHighlight={handleClearImpactHighlight}
                isOpen={impactOpen}
                onToggle={() => setImpactOpen((v) => !v)}
            />

            {/* Architecture Summary Panel */}
            <ArchitecturePanel
                repoId={repoId}
                isOpen={archOpen}
                onToggle={() => setArchOpen(false)}
            />

            {/* Refactoring Suggestions Panel */}
            <RefactoringPanel
                repoId={repoId}
                isOpen={refactorOpen}
                onToggle={() => setRefactorOpen(false)}
                onHighlightNode={handleLocateNode}
            />

            {/* File Inspector (hidden when impact panel is open) */}
            {!impactOpen && (
                <FileInspector
                    node={selectedNode}
                    isCritical={isCritical}
                    onClose={() => setSelectedNode(null)}
                />
            )}

            {/* Timeline Slider */}
            {activeHistoryIndex !== null && history && history.length > 1 && (
                <TimelineSlider
                    commits={history.map(h => ({ sha: h.commitHash, message: h.message, date: h.date }))}
                    selectedIndex={activeHistoryIndex}
                    onChange={setActiveHistoryIndex}
                />
            )}

            {/* AI Chat Panel */}
            <AIChatPanel repoId={repoId} />
        </div>
    );
}
