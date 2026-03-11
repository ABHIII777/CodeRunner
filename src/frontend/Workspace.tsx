import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import "./styles/Workspace.css";

export default function Workspace() {

  const [files, setFiles] = useState<{id: number; text: String }[]>([]);

  const newFile = () => {
    const newFiles = {id: new Date().getTime(), text: "", isEditing: true};
    setFiles((prevFiles) => [...prevFiles, newFiles]);
  }

  const handleDelete = (id) => {
    setFiles((prevFile) => prevFile.filter((file) => file.id !== id))
  } 

  const handleChange = (id, value) => {
    setFiles((prev) => 
      prev.map((file) => 
        file.id === id ? {...file, text: value} : file
      )
    )
  }

  const finishEditing = (id) => {
    setFiles((prev) => 
      prev.map((file) => 
        file.id === id ? {...file, isEditing: false} : file
      )
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">CR</span>
          <span className="brand-text">CodeRunner</span>
        </div>
        <nav className="app-nav">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/workspace" className="nav-link active">
            workspace
          </Link>
          <Link to="/" className="nav-link">
            Logout
          </Link>
        </nav>
      </header>

      <main className="app-main workspace-layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h2 className="sidebar-title">Files</h2>
            <button className="btn secondary full-width" onClick={newFile}>+ New File</button>
            <ul className="file-list">
              {/* <li className="file-item active">main.py</li>
              <li className="file-item">index.js</li>
              <li className="file-item">solution.cpp</li> */}
              {
                files.map((fileData) => (
                  <li key={fileData.id} className="file-item">
                    <div className="file-name">
                      {
                        fileData.isEditing ? (
                          <input 
                            className="file-name-input"
                            placeholder="Enter file name"
                            value={fileData.text}
                            onChange={(e) => handleChange(fileData.id, e.target.value)}
                            onBlur={() => finishEditing(fileData.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                finishEditing(fileData.id)
                              }
                            }}
                          />
                        ) : (
                          <p>{fileData.text}</p>
                        )
                      }
                      <button className="file-delete" onClick={() => handleDelete(fileData.id)}>X</button>
                    </div>
                  </li>
                ))
              }
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
            <Editor 
              defaultLanguage="python"
              defaultValue={`print("Hello World!")`}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "Cascadia Code, monospace",
                minimap: { enabled: true },
                wordWrap: "on",
                cursorSmoothCaretAnimation: "on",
              }}
            />
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
            <div className="terminal-line muted">
              Process finished with exit code 0
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          &copy; <span id="year"></span> CodeRunner. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
