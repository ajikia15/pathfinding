import "./App.css";
import AStarSearchDemo from "./components/AStarSearchDemo";

function App() {
  return (
    <div className="main-app-bg">
      <header className="main-header">
        <h1>Graph Search Visualizer</h1>
        <p className="subtitle">A* Search Demo (more algorithms coming soon)</p>
      </header>
      <main className="main-content">
        <AStarSearchDemo />
      </main>
      <footer className="main-footer">
        <span>© {new Date().getFullYear()} Graph Search Visualizer</span>
      </footer>
    </div>
  );
}

export default App;
