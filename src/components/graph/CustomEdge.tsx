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

    return (
        <BaseEdge
            id={id}
            path={edgePath}
            style={{
                ...style,
                strokeWidth: isHighlighted ? 2 : 1,
                stroke: isHighlighted ? '#10b981' : 'rgba(255,255,255,0.08)',
                transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
            }}
        />
    );
}

export default memo(CustomEdge);
