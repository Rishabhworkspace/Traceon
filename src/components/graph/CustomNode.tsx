'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileCode2, Box, Wrench, Layout, Settings, File } from 'lucide-react';

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
    entry: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.35)', icon: Box },
    component: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.35)', icon: Layout },
    utility: { color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.35)', icon: Wrench },
    module: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.35)', icon: FileCode2 },
    config: { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.35)', icon: Settings },
    other: { color: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.35)', icon: File },
};

interface CustomNodeData {
    label: string;
    nodeType: string;
    loc: number;
    inDegree: number;
    outDegree: number;
    isCritical: boolean;
    isHighlighted: boolean;
    isHeatmap?: boolean;
    diffStatus?: 'added' | 'deleted' | 'unchanged';
    filePath: string;
    packageName?: string;
    packageColor?: string;
    [key: string]: unknown;
}

function CustomNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
    const config = TYPE_CONFIG[data.nodeType] || TYPE_CONFIG.other;
    const Icon = config.icon;
    const isCritical = data.isCritical;
    const isHighlighted = data.isHighlighted;
    const isHeatmap = data.isHeatmap;
    const diffStatus = data.diffStatus;

    // Calculate complexity score (0.0 to 1.0 roughly)
    const rawScore = (data.loc / 300) + (data.inDegree * 0.1) + (data.outDegree * 0.1);
    const score = Math.min(1, Math.max(0, rawScore));

    // Hot gradient: blue -> green -> yellow -> red
    const heatmapColor = `hsl(${((1 - score) * 240).toString(10)}, 80%, 50%)`;
    let activeColor = isHeatmap ? heatmapColor : config.color;
    let activeBg = isHeatmap ? `${heatmapColor.slice(0, -1)}, 0.15)` : config.bg;
    const activeHighlightBg = isHeatmap ? `${heatmapColor.slice(0, -1)}, 0.25)` : config.bg;
    let activeBorder = isHeatmap ? `${heatmapColor.slice(0, -1)}, 0.4)` : config.border;
    let borderStyle = 'solid';
    let opacity = 1;

    // Override for diff status
    if (diffStatus === 'added') {
        activeColor = '#10b981'; // Emerald/Green
        activeBg = 'rgba(16,185,129,0.1)';
        activeBorder = 'rgba(16,185,129,0.6)';
    } else if (diffStatus === 'deleted') {
        activeColor = '#ef4444'; // Red
        activeBg = 'rgba(239,68,68,0.05)';
        activeBorder = 'rgba(239,68,68,0.5)';
        borderStyle = 'dashed';
        opacity = 0.7;
    }

    return (
        <div
            className="relative group"
            style={{
                opacity,
                background: isHighlighted ? activeHighlightBg : 'rgba(15,15,15,0.95)',
                border: `1.5px ${borderStyle} ${selected ? activeColor : isHighlighted || isHeatmap || diffStatus !== 'unchanged' ? activeBorder : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '10px',
                padding: '10px 14px',
                minWidth: '140px',
                maxWidth: '220px',
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                boxShadow: selected
                    ? `0 0 20px ${activeColor.replace('hsl', 'hsla').replace(')', ', 0.3)')}, 0 0 40px ${activeColor.replace('hsl', 'hsla').replace(')', ', 0.1)')}`
                    : (isCritical || isHeatmap || diffStatus === 'added')
                        ? `0 0 12px ${activeColor.replace('hsl', 'hsla').replace(')', ', 0.2)')}`
                        : '0 2px 8px rgba(0,0,0,0.3)',
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: activeColor,
                    border: 'none',
                    width: 6,
                    height: 6,
                }}
            />

            <div className="flex items-center gap-2 mb-1.5">
                <div
                    style={{
                        background: activeBg,
                        border: `1px solid ${activeBorder}`,
                        borderRadius: '6px',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.4s ease',
                    }}
                >
                    <Icon size={12} style={{ color: activeColor, transition: 'all 0.4s ease' }} />
                </div>
                <span
                    className="text-xs font-semibold truncate"
                    style={{ color: '#e2e8f0', maxWidth: '150px' }}
                    title={data.label}
                >
                    {data.label}
                </span>
            </div>

            <div className="flex items-center gap-3 text-[10px]" style={{ color: '#94a3b8' }}>
                <span>{data.loc} LOC</span>
                <span>↓{data.inDegree}</span>
                <span>↑{data.outDegree}</span>
            </div>

            {data.packageName && (
                <div className="flex items-center gap-1.5 mt-1.5">
                    <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: data.packageColor || '#64748b' }}
                    />
                    <span className="text-[8px] font-mono truncate" style={{ color: '#94a3b8', maxWidth: '150px' }}>
                        {data.packageName}
                    </span>
                </div>
            )}

            {isCritical && (
                <div
                    style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: '#ef4444',
                        border: '2px solid #0f0f0f',
                    }}
                    title="Critical Module"
                />
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: activeColor,
                    border: 'none',
                    width: 6,
                    height: 6,
                }}
            />
        </div>
    );
}

export default memo(CustomNode);
