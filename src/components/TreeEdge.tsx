import React, { memo } from 'react';
import { EdgeProps, getSmoothStepPath } from 'reactflow';

// Custom 'Fork' or 'Orthogonal Tree' edge
// Draws a path: Source -> Down to Mid -> Horizontal -> Down to Target
const TreeEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) => {
    // Calculate the middle Y coordinate
    // We want the horizontal bar to be somewhere between the source and target
    // Usually 50% is good, or a fixed distance from source if we want a "bus"
    const midY = sourceY + 40; // Fixed drop of 40px from parent
    // Or: const midY = sourceY + (targetY - sourceY) / 2;

    // Path Construction
    // M (Move to Source)
    // L (Line down to MidY)
    // L (Line across to TargetX)
    // L (Line down to TargetY)

    // Note: sourceX is center of Node usually, but actually it's Handle position.
    // Our Handles: Source=Bottom, Target=Top.
    // So SourceY is bottom of parent, TargetY is top of child.

    // Refined MidY logic:
    // If SourceY and TargetY are close, 40px might be too much.
    // Take min(40, half distance)
    const distY = Math.abs(targetY - sourceY);
    const offset = Math.min(40, distY / 2);
    const midYFixed = sourceY + offset;

    const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midYFixed} L ${targetX} ${midYFixed} L ${targetX} ${targetY}`;

    return (
        <>
            <path
                id={id}
                style={style}
                className="react-flow__edge-path"
                d={path}
                markerEnd={markerEnd}
            />
        </>
    );
};

export default memo(TreeEdge);
