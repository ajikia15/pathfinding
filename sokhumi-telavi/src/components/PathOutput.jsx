import React from "react";

function PathOutput({ path, pathCost }) {
  if (!path || path.length === 0) return null;
  return (
    <div className="output card">
      <h3>Path Output</h3>
      <div>{path.join(" → ")}</div>
      <div className="path-cost">Total Cost: {pathCost}</div>
    </div>
  );
}

export default PathOutput;
