'use client';

import { memo } from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';

function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style = {},
}: EdgeProps) {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 16,
    });

    const isHighlighted = data?.isHighlighted as boolean;
    const diffStatus = data?.diffStatus as 'added' | 'deleted' | 'unchanged' | undefined;

    let stroke = 'rgba(255,255,255,0.08)';
    let strokeWidth = 1;
    let strokeDasharray = undefined;
    let zIndex = 0;

    if (diffStatus === 'added') {
        stroke = '#10b981'; // Green
        strokeWidth = 2;
        zIndex = 10;
    } else if (diffStatus === 'deleted') {
        stroke = '#ef4444'; // Red
        strokeWidth = 2;
        strokeDasharray = '5,5'; // Dashed
        zIndex = 10;
    }

    // Hover highlight overrides it or brightens it
    if (isHighlighted) {
        stroke = diffStatus === 'deleted' ? '#f87171' : '#34d399';
        strokeWidth = 2;
        zIndex = 20;
    }

    return (
        <BaseEdge
            id={id}
            path={edgePath}
            style={{
                ...style,
                strokeWidth,
                stroke,
                strokeDasharray,
                zIndex,
                transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
            }}
            className={diffStatus === 'deleted' ? 'react-flow__edge-path-deleted' : ''}
        />
    );
}

export default memo(CustomEdge);
