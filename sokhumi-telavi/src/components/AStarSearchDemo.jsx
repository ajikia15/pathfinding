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
  const [path, setPath] = useState([]);
  const [pathCost, setPathCost] = useState(0);
  const [stepCosts, setStepCosts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [animStep, setAnimStep] = useState(-1); // -1 = idle
  const [animating, setAnimating] = useState(false);
  const [stepCounter, setStepCounter] = useState(0);
  const [visited, setVisited] = useState([]); // nodes visited in order
  const [expanding, setExpanding] = useState(null); // current node being expanded
  const animTimeout = useRef();

  // Animate the path step by step, including visited/expanding
  const handleSearch = () => {
    setIsSearching(true);
    setAnimating(false);
    setAnimStep(-1);
    setPath([]);
    setStepCosts([]);
    setPathCost(0);
    setStepCounter(0);
    setVisited([]);
    setExpanding(null);
    const result = findPathAStar(graph, startNode, endNode, true); // pass true for animation
    if (!result.path.length) {
      setPath([]);
      setStepCosts([]);
      setPathCost(0);
      setIsSearching(false);
      setStepCounter(0);
      setVisited([]);
      setExpanding(null);
      return;
    }
    setAnimating(true);
    setAnimStep(0);
    setStepCosts([]);
    setPath([]);
    setStepCounter(1);
    setVisited([]);
    setExpanding(null);
    // Animate steps
    let i = 0;
    function animateStep() {
      setPath(result.path.slice(0, i + 1));
      setStepCosts(result.stepCosts.slice(0, i + 1));
      setStepCounter(i + 1);
      setVisited(result.expandedNodes.slice(0, i));
      setExpanding(result.expandedNodes[i]);
      if (i === result.path.length - 1) {
        setPathCost(result.stepCosts[result.stepCosts.length - 1].total);
        setIsSearching(false);
        setAnimating(false);
        setAnimStep(-1);
        setExpanding(null);
        setVisited(result.expandedNodes);
        return;
      }
      setAnimStep(i);
      i++;
      animTimeout.current = setTimeout(animateStep, 700);
    }
    animateStep();
  };

  // Cleanup timeout on unmount or rerun
  useEffect(() => {
    return () => animTimeout.current && clearTimeout(animTimeout.current);
  }, []);

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
        isSearching={isSearching || animating}
      />
      <div style={{ marginBottom: 8, fontWeight: "bold", fontSize: "1.1em" }}>
        Step: {stepCounter}
      </div>
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
