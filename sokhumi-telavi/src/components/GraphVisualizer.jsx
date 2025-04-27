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
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = `${node.id}`;
          let color = COLOR_DEFAULT;
          let border = "#333";
          let shadow = false;
          if (node.id === startNode) {
            color = COLOR_START;
            border = "#217dbb";
            shadow = true;
          }
          if (node.id === endNode) {
            color = COLOR_GOAL;
            border = "#7d3c98";
            shadow = true;
          }
          if (path.includes(node.id)) {
            color = COLOR_PATH;
            border = "#b03a2e";
            shadow = true;
          } else if (expanding === node.id) {
            color = COLOR_EXPANDING;
            border = "#bfa900";
            shadow = true;
          } else if (visited.includes(node.id)) {
            color = COLOR_VISITED;
            border = "#27ae60";
          }
          ctx.save();
          if (shadow) {
            ctx.shadowColor = "rgba(0,0,0,0.18)";
            ctx.shadowBlur = 8;
          }
          ctx.beginPath();
          ctx.arc(node.x, node.y, 13, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = border;
          ctx.stroke();
          ctx.restore();
          ctx.font = `bold ${14 / globalScale}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#222";
          ctx.fillText(label, node.x, node.y - 2);
          // Heuristic badge
          const badgeW = 28,
            badgeH = 16,
            badgeR = 8;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(node.x - badgeW / 2 + badgeR, node.y + 15);
          ctx.lineTo(node.x + badgeW / 2 - badgeR, node.y + 15);
          ctx.quadraticCurveTo(
            node.x + badgeW / 2,
            node.y + 15,
            node.x + badgeW / 2,
            node.y + 15 + badgeR
          );
          ctx.lineTo(node.x + badgeW / 2, node.y + 15 + badgeH - badgeR);
          ctx.quadraticCurveTo(
            node.x + badgeW / 2,
            node.y + 15 + badgeH,
            node.x + badgeW / 2 - badgeR,
            node.y + 15 + badgeH
          );
          ctx.lineTo(node.x - badgeW / 2 + badgeR, node.y + 15 + badgeH);
          ctx.quadraticCurveTo(
            node.x - badgeW / 2,
            node.y + 15 + badgeH,
            node.x - badgeW / 2,
            node.y + 15 + badgeH - badgeR
          );
          ctx.lineTo(node.x - badgeW / 2, node.y + 15 + badgeR);
          ctx.quadraticCurveTo(
            node.x - badgeW / 2,
            node.y + 15,
            node.x - badgeW / 2 + badgeR,
            node.y + 15
          );
          ctx.closePath();
          ctx.fillStyle = "#f3f3f3";
          ctx.strokeStyle = "#bbb";
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
          ctx.font = `bold ${11 / globalScale}px sans-serif`;
          ctx.fillStyle = "#7d6608";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`h=${node.h}`, node.x, node.y + 15 + badgeH / 2);
          ctx.restore();
        }}
        linkColor={(l) => (pathLinks.includes(l) ? COLOR_PATH : "#bbb")}
        linkWidth={(l) => (pathLinks.includes(l) ? 4 : 1.5)}
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
        width={700}
        height={400}
      />
    </div>
  );
}

export default GraphVisualizer;
