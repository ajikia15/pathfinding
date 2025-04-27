import React from 'react';
import ForceGraph2D  from 'react-force-graph-2d';

const Graph = React.forwardRef(({ graphData, nodeColors, linkColors }, ref) => (
  <ForceGraph2D
    ref={ref}
    width={800}
    height={600}
    graphData={graphData}
    nodeId="id"
    nodeLabel="id"
    nodeCanvasObject={(node, ctx, globalScale) => {
      const color = nodeColors[node.id] || '#ccc';
      const size = 8;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font = `${12 / globalScale}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id, node.x, node.y - 12);
    }}
    linkWidth={link =>
      (linkColors[`${link.source.id}-${link.target.id}`] ||
       linkColors[`${link.target.id}-${link.source.id}`])
        ? 4
        : 1
    }
    linkColor={link =>
      linkColors[`${link.source.id}-${link.target.id}`] ||
      linkColors[`${link.target.id}-${link.source.id}`] ||
      '#999'
    }
  />
));

export default Graph;