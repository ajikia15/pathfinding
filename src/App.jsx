import "./App.css";
import { useState } from "react";
import AlgorithmSearchDemo from "./components/AStarSearchDemo";

function App() {
  const [tab, setTab] = useState("astar");
  return (
    <div className="main-app-bg">
      <header className="main-header">
        <div className="logo-title">
          <span className="logo-dot" />
          <h1>Graph Search Visualizer</h1>
        </div>
        <nav className="tab-nav">
          <button
            className={tab === "astar" ? "tab-btn active" : "tab-btn"}
            onClick={() => setTab("astar")}
          >
            A* / Bidirectional IDDFS
          </button>
          <button
            className={tab === "other" ? "tab-btn active" : "tab-btn"}
            onClick={() => setTab("other")}
          >
            Other Algorithm
          </button>
        </nav>
      </header>
      <main className="main-content">
        {tab === "astar" && <AlgorithmSearchDemo />}
        {tab === "other" && (
          <div className="algo-placeholder card">
            <h2>Other Algorithm</h2>
            <p>Coming soon! Add your algorithm here.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
