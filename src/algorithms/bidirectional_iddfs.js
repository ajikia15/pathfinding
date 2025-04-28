// src/algorithms/bidirectional_iddfs.js
// Iterative Deepening Depth-First Search (IDDFS) based Bidirectional Search
// Returns { path, stepCosts, expandedNodes, explanations }

function getNeighbors(graph) {
  const neighbors = {};
  graph.nodes.forEach((n) => (neighbors[n.id] = []));
  const getId = (v) => (typeof v === "object" ? v.id : v);
  graph.links.forEach((l) => {
    const source = getId(l.source);
    const target = getId(l.target);
    neighbors[source]?.push({ id: target, cost: l.cost });
    neighbors[target]?.push({ id: source, cost: l.cost });
  });
  return neighbors;
}

function reconstructPath(meetingNode, parentsF, parentsB) {
  // Forward path: start -> meetingNode
  let pathF = [meetingNode];
  let temp = meetingNode;
  while (parentsF[temp]) {
    temp = parentsF[temp];
    pathF.push(temp);
  }
  pathF.reverse();
  // Backward path: meetingNode -> goal
  let pathB = [];
  temp = meetingNode;
  while (parentsB[temp]) {
    temp = parentsB[temp];
    pathB.push(temp);
  }
  return pathF.concat(pathB);
}

export function findPathBidirectionalIDDFS(
  graph,
  startId,
  goalId,
  trace = false
) {
  if (startId === goalId)
    return {
      path: [startId],
      stepCosts: [],
      expandedNodes: [startId],
      explanations: ["Start and goal are the same."],
    };
  const neighbors = getNeighbors(graph);
  let minCost = Infinity;
  let bestPath = [];
  let bestStepCosts = [];
  let bestExpanded = [];
  let bestExplanations = [];
  let found = false;
  let maxDepth = 1;
  const MAX_DEPTH_LIMIT = 100;

  while (!found && maxDepth <= MAX_DEPTH_LIMIT) {
    // Use queues for alternating expansion
    let forwardFrontier = [{ node: startId, depth: 0, cost: 0 }];
    let backwardFrontier = [{ node: goalId, depth: 0, cost: 0 }];
    const visitedF = new Set([startId]);
    const visitedB = new Set([goalId]);
    const parentsF = {};
    const parentsB = {};
    const costF = { [startId]: 0 };
    const costB = { [goalId]: 0 };
    let expandedNodes = [];
    let stepCosts = [];
    let explanations = [];
    let meetingNode = null;
    let minMeetingCost = Infinity;

    // For quick lookup of visited nodes
    const visitedFSet = new Set([startId]);
    const visitedBSet = new Set([goalId]);

    // Alternate expansions
    let turn = 0; // 0 = forward, 1 = backward
    while (
      (forwardFrontier.length > 0 || backwardFrontier.length > 0) &&
      !found
    ) {
      if (turn === 0 && forwardFrontier.length > 0) {
        // Expand one node from forward frontier
        const { node, depth, cost } = forwardFrontier.shift();
        expandedNodes.push(node);
        stepCosts.push({ nodeId: node, g: cost, h: 0, f: cost });
        explanations.push(
          `Forward expanding ${node} at depth ${depth}, cost so far: ${cost}`
        );
        if (visitedBSet.has(node)) {
          const totalCost = cost + costB[node];
          if (totalCost < minMeetingCost) {
            meetingNode = node;
            minMeetingCost = totalCost;
            found = true;
            break;
          }
        }
        if (depth < maxDepth) {
          for (const { id: neighbor, cost: edgeCost } of neighbors[node]) {
            const newCost = cost + edgeCost;
            if (!visitedFSet.has(neighbor) && newCost <= minCost) {
              visitedFSet.add(neighbor);
              costF[neighbor] = newCost;
              parentsF[neighbor] = node;
              forwardFrontier.push({
                node: neighbor,
                depth: depth + 1,
                cost: newCost,
              });
            }
          }
        }
      } else if (turn === 1 && backwardFrontier.length > 0) {
        // Expand one node from backward frontier
        const { node, depth, cost } = backwardFrontier.shift();
        expandedNodes.push(node);
        stepCosts.push({ nodeId: node, g: cost, h: 0, f: cost });
        explanations.push(
          `Backward expanding ${node} at depth ${depth}, cost so far: ${cost}`
        );
        if (visitedFSet.has(node)) {
          const totalCost = cost + costF[node];
          if (totalCost < minMeetingCost) {
            meetingNode = node;
            minMeetingCost = totalCost;
            found = true;
            break;
          }
        }
        if (depth < maxDepth) {
          for (const { id: neighbor, cost: edgeCost } of neighbors[node]) {
            const newCost = cost + edgeCost;
            if (!visitedBSet.has(neighbor) && newCost <= minCost) {
              visitedBSet.add(neighbor);
              costB[neighbor] = newCost;
              parentsB[neighbor] = node;
              backwardFrontier.push({
                node: neighbor,
                depth: depth + 1,
                cost: newCost,
              });
            }
          }
        }
      }
      turn = 1 - turn; // Alternate turn
    }
    if (meetingNode) {
      minCost = minMeetingCost;
      bestPath = reconstructPath(meetingNode, parentsF, parentsB);
      bestStepCosts = stepCosts;
      bestExpanded = expandedNodes;
      bestExplanations = explanations;
      break;
    }
    maxDepth++;
  }
  if (bestPath.length > 0) {
    return {
      path: bestPath,
      stepCosts: bestStepCosts,
      expandedNodes: bestExpanded,
      explanations: bestExplanations,
    };
  } else {
    return {
      path: [],
      stepCosts: [],
      expandedNodes: [],
      explanations: ["No path found within depth limit."],
    };
  }
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
