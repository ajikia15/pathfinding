import React from "react";

function GraphSearchPanel({
  graph,
  startNode,
  setStartNode,
  endNode,
  setEndNode,
  handleSearch,
  isSearching,
  nextStepMode,
  onNextStep,
  onReset,
  canNext,
  canReset,
  onRunAll
}) {
  return (
    <div className="panel card">
      <label>Start City:</label>
      <select value={startNode} onChange={e => setStartNode(e.target.value)} disabled={isSearching}>
        {graph.nodes.map(n => (
          <option key={n.id} value={n.id}>{n.id}</option>
        ))}
      </select>
      <label>Goal City:</label>
      <select value={endNode} onChange={e => setEndNode(e.target.value)} disabled={isSearching}>
        {graph.nodes.map(n => (
          <option key={n.id} value={n.id}>{n.id}</option>
        ))}
      </select>
      {nextStepMode ? (
        <>
          <button onClick={handleSearch} disabled={isSearching}>Start</button>
          <button onClick={onNextStep} disabled={!canNext} style={{marginLeft: 8}}>Next Step</button>
          <button onClick={onReset} disabled={!canReset} style={{marginLeft: 8}}>Reset</button>
          <button onClick={onRunAll} disabled={!canNext} style={{marginLeft: 8}}>Run All</button>
        </>
      ) : (
        <button onClick={handleSearch} disabled={isSearching || startNode === endNode}>Run A*</button>
      )}
    </div>
  );
}

export default GraphSearchPanel;
