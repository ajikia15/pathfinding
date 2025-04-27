// src/algorithms/astar.js
// Returns { path, stepCosts }
export function findPathAStar(graph, startId, goalId) {
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
  const openSet = new Set([startId]);
  const cameFrom = {};
  const gScore = Object.fromEntries(graph.nodes.map((n) => [n.id, Infinity]));
  gScore[startId] = 0;
  const fScore = Object.fromEntries(graph.nodes.map((n) => [n.id, Infinity]));
  fScore[startId] = nodes[startId].h;
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
      // step-by-step cost breakdown
      const stepCosts = [];
      let total = 0;
      for (let i = 0; i < path.length; ++i) {
        let added = 0;
        if (i > 0) {
          const a = path[i - 1],
            b = path[i];
          const link = links.find((l) => {
            const src = typeof l.source === "object" ? l.source.id : l.source;
            const tgt = typeof l.target === "object" ? l.target.id : l.target;
            return (src === a && tgt === b) || (src === b && tgt === a);
          });
          added = link ? link.cost : 0;
        }
        const formula = `${total} + ${added} = ${total + added}`;
        total += added;
        stepCosts.push({ total, added, formula });
      }
      return { path, stepCosts, expandedNodes };
    }
    openSet.delete(current);
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
  return { path: [], stepCosts: [], expandedNodes };
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
