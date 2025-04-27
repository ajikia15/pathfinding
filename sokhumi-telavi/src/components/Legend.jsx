import React from "react";

function Legend() {
  return (
    <div className="legend card">
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
  );
}

export default Legend;
