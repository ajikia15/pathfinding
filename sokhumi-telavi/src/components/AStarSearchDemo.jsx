import { useState, useRef, useEffect } from "react";
import GraphSearchPanel from "./GraphSearchPanel";
import GraphVisualizer from "./GraphVisualizer";
import StepCostList from "./StepCostList";
import PathOutput from "./PathOutput";
import Legend from "./Legend";
import { findPathAStar, calcPathCost } from "../algorithms/astar";

// --- New coordinate-based graph ---
const coordinateGraph = {
  nodes: [
    { id: "Telavi", x: 760, y: 120 },
    { id: "Sagarejo", x: 680, y: 160 },
    { id: "Tbilisi", x: 620, y: 220 },
    { id: "Mtskheta", x: 590, y: 200 },
    { id: "Rustavi", x: 700, y: 240 },
    { id: "Gori", x: 540, y: 260 },
    { id: "Kaspi", x: 570, y: 280 },
    { id: "Khashuri", x: 490, y: 300 },
    { id: "Surami", x: 420, y: 320 },
    { id: "Zestaponi", x: 380, y: 340 },
    { id: "Kutaisi", x: 300, y: 360 },
    { id: "Samtredia", x: 240, y: 380 },
    { id: "Senaki", x: 180, y: 400 },
    { id: "Zugdidi", x: 120, y: 360 },
    { id: "Poti", x: 140, y: 440 },
    { id: "Batumi", x: 60, y: 480 },
    { id: "Chiatura", x: 340, y: 300 },
    { id: "Ambrolauri", x: 320, y: 200 },
    { id: "Sokhumi", x: 80, y: 320 },
    { id: "Mestia", x: 40, y: 160 },
    { id: "Kazbegi", x: 560, y: 100 },
    { id: "Borjomi", x: 460, y: 340 },
    { id: "Akhaltsikhe", x: 220, y: 420 },
    { id: "Ozurgeti", x: 160, y: 400 },
    { id: "Tsalenjikha", x: 100, y: 380 },
    { id: "Martvili", x: 160, y: 360 },
    { id: "Terjola", x: 320, y: 320 },
    { id: "Tkibuli", x: 280, y: 280 },
    { id: "Dusheti", x: 580, y: 180 },
    { id: "Signagi", x: 800, y: 100 },
    { id: "Gurjaani", x: 740, y: 160 },
    { id: "Lentekhi", x: 280, y: 160 },
    { id: "Oni", x: 360, y: 140 },
    { id: "Marneuli", x: 680, y: 280 },
    { id: "Dedoplistskaro", x: 820, y: 320 },
    { id: "Lagodekhi", x: 780, y: 80 },
  ].map(n => ({ ...n, realX: n.x, realY: n.y })), // Store real coordinates
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
    { source: "Zugdidi", target: "Mestia", cost: 85 },
    { source: "Khashuri", target: "Borjomi", cost: 35 },
    { source: "Borjomi", target: "Akhaltsikhe", cost: 55 },
    { source: "Senaki", target: "Martvili", cost: 25 },
    { source: "Kutaisi", target: "Terjola", cost: 20 },
    { source: "Terjola", target: "Zestaponi", cost: 15 },
    { source: "Ambrolauri", target: "Oni", cost: 45 },
    { source: "Tbilisi", target: "Dusheti", cost: 40 },
    { source: "Dusheti", target: "Kazbegi", cost: 65 },
    { source: "Rustavi", target: "Marneuli", cost: 30 },
    { source: "Marneuli", target: "Dedoplistskaro", cost: 70 },
    { source: "Telavi", target: "Signagi", cost: 35 },
    { source: "Signagi", target: "Lagodekhi", cost: 25 },
    { source: "Samtredia", target: "Ozurgeti", cost: 40 },
    { source: "Ozurgeti", target: "Batumi", cost: 55 },
    { source: "Ambrolauri", target: "Lentekhi", cost: 35 },
    { source: "Zestaponi", target: "Tkibuli", cost: 30 },
    { source: "Mtskheta", target: "Dusheti", cost: 45 },
  ],
};

// --- Euclidean heuristic function using real coordinates ---
function heuristic(nodeA, nodeB) {
  const x1 = nodeA.realX;
  const y1 = nodeA.realY;
  const x2 = nodeB.realX;
  const y2 = nodeB.realY;
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

const CANVAS_WIDTH = Math.max(window.innerWidth * 0.98 - 400, 600);
const CANVAS_HEIGHT = Math.max(window.innerHeight * 0.7, 400);

function centerGraphNodes(graph) {
  // No longer needed: nodes already have x, y
  return graph;
}

function AStarSearchDemo() {
  const [graph, setGraph] = useState(centerGraphNodes(coordinateGraph));
  const [startNode, setStartNode] = useState("Telavi");
  const [endNode, setEndNode] = useState("Sokhumi");
  const [trace, setTrace] = useState(null); // {path, stepCosts, expandedNodes, explanations}
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const autoRunTimeoutRef = useRef(null);
  const [pendingAutoRun, setPendingAutoRun] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1500); // ms, default to slow for testing
  const simulationSpeedRef = useRef(simulationSpeed);
  useEffect(() => {
    simulationSpeedRef.current = simulationSpeed;
  }, [simulationSpeed]);

  // On search, run A* and store the trace
  const handleSearch = () => {
    if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current);
    setIsAutoRunning(false);
    // --- Pass heuristic and goalId to A* ---
    const result = findPathAStar(graph, startNode, endNode, true, heuristic);
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
      if (step < trace.expandedNodes.length - 1) {
        autoRunTimeoutRef.current = setTimeout(() => {
          setStep((s) => s + 1);
        }, simulationSpeedRef.current);
      } else if (step === trace.expandedNodes.length - 1) {
        autoRunTimeoutRef.current = setTimeout(() => {
          setStep((s) => s + 1);
          setFinished(true);
          setIsAutoRunning(false);
          autoRunTimeoutRef.current = null;
        }, simulationSpeedRef.current);
      }
    }
    // Cleanup on unmount or when isAutoRunning/step changes
    return () => {
      if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current);
    };
  }, [isAutoRunning, trace, finished, step]);

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
          simulationSpeed={simulationSpeed}
          setSimulationSpeed={setSimulationSpeed}
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
          heuristic={heuristic}
          goalNode={graph.nodes.find((n) => n.id === endNode)}
        />
      </section>
    </div>
  );
}

export default AStarSearchDemo;
