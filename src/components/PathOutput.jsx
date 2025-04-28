import React from "react";

function PathOutput({ path, pathCost, expandedCount }) {
  if (!path || path.length === 0) return null;
  return (
    // Use the standard card class and specific section class
    <div className="card output-section">
      <h4>Final Path Found</h4>
      {path.length > 0 && (
        <div className="path-output-content">
          <div className="path-string">{path.join(" → ")}</div>
          <div className="path-cost">Nodes Expanded: {expandedCount}</div>
          <div className="path-cost">Total Cost: {pathCost}</div>
        </div>
      )}
    </div>
  );
}

export default PathOutput;
