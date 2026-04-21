import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import "./styles/Workspace.css";

export default function Workspace() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectId = queryParams.get("project");

    const [files, setFiles] = useState<any[]>([]);
    const [activeFileId, setActiveFileId] = useState<number | null>(null);
    const [terminalOutput, setTerminalOutput] = useState<any[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [loading, setLoading] = useState(true);
    const debounceRef = useRef<any>(null);
    const pendingResolveRef = useRef<((value: any) => void) | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const submittingFileRef = useRef<Set<number>>(new Set());

    const activeFile = files.find(f => f.file_id === activeFileId);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        if (!projectId) {
            setLoading(false);
            return;
        }

        fetchFiles(token);
    }, [projectId]);

    const fetchFiles = async (token: string) => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:3000/projects/${projectId}/files`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFiles(data);
                if (data.length > 0) setActiveFileId(data[0].file_id);
            }
        } catch (err) {
            console.error("Error fetching files:", err);
        } finally {
            setLoading(false);
        }
    };

    const createFile = () => {
        if (!projectId) return alert("Select a project first");

        const tempId = Date.now();

        setFiles(prev => [
            ...prev,
            {
                file_id: tempId,
                file_name: "untitled.txt",
                isEditing: true,
                language: "text",
                content: ""
            }
        ]);

        setActiveFileId(tempId);
    };

    const handleFileNameChange = (id: number, name: string) => {
        setFiles(prev => prev.map(f => f.file_id === id ? { ...f, file_name: name } : f));
    };

    const finishFileCreate = async (id: number, name: string) => {
        // Guard against double-fire (Enter fires blur too)
        if (submittingFileRef.current.has(id)) return;

        if (!name.trim()) {
            setFiles(prev => prev.filter(f => f.file_id !== id));
            return;
        }

        submittingFileRef.current.add(id);

        const extension = name.split('.').pop()?.toLowerCase();
        const language =
            extension === 'py' ? 'python' :
            extension === 'js' ? 'javascript' :
            extension === 'ts' ? 'typescript' :
            extension === 'cpp' || extension === 'c' ? 'cpp' :
            'text';

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:3000/projects/${projectId}/files`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name, language, content: "" })
            });

            if (res.ok) {
                const newFile = await res.json();
                setFiles(prev => prev.map(f => f.file_id === id ? newFile : f));
                setActiveFileId(newFile.file_id);
            } else {
                const errText = await res.text();
                alert(`Failed to create file: ${errText || res.status}`);
                setFiles(prev => prev.filter(f => f.file_id !== id));
            }
        } catch (err: any) {
            alert(`Cannot connect to server. Is the backend running?\n${err.message}`);
            setFiles(prev => prev.filter(f => f.file_id !== id));
        } finally {
            submittingFileRef.current.delete(id);
        }
    };

    const saveFile = async (content: string) => {
        if (!activeFileId) return;

        const token = localStorage.getItem("token");
        try {
            await fetch(`http://localhost:3000/files/${activeFileId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            setFiles(files.map(f => f.file_id === activeFileId ? { ...f, content } : f));
        } catch (err) {
            console.error("Error saving file:", err);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        console.log("File selected:", file.name, file.size, "bytes");

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;
            console.log("File content read successfully. Length:", content.length);

            const fileName = file.name;
            const extension = fileName.split('.').pop();
            const language = extension === 'py' ? 'python' : extension === 'js' ? 'javascript' : 'text';

            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`http://localhost:3000/projects/${projectId}/files`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ name: fileName, language, content })
                });

                if (res.ok) {
                    const newFile = await res.json();
                    console.log("File saved to backend:", newFile);
                    setFiles(prev => [...prev, newFile]);
                    setActiveFileId(newFile.file_id);
                } else {
                    console.error("Failed to save file to backend:", await res.text());
                }
            } catch (err) {
                console.error("Error uploading file:", err);
            }
        };
        reader.onerror = (err) => console.error("FileReader error:", err);
        reader.readAsText(file);
        // Reset input
        event.target.value = "";
    };

    const deleteFile = async (id: number) => {
        if (!confirm("Delete this file?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:3000/files/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const newFiles = files.filter(f => f.file_id !== id);
                setFiles(newFiles);
                if (activeFileId === id) {
                    setActiveFileId(newFiles.length > 0 ? newFiles[0].file_id : null);
                }
            }
        } catch (err) {
            console.error("Error deleting file:", err);
        }
    };

    const runCode = async () => {
        if (!activeFile) return;

        setIsRunning(true);
        setTerminalOutput(prev => [...prev, { type: 'input', text: `Running ${activeFile.file_name}...` }]);

        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:3000/run", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    fileId: activeFile.file_id,
                    language: activeFile.language,
                    content: activeFile.content
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setTerminalOutput(prev => [...prev, { type: 'error', text: `Error: ${data.message || 'Execution failed'}` }]);
                return;
            }

            setTerminalOutput(prev => [
                ...prev,
                { type: 'output', text: data.output },
                { type: 'meta', text: `[Finished in ${data.time} - Status: ${data.status}]` }
            ]);
        } catch (err) {
            setTerminalOutput(prev => [...prev, { type: 'error', text: "Execution failed: Cannot connect to server" }]);
        } finally {
            setIsRunning(false);
        }
    };

    const handleEditorMount = (editor: any, monaco: any) => {
        const provideSuggestions = (model: any, position: any, language: string): Promise<any> => {
            // Resolve any previous pending promise immediately so Monaco doesn't hang
            if (pendingResolveRef.current) {
                pendingResolveRef.current({ items: [] });
                pendingResolveRef.current = null;
            }
            // Cancel any in-flight debounce timer
            if (debounceRef.current) clearTimeout(debounceRef.current);

            return new Promise<any>((resolve) => {
                // Store this promise's resolve so we can cancel it on the next keystroke
                pendingResolveRef.current = resolve;

                debounceRef.current = setTimeout(async () => {
                    // If we're still the active promise, clear the ref
                    if (pendingResolveRef.current === resolve) {
                        pendingResolveRef.current = null;
                    }

                    const textUntilPosition = model.getValueInRange({
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    });

                    const token = localStorage.getItem("token");
                    try {
                        const res = await fetch("http://localhost:3000/suggest", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({ prompt: textUntilPosition, language })
                        });

                        if (res.ok) {
                            const { suggestions } = await res.json();
                            if (suggestions && suggestions.length > 0) {
                                resolve({
                                    items: suggestions.map((s: string) => ({
                                        insertText: s,
                                        range: new monaco.Range(
                                            position.lineNumber,
                                            position.column,
                                            position.lineNumber,
                                            position.column
                                        ),
                                    })),
                                });
                                return;
                            }
                        }
                    } catch (err) {
                        console.error("Suggestion error:", err);
                    }
                    resolve({ items: [] });
                }, 600);
            });
        };

        monaco.languages.registerInlineCompletionsProvider("python", {
            provideInlineCompletions: (model: any, position: any) => {
                return provideSuggestions(model, position, "python");
            },
            freeInlineCompletions: () => { },
        });

        monaco.languages.registerInlineCompletionsProvider("javascript", {
            provideInlineCompletions: (model: any, position: any) => {
                return provideSuggestions(model, position, "javascript");
            },
            freeInlineCompletions: () => { },
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    if (loading) return <div className="loading">Loading Workspace...</div>;

    return (
        <div className="app-shell workspace-shell">
            <header className="app-header workspace-header">
                <div className="brand">
                    <span className="brand-mark">CR</span>
                    <span className="brand-text">CodeRunner</span>
                </div>
                <nav className="app-nav">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/workspace" className="nav-link active">Workspace</Link>
                    <div className="nav-divider"></div>
                    <button onClick={handleLogout} className="nav-link btn-link">Logout</button>
                </nav>
            </header>

            <main className="workspace-main">
                {!projectId ? (
                    <div className="empty-workspace">
                        <h2>No Project Selected</h2>
                        <p>Please select a project from the dashboard to start coding.</p>
                        <Link to="/dashboard" className="btn primary">Back to Dashboard</Link>
                    </div>
                ) : (
                    <>
                        <aside className="workspace-sidebar">
                            <div className="sidebar-section files-section">
                                <div className="section-header">
                                    <h2 className="sidebar-title">Explorer</h2>
                                    <div className="section-actions">
                                        <button className="btn ghost icon-btn" onClick={() => fileInputRef.current?.click()} title="Upload File">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                        </button>
                                        <button className="btn ghost icon-btn" onClick={createFile} title="New File">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                </div>

                                <ul className="file-tree">
                                    {files.length === 0 && (
                                        <div className="empty-state small-text">No files in project.</div>
                                    )}
                                    {files.map((f) => (
                                        <li key={f.file_id} className={`file-item hover-effect ${activeFileId === f.file_id ? 'active' : ''}`} onClick={() => setActiveFileId(f.file_id)}>
                                            <svg className="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            {f.isEditing ? (
                                                <input
                                                    className="file-name-input"
                                                    autoFocus
                                                    placeholder="filename.py"
                                                    value={f.file_name}
                                                    onChange={(e) => handleFileNameChange(f.file_id, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            (e.target as HTMLInputElement).blur();
                                                        }
                                                        if (e.key === "Escape") {
                                                            submittingFileRef.current.add(f.file_id);
                                                            setFiles(prev => prev.filter(file => file.file_id !== f.file_id));
                                                        }
                                                    }}
                                                    onBlur={(e) => finishFileCreate(f.file_id, e.target.value)}
                                                />
                                            ) : (
                                                <span className="file-name truncate">{f.file_name}</span>
                                            )}
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!f.isEditing) deleteFile(f.file_id);
                                            }}
                                        >
                                            ×
                                        </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="sidebar-section env-section">
                                <h2 className="sidebar-title">Environment</h2>
                                <div className="select-wrapper">
                                    <select className="glass-select" value={activeFile?.language || 'python'} disabled>
                                        <option value="python">Python 3.11</option>
                                        <option value="javascript">Node 20</option>
                                        <option value="cpp">C++17</option>
                                    </select>
                                </div>
                            </div>
                        </aside>

                        <section className="editor-container">
                            <div className="editor-tab-bar">
                                <div className="editor-tabs">
                                    {activeFile && (
                                        <div className="editor-tab active">
                                            <span className={`tab-indicator ${activeFile.language}`}></span>
                                            {activeFile.file_name}
                                        </div>
                                    )}
                                </div>

                                <div className="editor-actions">
                                    <button className="btn ghost small toolbar-btn" title="Save" onClick={() => activeFile && saveFile(activeFile.content)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="monaco-wrapper">
                                {activeFile ? (
                                    <Editor
                                        key={activeFile.file_id}
                                        language={activeFile.language}
                                        value={activeFile.content}
                                        onMount={handleEditorMount}
                                        onChange={(value) => {
                                            const newContent = value || "";
                                            setFiles(files.map(f => f.file_id === activeFileId ? { ...f, content: newContent } : f));
                                        }}
                                        theme="vs-dark"
                                        options={{
                                            fontSize: 14,
                                            fontFamily: "Cascadia Code, Fira Code, monospace",
                                            minimap: { enabled: false },
                                            wordWrap: "on",
                                            padding: { top: 16 },
                                            inlineSuggest: { enabled: true },
                                            suggestOnTriggerCharacters: true
                                        }}
                                    />
                                ) : (
                                    <div className="no-file-selected">Select a file to start editing</div>
                                )}
                            </div>
                        </section>

                        <section className="terminal-pane">
                            <div className="terminal-header">
                                <div className="terminal-tabs">
                                    <span className="term-tab active">Output</span>
                                </div>
                                <button className="btn primary small run-btn" onClick={runCode} disabled={isRunning || !activeFile}>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    {isRunning ? "Running..." : "Run Code"}
                                </button>
                            </div>
                            <div className="terminal-body">
                                {terminalOutput.length === 0 && (
                                    <div className="terminal-line placeholder">No output yet. Click 'Run Code' to execute.</div>
                                )}
                                {terminalOutput.map((line, i) => (
                                    <div key={i} className={`terminal-line ${line.type}-line`}>
                                        {line.type === 'input' && <span className="prompt">~/workspace $</span>}
                                        <pre>{line.text}</pre>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

