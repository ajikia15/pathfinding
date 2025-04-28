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

const CANVAS_WIDTH = Math.max(window.innerWidth * 0.98 - 400, 600);
const CANVAS_HEIGHT = Math.max(window.innerHeight * 0.7, 400);

function centerGraphNodes(graph) {
  // Center all nodes in the middle of the canvas if not already positioned
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;
  return {
    ...graph,
    nodes: graph.nodes.map((n) => ({
      ...n,
      x: n.x !== undefined ? n.x : centerX + (Math.random() - 0.5) * 40,
      y: n.y !== undefined ? n.y : centerY + (Math.random() - 0.5) * 40,
    })),
  };
}

function AStarSearchDemo() {
  const [graph, setGraph] = useState(centerGraphNodes(defaultGraph));
  const [startNode, setStartNode] = useState("Telavi");
  const [endNode, setEndNode] = useState("Sokhumi");
  const [trace, setTrace] = useState(null); // {path, stepCosts, expandedNodes, explanations}
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const autoRunTimeoutRef = useRef(null);
  const [pendingAutoRun, setPendingAutoRun] = useState(false);

  // On search, run A* and store the trace
  const handleSearch = () => {
    if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current);
    setIsAutoRunning(false);
    const result = findPathAStar(graph, startNode, endNode, true);
    setTrace(result);
    setStep(0);
    setFinished(false);
  };

  // Next step handler
  const handleNextStep = () => {
    if (!trace || isAutoRunning) return;
    if (step < trace.expandedNodes.length - 1) {
      setStep(step + 1);
    } else if (step === trace.expandedNodes.length - 1) {
      // Last expansion step, now show the final path
      setStep(step + 1);
      setFinished(true);
    } else {
      setFinished(true);
    }
  };

  // Run all steps automatically
  const handleRunAll = () => {
    if (isAutoRunning || finished) return;
    if (!trace) {
      setPendingAutoRun(true);
      handleSearch();
    } else {
      setIsAutoRunning(true);
    }
  };

  // Auto-run effect: when trace is set and pendingAutoRun is true, start auto-running
  useEffect(() => {
    if (pendingAutoRun && trace) {
      setIsAutoRunning(true);
      setPendingAutoRun(false);
    }
  }, [pendingAutoRun, trace]);

  // Auto-run steps effect
  useEffect(() => {
    if (isAutoRunning && trace && !finished) {
      let currentStep = step;
      function runNext() {
        if (currentStep < trace.expandedNodes.length - 1) {
          setStep((s) => s + 1);
          currentStep++;
          autoRunTimeoutRef.current = setTimeout(runNext, 700);
        } else {
          setStep((s) => s + 1);
          setFinished(true);
          setIsAutoRunning(false);
          autoRunTimeoutRef.current = null;
        }
      }
      runNext();
    }
    // Cleanup on unmount or when isAutoRunning changes
    return () => {
      if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current);
    };
  }, [isAutoRunning, trace, finished]);

  // Reset handler
  const handleReset = () => {
    if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current);
    setIsAutoRunning(false);
    setTrace(null);
    setStep(0);
    setFinished(false);
  };

  // Stop auto run handler
  const handleStop = () => {
    if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current);
    setIsAutoRunning(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current);
    };
  }, []);

  // Calculate state for visualization based on current step
  const isSearching = !!trace && !finished;
  const canNext = trace && step < trace.expandedNodes.length;
  const canReset = !!trace || isAutoRunning;
  const canRunAll = trace ? step < trace.expandedNodes.length : true; // Can always run if not started

  const visited = trace ? trace.expandedNodes.slice(0, step) : [];
  const expanding =
    trace && step < trace.expandedNodes.length
      ? trace.expandedNodes[step]
      : null;
  const path = trace && finished ? trace.path : [];
  const stepCosts = trace ? trace.stepCosts.slice(0, step) : []; // Show costs up to the node *before* expansion
  const pathCost =
    trace && finished ? calcPathCost(trace.path, graph.links) : 0;
  const explanation =
    trace && trace.explanations && step < trace.explanations.length
      ? trace.explanations[step]
      : null;

  return (
    <div className="astar-layout">
      {" "}
      {/* Use the new two-column layout class */}
      <aside className="astar-sidebar">
        {" "}
        {/* Sidebar column */}
        <Legend />
        <GraphSearchPanel
          graph={graph}
          startNode={startNode}
          setStartNode={setStartNode}
          endNode={endNode}
          setEndNode={setEndNode}
          handleSearch={handleSearch} // Initial search trigger
          isSearching={isSearching} // Overall searching state
          isAutoRunning={isAutoRunning}
          onNextStep={handleNextStep}
          onReset={handleReset}
          canNext={canNext && !isAutoRunning} // Disable next when auto-running
          canReset={canReset}
          onRunAll={handleRunAll}
          canRunAll={canRunAll && !isAutoRunning} // Disable run all when already running
          onStop={handleStop}
        />
        <div className="card step-section">
          {" "}
          {/* Step counter card */}
          <h4>Current Step</h4>
          <div className="step-label">
            Step: {trace ? step + 1 : 0} /{" "}
            {trace ? trace.expandedNodes.length + 1 : 1}
          </div>
        </div>
        {explanation && (
          <div className="card explanation-section">
            {" "}
            {/* Explanation card */}
            <h4>Step Explanation</h4>
            <p className="explanation-content">{explanation}</p>
          </div>
        )}
        {stepCosts.length > 0 && <StepCostList stepCosts={stepCosts} />}
        {path.length > 0 && <PathOutput path={path} pathCost={pathCost} />}
      </aside>
      <section className="astar-main">
        {" "}
        {/* Main content column */}
        <GraphVisualizer
          graph={graph}
          path={path}
          visited={visited}
          expanding={expanding}
          startNode={startNode}
          endNode={endNode}
        />
      </section>
    </div>
  );
}

export default AStarSearchDemo;
