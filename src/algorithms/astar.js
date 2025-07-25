// src/algorithms/astar.js
// Returns { path, stepCosts }
export function findPathAStar(
  graph,
  startId,
  goalId,
  trace = false,
  heuristic
) {
  const nodes = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
  const links = graph.links;
  const neighbors = {};
  graph.nodes.forEach((n) => (neighbors[n.id] = []));
  const getId = (v) => (typeof v === "object" ? v.id : v);
  links.forEach((l) => {
    const source = getId(l.source);
    const target = getId(l.target);
    neighbors[source]?.push({ id: target, cost: l.cost });
    neighbors[target]?.push({ id: source, cost: l.cost });
  });

  // Use dynamic heuristic
  const goalNode = nodes[goalId];
  const openSet = new Map();
  openSet.set(startId, heuristic(nodes[startId], goalNode));

  const cameFrom = {};
  const gScore = Object.fromEntries(graph.nodes.map((n) => [n.id, Infinity]));
  gScore[startId] = 0;
  const fScore = Object.fromEntries(graph.nodes.map((n) => [n.id, Infinity]));
  fScore[startId] = heuristic(nodes[startId], goalNode);

  const expandedNodes = [];
  const explanations = [];
  const stepCosts = [];

  while (openSet.size > 0) {
    // Find node with lowest fScore in openSet
    let current = null;
    let minF = Infinity;
    for (let [nodeId, fVal] of openSet) {
      if (fVal < minF) {
        minF = fVal;
        current = nodeId;
      }
    }

    if (current === null) break;

    // --- Tracing ---
    if (trace) {
      expandedNodes.push(current);
      stepCosts.push({
        nodeId: current,
        g: gScore[current],
        h: heuristic(nodes[current], goalNode),
        f: fScore[current],
      });
      let explain = `Expanding node ${current} (f=${fScore[current].toFixed(
        1
      )}) because it has the lowest f-score in the open set. Open set: [${Array.from(
        openSet.keys()
      ).join(", ")}].`;
      const updatedNeighbors = [];
      for (let { id: neighbor, cost } of neighbors[current]) {
        const tentativeG = gScore[current] + cost;
        if (tentativeG < gScore[neighbor]) {
          const neighborF = tentativeG + heuristic(nodes[neighbor], goalNode);
          updatedNeighbors.push(`${neighbor}(f=${neighborF.toFixed(1)})`);
        }
      }
      if (updatedNeighbors.length > 0) {
        explain += ` Neighbors considered for update/add: ${updatedNeighbors.join(
          ", "
        )}.`;
      }
      explanations.push(explain);
    }
    // --- End Tracing ---

    if (current === goalId) {
      // Reconstruct path
      const path = [current];
      let temp = current;
      while (cameFrom[temp]) {
        temp = cameFrom[temp];
        path.push(temp);
      }
      path.reverse();
      return { path, stepCosts, expandedNodes, explanations };
    }

    openSet.delete(current);

    for (let { id: neighbor, cost } of neighbors[current]) {
      const tentativeG = gScore[current] + cost;
      if (tentativeG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + heuristic(nodes[neighbor], goalNode);
        openSet.set(neighbor, fScore[neighbor]);
      }
    }
  }

  // Goal was never reached
  return { path: [], stepCosts, expandedNodes, explanations };
}

export function calcPathCost(path, links) {
  let cost = 0;
  for (let i = 0; i < path.length - 1; ++i) {
    const a = path[i],
      b = path[i + 1];
    const link = links.find((l) => {
      const src = typeof l.source === "object" ? l.source.id : l.source;
      const tgt = typeof l.target === "object" ? l.target.id : l.target;
      return (src === a && tgt === b) || (src === b && tgt === a);
    });
    if (link) cost += link.cost;
  }
  return cost;
}
