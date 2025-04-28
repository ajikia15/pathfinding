import React, { useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

// Use theme colors defined in App.css
const COLOR_PATH = "#ef4444"; // var(--danger)
const COLOR_EXPANDING = "#f59e0b"; // var(--warning)
const COLOR_VISITED = "#22c55e"; // var(--success)
const COLOR_START_GOAL = "#6366f1"; // var(--info)
const COLOR_DEFAULT_NODE_BG = "#2a2a2a"; // var(--bg-tertiary)
const COLOR_DEFAULT_NODE_BORDER = "#383838"; // var(--border-color)
const COLOR_DEFAULT_LINK = "#6b7280"; // gray-500
const COLOR_TEXT_NODE = "#e0e0e0"; // var(--text-primary)
const COLOR_TEXT_HEURISTIC = "#0ea5e9"; // var(--accent-primary)
const COLOR_TEXT_LINK = "#121212"; // var(--bg-primary)

function GraphVisualizer({
  graph,
  path,
  visited = [],
  expanding = null,
  startNode = null,
  endNode = null,
}) {
  const fgRef = useRef();

  // --- Combine old and new: Use more reasonable force settings and auto-zoom only on mount ---
  useEffect(() => {
    if (fgRef.current) {
      // Use more compact forces for better visibility
      fgRef.current.d3Force("charge").strength(-350); // Less repulsion
      fgRef.current.d3Force("center").strength(0.1); // Centering
      fgRef.current.d3Force("link").distance(80); // Closer nodes
      fgRef.current.d3ReheatSimulation();
      // Only zoom to fit on first mount or when node count changes
      fgRef.current.zoomToFit(200, 80);
    }
  }, [graph.nodes.length]);

  // Identify links that are part of the final path
  const pathLinks = new Set();
  if (path && path.length > 1) {
    for (let i = 0; i < path.length - 1; ++i) {
      const a = path[i],
        b = path[i + 1];
      const link = graph.links.find((l) => {
        const src = typeof l.source === "object" ? l.source.id : l.source;
        const tgt = typeof l.target === "object" ? l.target.id : l.target;
        return (src === a && tgt === b) || (src === b && tgt === a);
      });
      if (link) pathLinks.add(link);
    }
  }

  return (
    <div className="graph-area">
      <ForceGraph2D
        ref={fgRef}
        graphData={graph}
        nodeLabel={(n) => `${n.id} (h=${n.h})`}
        linkLabel={(l) => `cost=${l.cost}`}
        nodeRelSize={5}
        d3VelocityDecay={0.35}
        linkWidth={(l) => (pathLinks.has(l) ? 3 : 1.2)}
        width={window.innerWidth > 1200 ? 1200 : window.innerWidth - 60}
        height={600}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // --- Use old style: white circle, colored border, label above, heuristic below ---
          const label = node.id;
          const fontSize = 12 / globalScale;
          const nodeSize = 20;
          let nodeColor = COLOR_DEFAULT_NODE_BG;
          let borderColor = COLOR_DEFAULT_NODE_BORDER;
          let textColor = COLOR_TEXT_NODE;
          let hasGlow = false;
          if (node.id === startNode || node.id === endNode) {
            nodeColor = COLOR_START_GOAL;
            borderColor = COLOR_START_GOAL;
            hasGlow = true;
          } else if (path.includes(node.id)) {
            nodeColor = COLOR_PATH;
            borderColor = COLOR_PATH;
            hasGlow = true;
          } else if (expanding === node.id) {
            nodeColor = COLOR_EXPANDING;
            borderColor = COLOR_EXPANDING;
            hasGlow = true;
          } else if (visited.includes(node.id)) {
            nodeColor = COLOR_VISITED;
            borderColor = COLOR_VISITED;
          }
          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize / 2, 0, 2 * Math.PI, false);
          ctx.fillStyle = nodeColor;
          if (hasGlow) {
            ctx.shadowColor = borderColor;
            ctx.shadowBlur = 12;
          }
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 2 / globalScale;
          ctx.stroke();
          // Draw label above node
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = textColor;
          ctx.fillText(label, node.x, node.y - nodeSize / 2 - 2);
          // Draw heuristic below node
          ctx.textBaseline = "top";
          ctx.font = `${fontSize * 0.9}px Inter, sans-serif`;
          ctx.fillStyle = COLOR_TEXT_HEURISTIC;
          ctx.fillText(`h=${node.h}`, node.x, node.y + nodeSize / 2 + 2);
        }}
        linkColor={(l) => (pathLinks.has(l) ? COLOR_PATH : COLOR_DEFAULT_LINK)}
        linkCanvasObjectMode={() => "after"}
        linkCanvasObject={(link, ctx, globalScale) => {
          // --- Use old style: cost label above the link ---
          const fontSize = 8 / globalScale;
          const label = `${link.cost}`;
          const start =
            typeof link.source === "object"
              ? link.source
              : graph.nodes.find((n) => n.id === link.source);
          const end =
            typeof link.target === "object"
              ? link.target
              : graph.nodes.find((n) => n.id === link.target);
          if (!start || !end || !start.x || !end.x) return;
          const textPos = {
            x: start.x + (end.x - start.x) * 0.5,
            y: start.y + (end.y - start.y) * 0.5 - 8 / globalScale,
          };
          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fillRect(textPos.x - 10, textPos.y - fontSize, 20, fontSize * 2);
          ctx.fillStyle = COLOR_TEXT_LINK;
          ctx.fillText(label, textPos.x, textPos.y);
        }}
      />
    </div>
  );
}

export default GraphVisualizer;
