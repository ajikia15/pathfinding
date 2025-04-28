import React from "react";

function Legend() {
  return (
    // Use the standard card class for background/padding/border
    <div className="legend card">
      {/* Legend items remain the same, colors are handled by CSS */}
      <span className="legend-item">
        <span className="legend-color blue"></span> Start / Goal
      </span>
      <span className="legend-item">
        <span className="legend-color warning"></span> Expanding
      </span>
      <span className="legend-item">
        <span className="legend-color success"></span> Visited
      </span>
      <span className="legend-item">
        <span className="legend-color danger"></span> Path
      </span>
      <span className="legend-item">
        <span className="legend-color white"></span> Unvisited
      </span>
    </div>
  );
}

export default Legend;
