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
import { Loader2, ArrowLeft } from 'lucide-react';

import CustomNode from '@/components/graph/CustomNode';
import CustomEdge from '@/components/graph/CustomEdge';
import FileInspector from '@/components/graph/FileInspector';
import GraphLegend from '@/components/graph/GraphLegend';
import GraphToolbar from '@/components/graph/GraphToolbar';
import ImpactPanel from '@/components/graph/ImpactPanel';
import AIChatPanel from '@/components/graph/AIChatPanel';

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
    const [metrics, setMetrics] = useState<APIMetrics | null>(null);
    const [selectedNode, setSelectedNode] = useState<APIGraphNode | null>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);
    const [isHeatmap, setIsHeatmap] = useState(false);
    const [impactOpen, setImpactOpen] = useState(false);

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

                const criticalSet = new Set(data.data.metrics.criticalModules);

                // Build React Flow nodes
                const rfNodes: Node[] = data.data.nodes.map((n: APIGraphNode) => ({
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
                    },
                }));

                // Build React Flow edges
                const rfEdges: Edge[] = data.data.edges.map((e: APIGraphEdge, i: number) => ({
                    id: `e-${i}`,
                    source: e.source,
                    target: e.target,
                    type: 'custom',
                    data: { isHighlighted: false },
                    animated: false,
                }));

                // Apply dagre layout
                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges);

                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchGraph();
    }, [repoId, setNodes, setEdges]);

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
        <div className="w-full h-screen relative" style={{ background: '#080808' }}>
            {/* Back button */}
            <button
                onClick={() => router.push('/dashboard')}
                className="absolute top-5 left-5 z-30 flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-lg px-3 py-2"
            >
                <ArrowLeft size={14} />
                Dashboard
            </button>

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

            {/* File Inspector (hidden when impact panel is open) */}
            {!impactOpen && (
                <FileInspector
                    node={selectedNode}
                    isCritical={isCritical}
                    onClose={() => setSelectedNode(null)}
                />
            )}

            {/* AI Chat Panel */}
            <AIChatPanel repoId={repoId} />
        </div>
    );
}
