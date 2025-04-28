import "./App.css";
import { useState } from "react";
import AlgorithmSearchDemo from "./components/AStarSearchDemo";

function App() {
  return (
    <div className="main-app-bg">
      <header className="main-header">
        <div className="logo-title">
          <span className="logo-dot" />
          <h1>Graph Search Visualizer</h1>
        </div>
      </header>
      <main className="main-content">
        <AlgorithmSearchDemo />
      </main>
    </div>
  );
}

export default App;
