import React, { useState, useRef } from 'react';
import Graph from './Graph.jsx';

const graph = {
  nodes: [
    { id: 'Telavi', h: 509 },
    { id: 'Tbilisi', h: 329 },
    { id: 'Rustavi', h: 315 },
    { id: 'Gori', h: 260 },
    { id: 'Khashuri', h: 210 },
    { id: 'Zestaponi', h: 150 },
    { id: 'Kutaisi', h: 100 },
    { id: 'Senaki', h: 70 },
    { id: 'Batumi', h: 161 },
    { id: 'Sokhumi', h: 0 }
  ],
  links: [
    { source: 'Telavi', target: 'Tbilisi', cost: 59 },
    { source: 'Tbilisi', target: 'Rustavi', cost: 57 },
    { source: 'Rustavi', target: 'Gori', cost: 70 },
    { source: 'Gori', target: 'Khashuri', cost: 56 },
    { source: 'Khashuri', target: 'Zestaponi', cost: 60 },
    { source: 'Zestaponi', target: 'Kutaisi', cost: 50 },
    { source: 'Kutaisi', target: 'Senaki', cost: 100 },
    { source: 'Senaki', target: 'Batumi', cost: 61 },
    { source: 'Senaki', target: 'Sokhumi', cost: 70 },
    { source: 'Batumi', target: 'Sokhumi', cost: 61 }
  ]
};

// preserve unmutated graph copy for A* algorithm
const algoGraph = JSON.parse(JSON.stringify(graph));

const sleep = ms => new Promise(res => setTimeout(res, ms));

export default function App() {
  const [start, setStart] = useState('Telavi');
  const [goal, setGoal] = useState('Sokhumi');
  const [nodeColors, setNodeColors] = useState({});
  const [linkColors, setLinkColors] = useState({});
  const [pathOutput, setPathOutput] = useState([]);
  const graphRef = useRef();

  const reset = () => {
    setNodeColors({});
    setLinkColors({});
    setPathOutput([]);
  };

  const runAStar = async () => {
    reset();
    // build adjacency
    const neighbors = {};
    algoGraph.nodes.forEach(n => (neighbors[n.id] = []));
    algoGraph.links.forEach(l => {
      // support react-force-graph mutation where source/target may be objects
      const src = typeof l.source === 'object' ? l.source.id : l.source;
      const tgt = typeof l.target === 'object' ? l.target.id : l.target;
      neighbors[src].push({ target: tgt, cost: l.cost });
      neighbors[tgt].push({ target: src, cost: l.cost });
    });
    const h = Object.fromEntries(algoGraph.nodes.map(n => [n.id, n.h]));

    const openSet = new Set([start]);
    const cameFrom = {};
    const gScore = { [start]: 0 };
    const fScore = { [start]: h[start] };
    const closedSet = new Set();

    while (openSet.size > 0) {
      // pick lowest fScore
      let current = [...openSet].reduce((a, b) =>
        (fScore[a] || Infinity) < (fScore[b] || Infinity) ? a : b
      );
      // highlight current
      setNodeColors(prev => ({ ...prev, [current]: 'yellow' }));
      await sleep(500);

      if (current === goal) break;

      openSet.delete(current);
      closedSet.add(current);
      setNodeColors(prev => ({ ...prev, [current]: 'lightgreen' }));

      for (const { target, cost } of neighbors[current]) {
        if (closedSet.has(target)) continue;
        const tentativeG = (gScore[current] || Infinity) + cost;
        if (tentativeG < (gScore[target] || Infinity)) {
          cameFrom[target] = current;
          gScore[target] = tentativeG;
          fScore[target] = tentativeG + h[target];
          openSet.add(target);
        }
      }
    }

    // reconstruct path
    const path = [];
    let curr = goal;
    if (!cameFrom[curr] && curr !== start) {
      setPathOutput(['No path found']);
      return;
    }
    while (curr) {
      path.unshift(curr);
      if (curr === start) break;
      curr = cameFrom[curr];
    }

    // animate final path
    for (let i = 0; i < path.length; i++) {
      setNodeColors(prev => ({ ...prev, [path[i]]: 'red' }));
      if (i < path.length - 1) {
        const k1 = `${path[i]}-${path[i+1]}`, k2 = `${path[i+1]}-${path[i]}`;
        setLinkColors(prev => ({ ...prev, [k1]: 'red', [k2]: 'red' }));
      }
      await sleep(300);
    }
    setPathOutput(path);
  };

  return (
    <>
      <div className="controls">
        <label>
          Start:
          <select value={start} onChange={e => setStart(e.target.value)}>
            {graph.nodes.map(n => (
              <option key={n.id} value={n.id}>{n.id}</option>
            ))}
          </select>
        </label>
        <label>
          Goal:
          <select value={goal} onChange={e => setGoal(e.target.value)}>
            {graph.nodes.map(n => (
              <option key={n.id} value={n.id}>{n.id}</option>
            ))}
          </select>
        </label>
        <button onClick={runAStar}>Run A*</button>
        <button onClick={reset}>Reset</button>
      </div>

      <Graph
        ref={graphRef}
        graphData={graph}
        nodeColors={nodeColors}
        linkColors={linkColors}
      />

      <div className="path-output">
        <h3>Path Output</h3>
        <div>{pathOutput.join(' → ')}</div>
      </div>

      <div className="legend">
        <div className="legend-item"><span className="dot yellow" /> Current</div>
        <div className="legend-item"><span className="dot lightgreen" /> Visited</div>
        <div className="legend-item"><span className="dot red" /> Path</div>
      </div>
    </>
  );
}