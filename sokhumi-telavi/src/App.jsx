import { useState, useRef, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ForceGraph2D from "react-force-graph-2d";

const graph = {
  nodes: [
    { id: "Telavi", h: 509 },
    { id: "Tbilisi", h: 329 },
    { id: "Rustavi", h: 315 },
    { id: "Gori", h: 260 },
    { id: "Khashuri", h: 210 },
    { id: "Zestaponi", h: 150 },
    { id: "Kutaisi", h: 100 },
    { id: "Senaki", h: 70 },
    { id: "Batumi", h: 161 },
    { id: "Sokhumi", h: 0 },
  ],
  links: [
    { source: "Telavi", target: "Tbilisi", cost: 59 },
    { source: "Tbilisi", target: "Rustavi", cost: 57 },
    { source: "Rustavi", target: "Gori", cost: 70 },
    { source: "Gori", target: "Khashuri", cost: 56 },
    { source: "Khashuri", target: "Zestaponi", cost: 60 },
    { source: "Zestaponi", target: "Kutaisi", cost: 50 },
    { source: "Kutaisi", target: "Senaki", cost: 100 },
    { source: "Senaki", target: "Batumi", cost: 61 },
    { source: "Senaki", target: "Sokhumi", cost: 70 },
    { source: "Batumi", target: "Sokhumi", cost: 61 },
  ],
};

function findPathAStar(graph, startId, goalId) {
  // Returns {path, visitedOrder, expandedNodes, pathLinks}
  const nodes = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
  const links = graph.links;
  const neighbors = {};
  graph.nodes.forEach((n) => (neighbors[n.id] = []));
  // Fix: always use string id for source/target
  const getId = (v) => (typeof v === "object" ? v.id : v);
  links.forEach((l) => {
    const source = getId(l.source);
    const target = getId(l.target);
    neighbors[source]?.push({ id: target, cost: l.cost });
    neighbors[target]?.push({ id: source, cost: l.cost }); // undirected
  });
  const openSet = new Set([startId]);
  const cameFrom = {};
  const gScore = Object.fromEntries(graph.nodes.map((n) => [n.id, Infinity]));
  gScore[startId] = 0;
  const fScore = Object.fromEntries(graph.nodes.map((n) => [n.id, Infinity]));
  fScore[startId] = nodes[startId].h;
  const visitedOrder = [];
  const expandedNodes = [];
  while (openSet.size) {
    let current = null;
    let minF = Infinity;
    for (let n of openSet) {
      if (fScore[n] < minF) {
        minF = fScore[n];
        current = n;
      }
    }
    expandedNodes.push(current);
    if (current === goalId) {
      // reconstruct path
      const path = [current];
      while (cameFrom[current]) {
        current = cameFrom[current];
        path.push(current);
      }
      path.reverse();
      // get path links
      const pathLinks = [];
      for (let i = 0; i < path.length - 1; ++i) {
        const a = path[i],
          b = path[i + 1];
        pathLinks.push(
          links.find(
            (l) =>
              (l.source === a && l.target === b) ||
              (l.source === b && l.target === a)
          )
        );
      }
      return { path, visitedOrder, expandedNodes, pathLinks };
    }
    openSet.delete(current);
    visitedOrder.push(current);
    for (let { id: neighbor, cost } of neighbors[current]) {
      const tentativeG = gScore[current] + cost;
      if (tentativeG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + nodes[neighbor].h;
        openSet.add(neighbor);
      }
    }
  }
  return { path: [], visitedOrder, expandedNodes, pathLinks: [] };
}

const defaultStart = "Telavi";
const defaultGoal = "Sokhumi";

const COLOR_PATH = "#e74c3c";
const COLOR_EXPANDING = "#ffe066";
const COLOR_VISITED = "#b6fcb6";
const COLOR_START = "#3498db";
const COLOR_GOAL = "#9b59b6";
const COLOR_DEFAULT = "#fff";

function calcPathCost(path, links) {
  let cost = 0;
  for (let i = 0; i < path.length - 1; ++i) {
    const a = path[i],
      b = path[i + 1];
    // Fix: compare string values for source/target, which may be objects
    const link = links.find((l) => {
      const src = typeof l.source === "object" ? l.source.id : l.source;
      const tgt = typeof l.target === "object" ? l.target.id : l.target;
      return (src === a && tgt === b) || (src === b && tgt === a);
    });
    if (link) cost += link.cost;
  }
  return cost;
}

function App() {
  const [start, setStart] = useState(defaultStart);
  const [goal, setGoal] = useState(defaultGoal);
  const [animState, setAnimState] = useState({
    visited: [], // use array instead of Set
    expanded: null,
    path: [],
    pathLinks: [],
    running: false,
    finished: false,
    step: -1,
  });
  const [output, setOutput] = useState("");
  const animRef = useRef();
  const [animStep, setAnimStep] = useState(-1); // -1 = idle
  const [animData, setAnimData] = useState(null); // stores {expandedNodes, path, pathLinks}
  const fgRef = useRef();
  const [highlight, setHighlight] = useState(0); // 0 or 1

  // Simple animation: toggle highlight every second
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlight((h) => 1 - h);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Force redraw on highlight change
  useEffect(() => {
    if (fgRef.current) fgRef.current.refresh();
  }, [highlight]);

  // Force redraw on every animState change (for A* animation)
  useEffect(() => {
    if (fgRef.current) fgRef.current.refresh();
  }, [animState]);

  // Start animation
  const handleRun = () => {
    try {
      const { path, expandedNodes, pathLinks } = findPathAStar(
        graph,
        start,
        goal
      );
      setAnimData({ path, expandedNodes, pathLinks });
      setAnimStep(0);
      setAnimState({
        visited: [],
        expanded: null,
        path: [],
        pathLinks: [],
        running: true,
        finished: false,
        step: 0,
      });
      if (!path.length) {
        setOutput("No path found");
      } else {
        setOutput(path.join(" → "));
      }
    } catch (e) {
      setOutput("Error: " + (e?.message || e));
    }
  };

  // Animation effect
  useEffect(() => {
    if (!animData || animStep < 0) return;
    if (animStep < animData.expandedNodes.length) {
      setAnimState((s) => ({
        ...s,
        visited: [...s.visited, animData.expandedNodes[animStep]],
        expanded: animData.expandedNodes[animStep],
        path: [],
        pathLinks: [],
        running: true,
        finished: false,
        step: animStep, // add step to force re-render
      }));
      const timeout = setTimeout(() => setAnimStep(animStep + 1), 600);
      return () => clearTimeout(timeout);
    } else if (animStep === animData.expandedNodes.length) {
      setAnimState((s) => ({
        ...s,
        expanded: null,
        path: animData.path,
        pathLinks: animData.pathLinks,
        running: false,
        finished: true,
        step: animStep,
      }));
      setAnimStep(-1);
    }
  }, [animStep, animData]);

  // Reset
  const handleReset = () => {
    setAnimState({
      visited: [],
      expanded: null,
      path: [],
      pathLinks: [],
      running: false,
      finished: false,
      step: -1,
    });
    setOutput("");
    setAnimStep(-1);
    setAnimData(null);
  };

  // Add step counter
  const stepCount = animState.finished
    ? animData?.expandedNodes.length
    : animState.visited.length;

  return (
    <div className="container">
      <div className="panel">
        <label>Start City: </label>
        <select
          value={start}
          onChange={(e) => setStart(e.target.value)}
          disabled={animState.running}
        >
          {graph.nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.id}
            </option>
          ))}
        </select>
        <label>Goal City: </label>
        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={animState.running}
        >
          {graph.nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.id}
            </option>
          ))}
        </select>
        <button
          onClick={handleRun}
          disabled={animState.running || start === goal}
        >
          Run A*
        </button>
        <button
          onClick={handleReset}
          disabled={animState.running && !animState.finished}
        >
          Reset
        </button>
        <span className="step-counter">Step: {stepCount}</span>
      </div>
      <div className="legend">
        <span className="legend-item">
          <span className="legend-color blue"></span> Start
        </span>
        <span className="legend-item">
          <span className="legend-color purple"></span> Goal
        </span>
        <span className="legend-item">
          <span className="legend-color yellow"></span> Expanding
        </span>
        <span className="legend-item">
          <span className="legend-color green"></span> Visited
        </span>
        <span className="legend-item">
          <span className="legend-color red"></span> Path
        </span>
        <span className="legend-item">
          <span className="legend-color white"></span> Unvisited
        </span>
      </div>
      <div className="graph-area">
        <ForceGraph2D
          forceGraphRef={fgRef}
          graphData={graph}
          nodeLabel={(n) => `${n.id} (h=${n.h})`}
          linkLabel={(l) => `cost=${l.cost}`}
          nodeCanvasObject={(node, ctx, globalScale) => {
            // Node style
            const label = `${node.id}`;
            let color = COLOR_DEFAULT;
            let border = "#333";
            let shadow = false;
            if (node.id === start) {
              color = COLOR_START;
              border = "#217dbb";
              shadow = true;
            }
            if (node.id === goal) {
              color = COLOR_GOAL;
              border = "#7d3c98";
              shadow = true;
            }
            if (animState.path.includes(node.id)) {
              color = COLOR_PATH;
              border = "#b03a2e";
              shadow = true;
            } else if (animState.expanded === node.id) {
              color = COLOR_EXPANDING;
              border = "#bfa900";
              shadow = true;
            } else if (animState.visited.includes(node.id)) {
              color = COLOR_VISITED;
              border = "#27ae60";
            }
            // Node circle
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
            // Node label
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
          linkColor={(l) =>
            animState.pathLinks.includes(l) ? COLOR_PATH : "#bbb"
          }
          linkWidth={(l) => (animState.pathLinks.includes(l) ? 4 : 1.5)}
          linkCanvasObjectMode={() => "after"}
          linkCanvasObject={(link, ctx, globalScale) => {
            // Draw cost label at midpoint with background
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
      <div className="output">
        <h3>Path Output</h3>
        <div>{output}</div>
        <div className="step-costs">
          {animState.visited.map((nodeId, idx) => {
            if (idx === 0) {
              return <div key={idx}>Step: 1 &nbsp; Cost: 0</div>;
            }
            const prev = animState.visited[idx - 1];
            const curr = nodeId;
            // Find the link cost between prev and curr
            const link = graph.links.find((l) => {
              const src = typeof l.source === "object" ? l.source.id : l.source;
              const tgt = typeof l.target === "object" ? l.target.id : l.target;
              return (
                (src === prev && tgt === curr) || (src === curr && tgt === prev)
              );
            });
            const prevTotal = animState.visited
              .slice(0, idx)
              .reduce((sum, n, i, arr) => {
                if (i === 0) return 0;
                const a = arr[i - 1],
                  b = arr[i];
                const l = graph.links.find((lk) => {
                  const src =
                    typeof lk.source === "object" ? lk.source.id : lk.source;
                  const tgt =
                    typeof lk.target === "object" ? lk.target.id : lk.target;
                  return (src === a && tgt === b) || (src === b && tgt === a);
                });
                return sum + (l ? l.cost : 0);
              }, 0);
            const added = link ? link.cost : 0;
            const formula = `${prevTotal} + ${added} = ${prevTotal + added}`;
            return (
              <div key={idx}>
                Step: {idx + 1} &nbsp; Cost: {prevTotal + added} (
                <span style={{ color: "#888" }}>+{added}</span>) &nbsp;{" "}
                <span style={{ color: "#888" }}>{formula}</span>
              </div>
            );
          })}
        </div>
        {/* Always show total cost if a path exists and output is not an error or 'No path found' */}
        {output &&
          !output.startsWith("Error") &&
          output !== "No path found" && (
            <div className="path-cost">
              Total Cost: {calcPathCost(output.split(" → "), graph.links)}
            </div>
          )}
      </div>
    </div>
  );
}

export default App;
