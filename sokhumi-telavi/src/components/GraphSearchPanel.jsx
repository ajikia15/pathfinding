import React from "react";

function GraphSearchPanel({
  graph,
  startNode,
  setStartNode,
  endNode,
  setEndNode,
  handleSearch,
  isSearching,
}) {
  return (
    <div className="panel card">
      <label>Start City:</label>
      <select
        value={startNode}
        onChange={(e) => setStartNode(e.target.value)}
        disabled={isSearching}
      >
        {graph.nodes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.id}
          </option>
        ))}
      </select>
      <label>Goal City:</label>
      <select
        value={endNode}
        onChange={(e) => setEndNode(e.target.value)}
        disabled={isSearching}
      >
        {graph.nodes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.id}
          </option>
        ))}
      </select>
      <button
        onClick={handleSearch}
        disabled={isSearching || startNode === endNode}
      >
        Run A*
      </button>
    </div>
  );
}

export default GraphSearchPanel;
