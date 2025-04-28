import React from "react";

function GraphSearchPanel({
  graph,
  startNode,
  setStartNode,
  endNode,
  setEndNode,
  handleSearch,
  isSearching,
  isAutoRunning,
  onNextStep,
  onReset,
  canNext,
  canReset,
  onRunAll,
  canRunAll,
  onStop,
}) {
  return (
    <div className="controls-panel">
      <div className="controls-selects">
        <div className="controls-select-group">
          <label htmlFor="start-city">Start City:</label>
          <select
            id="start-city"
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            disabled={isSearching || isAutoRunning}
          >
            {graph.nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id}
              </option>
            ))}
          </select>
        </div>
        <div className="controls-select-group">
          <label htmlFor="goal-city">Goal City:</label>
          <select
            id="goal-city"
            value={endNode}
            onChange={(e) => setEndNode(e.target.value)}
            disabled={isSearching || isAutoRunning}
          >
            {graph.nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="controls-buttons-row">
        <button
          onClick={handleSearch}
          disabled={isSearching || isAutoRunning || startNode === endNode}
        >
          Start / Restart
        </button>
        <button onClick={onNextStep} disabled={!canNext || isAutoRunning}>
          Next Step
        </button>
        {isAutoRunning ? (
          <button onClick={onStop} style={{ background: "var(--warning)" }}>
            Stop
          </button>
        ) : (
          <button onClick={onRunAll} disabled={!canRunAll || isAutoRunning}>
            Run All
          </button>
        )}
        <button onClick={onReset} disabled={!canReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default GraphSearchPanel;
