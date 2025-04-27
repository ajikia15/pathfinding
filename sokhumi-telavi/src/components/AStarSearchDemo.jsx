import { useState, useRef, useEffect } from "react";
import GraphSearchPanel from "./GraphSearchPanel";
import GraphVisualizer from "./GraphVisualizer";
import StepCostList from "./StepCostList";
import PathOutput from "./PathOutput";
import Legend from "./Legend";
import { findPathAStar, calcPathCost } from "../algorithms/astar";

const defaultGraph = {
  nodes: [
    { id: "Telavi", h: 387 },
    { id: "Sagarejo", h: 384 },
    { id: "Tbilisi", h: 348 },
    { id: "Mtskheta", h: 332 },
    { id: "Rustavi", h: 369 },
    { id: "Gori", h: 280 },
    { id: "Kaspi", h: 306 },
    { id: "Khashuri", h: 242 },
    { id: "Surami", h: 232 },
    { id: "Zestaponi", h: 198 },
    { id: "Kutaisi", h: 164 },
    { id: "Samtredia", h: 169 },
    { id: "Senaki", h: 132 },
    { id: "Zugdidi", h: 136 },
    { id: "Poti", h: 110 },
    { id: "Batumi", h: 160 },
    { id: "Chiatura", h: 217 },
    { id: "Ambrolauri", h: 186 },
    { id: "Sokhumi", h: 0 },
  ],
  links: [
    { source: "Telavi", target: "Sagarejo", cost: 30 },
    { source: "Sagarejo", target: "Tbilisi", cost: 50 },
    { source: "Telavi", target: "Tbilisi", cost: 90 },
    { source: "Tbilisi", target: "Mtskheta", cost: 20 },
    { source: "Tbilisi", target: "Rustavi", cost: 26 },
    { source: "Tbilisi", target: "Gori", cost: 89 },
    { source: "Gori", target: "Kaspi", cost: 25 },
    { source: "Gori", target: "Khashuri", cost: 40 },
    { source: "Khashuri", target: "Surami", cost: 10 },
    { source: "Surami", target: "Zestaponi", cost: 63 },
    { source: "Zestaponi", target: "Kutaisi", cost: 25 },
    { source: "Kutaisi", target: "Samtredia", cost: 33 },
    { source: "Samtredia", target: "Senaki", cost: 28 },
    { source: "Senaki", target: "Zugdidi", cost: 45 },
    { source: "Zugdidi", target: "Sokhumi", cost: 102 },
    { source: "Senaki", target: "Poti", cost: 39 },
    { source: "Samtredia", target: "Batumi", cost: 109 },
    { source: "Kutaisi", target: "Chiatura", cost: 50 },
    { source: "Chiatura", target: "Ambrolauri", cost: 88 },
  ],
};

function AStarSearchDemo() {
  const [graph, setGraph] = useState(defaultGraph);
  const [startNode, setStartNode] = useState("Telavi");
  const [endNode, setEndNode] = useState("Sokhumi");
  const [trace, setTrace] = useState(null); // {path, stepCosts, expandedNodes, explanations}
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  // On search, run A* and store the trace
  const handleSearch = () => {
    const result = findPathAStar(graph, startNode, endNode, true);
    setTrace(result);
    setStep(0);
    setFinished(false);
  };

  // Next step handler
  const handleNextStep = () => {
    if (!trace) return;
    if (step < trace.expandedNodes.length - 1) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  };

  // Run all steps automatically
  const handleRunAll = () => {
    if (!trace) return;
    let i = step;
    setFinished(false);
    function runNext() {
      if (i < trace.expandedNodes.length - 1) {
        setStep(s => s + 1);
        i++;
        setTimeout(runNext, 700);
      } else {
        setFinished(true);
      }
    }
    runNext();
  };

  // Reset handler
  const handleReset = () => {
    setTrace(null);
    setStep(0);
    setFinished(false);
  };

  // Step data for current step
  const visited = trace ? trace.expandedNodes.slice(0, step) : [];
  const expanding = trace ? trace.expandedNodes[step] : null;
  const path = trace && trace.path ? (finished ? trace.path : []) : [];
  const stepCosts = trace && trace.stepCosts ? trace.stepCosts.slice(0, step + 1) : [];
  const pathCost = trace && finished ? calcPathCost(trace.path, graph.links) : 0;
  const explanation = trace && trace.explanations ? trace.explanations[step] : null;

  return (
    <div>
      <Legend />
      <GraphSearchPanel
        graph={graph}
        setGraph={setGraph}
        startNode={startNode}
        setStartNode={setStartNode}
        endNode={endNode}
        setEndNode={setEndNode}
        handleSearch={handleSearch}
        isSearching={!!trace && !finished}
        nextStepMode={true}
        onNextStep={handleNextStep}
        onReset={handleReset}
        canNext={trace && step < trace.expandedNodes.length}
        canReset={!!trace}
        onRunAll={handleRunAll}
      />
      <div style={{marginBottom: 8, fontWeight: 'bold', fontSize: '1.1em'}}>Step: {trace ? step + 1 : 0}</div>
      {explanation && (
        <div className="card" style={{marginBottom: 18, background: 'rgba(40,40,50,0.92)', color: '#b0b0c3', fontSize: '1.08em'}}>
          <b>Step Explanation:</b> {explanation}
        </div>
      )}
      <GraphVisualizer
        graph={graph}
        path={path}
        visited={visited}
        expanding={expanding}
        startNode={startNode}
        endNode={endNode}
      />
      <StepCostList stepCosts={stepCosts} />
      <PathOutput path={path} pathCost={pathCost} />
    </div>
  );
}

export default AStarSearchDemo;
