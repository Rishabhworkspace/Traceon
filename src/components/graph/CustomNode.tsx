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
    filePath: string;
    [key: string]: unknown;
}

function CustomNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
    const config = TYPE_CONFIG[data.nodeType] || TYPE_CONFIG.other;
    const Icon = config.icon;
    const isCritical = data.isCritical;
    const isHighlighted = data.isHighlighted;

    return (
        <div
            className="relative group"
            style={{
                background: isHighlighted ? config.bg : 'rgba(15,15,15,0.95)',
                border: `1.5px solid ${selected ? config.color : isHighlighted ? config.border : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '10px',
                padding: '10px 14px',
                minWidth: '140px',
                maxWidth: '220px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selected
                    ? `0 0 20px ${config.color}30, 0 0 40px ${config.color}10`
                    : isCritical
                        ? `0 0 12px ${config.color}20`
                        : '0 2px 8px rgba(0,0,0,0.3)',
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: config.color,
                    border: 'none',
                    width: 6,
                    height: 6,
                }}
            />

            <div className="flex items-center gap-2 mb-1.5">
                <div
                    style={{
                        background: config.bg,
                        border: `1px solid ${config.border}`,
                        borderRadius: '6px',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon size={12} style={{ color: config.color }} />
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
                    background: config.color,
                    border: 'none',
                    width: 6,
                    height: 6,
                }}
            />
        </div>
    );
}

export default memo(CustomNode);
