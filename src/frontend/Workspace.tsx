import { Link } from "react-router-dom";
import "./styles/Workspace.css"

export default function Workspace() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">CR</span>
          <span className="brand-text">CodeRunner</span>
        </div>
        <nav className="app-nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/workspace" className="nav-link active">workspace</Link>
          <Link to="/" className="nav-link">Logout</Link>
        </nav>
      </header>

      <main className="app-main workspace-layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h2 className="sidebar-title">Files</h2>
            <button className="btn secondary full-width">+ New File</button>
            <ul className="file-list">
              <li className="file-item active">main.py</li>
              <li className="file-item">index.js</li>
              <li className="file-item">solution.cpp</li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h2 className="sidebar-title">Environment</h2>
            <select className="select">
              <option>Python 3.11</option>
              <option>Node 20</option>
              <option>C++17</option>
            </select>
          </div>
        </aside>

        <section className="editor-pane">
          <div className="editor-header">
            <div className="tabs">
              <button className="tab active">main.py</button>
              <button className="tab">index.js</button>
            </div>
            <div className="editor-actions">
              <button className="btn ghost small">Format</button>
              <button className="btn ghost small">Download</button>
            </div>
          </div>

          <div className="editor-area" aria-label="Code editor (static mockup)">
            <pre className="code">
              <span className="code-comment"># Example Python code</span>
              <span className="code-keyword">def</span> <span className="code-fn">greet</span>(name: <span className="code-type">str</span>) -&gt; <span className="code-type">None</span>:
              <span className="code-keyword">print</span>(f<span className="code-string">"Hello, There!"</span>)

              <span className="code-keyword">if</span> __name__ == <span className="code-string">"__main__"</span>:
                greet(<span className="code-string">"CodeRunner"</span>)
            </pre>
          </div>
        </section>

        <section className="output-pane">
          <div className="output-header">
            <h2>Output</h2>
            <button className="btn primary small">Run</button>
          </div>
          <div className="terminal">
            <div className="terminal-line muted">▶ python main.py</div>
            <div className="terminal-line">Hello, CodeRunner!</div>
            <div className="terminal-line muted">Process finished with exit code 0</div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; <span id="year"></span> CodeRunner. All rights reserved.</p>
      </footer>
    </div>
  );
}
