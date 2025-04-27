import React, { useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

const COLOR_PATH = "#e74c3c";
const COLOR_EXPANDING = "#ffe066";
const COLOR_VISITED = "#b6fcb6";
const COLOR_START = "#3498db";
const COLOR_GOAL = "#9b59b6";
const COLOR_DEFAULT = "#fff";

function GraphVisualizer({
  graph,
  path,
  visited = [],
  expanding = null,
  startNode = null,
  endNode = null,
}) {
  const fgRef = useRef();
  useEffect(() => {
    if (fgRef.current) fgRef.current.refresh();
  }, [path, visited, expanding, startNode, endNode]);

  // Add this effect to increase node repulsion
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("charge").strength(-8000); // Max repulsion
      fgRef.current.d3Force("center").strength(0.005); // Very weak centering
      fgRef.current.d3Force("link").distance(220); // Moderate link distance
      fgRef.current.d3ReheatSimulation();
      // Zoom out for better visibility
      fgRef.current.zoomToFit(400, 80, (node) => true);
    }
  }, [graph]); // Re-run when graph changes

  // Highlight path links
  const pathLinks = [];
  if (path && path.length > 1) {
    for (let i = 0; i < path.length - 1; ++i) {
      const a = path[i],
        b = path[i + 1];
      const link = graph.links.find((l) => {
        const src = typeof l.source === "object" ? l.source.id : l.source;
        const tgt = typeof l.target === "object" ? l.target.id : l.target;
        return (src === a && tgt === b) || (src === b && tgt === a);
      });
      if (link) pathLinks.push(link);
    }
  }
  return (
    <div className="graph-area card">
      <ForceGraph2D
        forceGraphRef={fgRef}
        graphData={graph}
        nodeLabel={(n) => `${n.id} (h=${n.h})`}
        linkLabel={(l) => `cost=${l.cost}`}
        nodeRelSize={5} // smaller node
        d3VelocityDecay={0.18}
        linkWidth={(l) => (pathLinks.includes(l) ? 5 : 2)} // thinner links
        width={1600} // larger canvas
        height={900}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // Stylish dark mode node design
          const label = node.id;
          let color = "#23272f"; // dark node background
          let border = "#444";
          let shadow = false;
          let glow = false;
          if (node.id === startNode) {
            color = "#1e3a8a"; // blue
            border = "#60a5fa";
            shadow = true;
            glow = true;
          }
          if (node.id === endNode) {
            color = "#6d28d9"; // purple
            border = "#c084fc";
            shadow = true;
            glow = true;
          }
          if (path.includes(node.id)) {
            color = "#b91c1c"; // red
            border = "#f87171";
            shadow = true;
            glow = true;
          } else if (expanding === node.id) {
            color = "#b45309"; // amber
            border = "#fde68a";
            shadow = true;
            glow = true;
          } else if (visited.includes(node.id)) {
            color = "#166534"; // green
            border = "#6ee7b7";
            shadow = false;
            glow = false;
          }

          // Node background (rounded rectangle, dark mode)
          const w = 28, // thinner, smaller node
            h = 12,
            r = 5;
          ctx.save();
          if (shadow || glow) {
            ctx.shadowColor = glow ? "#fff6" : "#0006";
            ctx.shadowBlur = glow ? 8 : 4;
          }
          ctx.beginPath();
          ctx.moveTo(node.x - w / 2 + r, node.y - h / 2);
          ctx.lineTo(node.x + w / 2 - r, node.y - h / 2);
          ctx.quadraticCurveTo(
            node.x + w / 2,
            node.y - h / 2,
            node.x + w / 2,
            node.y - h / 2 + r
          );
          ctx.lineTo(node.x + w / 2, node.y + h / 2 - r);
          ctx.quadraticCurveTo(
            node.x + w / 2,
            node.y + h / 2,
            node.x + w / 2 - r,
            node.y + h / 2
          );
          ctx.lineTo(node.x - w / 2 + r, node.y + h / 2);
          ctx.quadraticCurveTo(
            node.x - w / 2,
            node.y + h / 2,
            node.x - w / 2,
            node.y + h / 2 - r
          );
          ctx.lineTo(node.x - w / 2, node.y - h / 2 + r);
          ctx.quadraticCurveTo(
            node.x - w / 2,
            node.y - h / 2,
            node.x - w / 2 + r,
            node.y - h / 2
          );
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.98;
          ctx.fill();
          ctx.lineWidth = 1.1; // thinner border
          ctx.strokeStyle = border;
          ctx.globalAlpha = 1;
          ctx.stroke();
          ctx.restore();

          // City name (bold, light text)
          ctx.save();
          ctx.font = `bold ${8.5 / globalScale}px Inter, Arial, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#f3f6fa";
          ctx.shadowColor = "#000a";
          ctx.shadowBlur = 1;
          ctx.fillText(label, node.x, node.y - 1);
          ctx.restore();

          // Heuristic badge (dark mode, neon accent, thinner)
          const badgeW = 13,
            badgeH = 6,
            badgeR = 2;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(node.x - badgeW / 2 + badgeR, node.y + h / 2 + 2);
          ctx.lineTo(node.x + badgeW / 2 - badgeR, node.y + h / 2 + 2);
          ctx.quadraticCurveTo(
            node.x + badgeW / 2,
            node.y + h / 2 + 2,
            node.x + badgeW / 2,
            node.y + h / 2 + 2 + badgeR
          );
          ctx.lineTo(node.x + badgeW / 2, node.y + h / 2 + 2 + badgeH - badgeR);
          ctx.quadraticCurveTo(
            node.x + badgeW / 2,
            node.y + h / 2 + 2 + badgeH,
            node.x + badgeW / 2 - badgeR,
            node.y + h / 2 + 2 + badgeH
          );
          ctx.lineTo(node.x - badgeW / 2 + badgeR, node.y + h / 2 + 2 + badgeH);
          ctx.quadraticCurveTo(
            node.x - badgeW / 2,
            node.y + h / 2 + 2 + badgeH,
            node.x - badgeW / 2,
            node.y + h / 2 + 2 + badgeH - badgeR
          );
          ctx.lineTo(node.x - badgeW / 2, node.y + h / 2 + 2 + badgeR);
          ctx.quadraticCurveTo(
            node.x - badgeW / 2,
            node.y + h / 2 + 2,
            node.x - badgeW / 2 + badgeR,
            node.y + h / 2 + 2
          );
          ctx.closePath();
          ctx.fillStyle = "#18181b";
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 0.8; // thinner border
          ctx.globalAlpha = 0.92;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowColor = "#38bdf866";
          ctx.shadowBlur = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.font = `bold ${5 / globalScale}px Inter, Arial, sans-serif`;
          ctx.fillStyle = "#38bdf8";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`h=${node.h}`, node.x, node.y + h / 2 + 2 + badgeH / 2);
          ctx.restore();
        }}
        linkColor={(l) => (pathLinks.includes(l) ? COLOR_PATH : "#bbb")}
        linkCanvasObjectMode={() => "after"}
        linkCanvasObject={(link, ctx, globalScale) => {
          const start =
            typeof link.source === "object"
              ? link.source
              : graph.nodes.find((n) => n.id === link.source);
          const end =
            typeof link.target === "object"
              ? link.target
              : graph.nodes.find((n) => n.id === link.target);
          if (!start || !end) return;
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          const txt = `${link.cost}`;
          ctx.save();
          ctx.font = `bold ${11 / globalScale}px sans-serif`;
          const textW = ctx.measureText(txt).width + 8;
          const textH = 16;
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "#bbb";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(midX - textW / 2 + 6, midY - textH / 2);
          ctx.lineTo(midX + textW / 2 - 6, midY - textH / 2);
          ctx.quadraticCurveTo(
            midX + textW / 2,
            midY - textH / 2,
            midX + textW / 2,
            midY - textH / 2 + 6
          );
          ctx.lineTo(midX + textW / 2, midY + textH / 2 - 6);
          ctx.quadraticCurveTo(
            midX + textW / 2,
            midY + textH / 2,
            midX + textW / 2 - 6,
            midY + textH / 2
          );
          ctx.lineTo(midX - textW / 2 + 6, midY + textH / 2);
          ctx.quadraticCurveTo(
            midX - textW / 2,
            midY + textH / 2,
            midX - textW / 2,
            midY + textH / 2 - 6
          );
          ctx.lineTo(midX - textW / 2, midY - textH / 2 + 6);
          ctx.quadraticCurveTo(
            midX - textW / 2,
            midY - textH / 2,
            midX - textW / 2 + 6,
            midY - textH / 2
          );
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = "#444";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(txt, midX, midY);
          ctx.restore();
        }}
      />
    </div>
  );
}

export default GraphVisualizer;
