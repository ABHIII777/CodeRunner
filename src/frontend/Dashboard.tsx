import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/");
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token: string) => {
    try {
      setLoading(true);
      const [projRes, actRes] = await Promise.all([
        fetch("http://localhost:3000/projects", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/activities", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (projRes.status === 403 || actRes.status === 403) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      const projectsData = await projRes.json();
      const activitiesData = await actRes.json();

      setProjects(projectsData);
      setActivities(activitiesData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = () => {
    const tempId = Date.now();
    setProjects([{ project_id: tempId, project_name: "", isEditing: true, created_at: new Date() }, ...projects]);
  };

  const handleProjectNameChange = (id: number, name: string) => {
    setProjects(projects.map(p => p.project_id === id ? { ...p, project_name: name } : p));
  };

  const finishProjectCreate = async (id: number, name: string) => {
    if (!name.trim()) {
      setProjects(projects.filter(p => p.project_id !== id));
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/projects", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        const newProj = await res.json();
        setProjects(projects.map(p => p.project_id === id ? newProj : p));
      } else {
        setProjects(projects.filter(p => p.project_id !== id));
      }
    } catch (err) {
      console.error("Error creating project:", err);
      setProjects(projects.filter(p => p.project_id !== id));
    }
  };

  const deleteProject = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/projects/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setProjects(projects.filter(p => p.project_id !== id));
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Get folder name from webkitRelativePath
    const firstFilePath = files[0].webkitRelativePath;
    const folderName = firstFilePath.split('/')[0] || "Imported Project";

    try {
      setLoading(true);
      // 1. Create a new project
      const projRes = await fetch("http://localhost:3000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: folderName })
      });

      if (!projRes.ok) throw new Error("Failed to create project");
      const newProject = await projRes.json();

      // 2. Read all files (ignoring common noise)
      const fileDataPromises = Array.from(files)
        .filter(file => {
          const path = file.webkitRelativePath.toLowerCase();
          return !path.includes('node_modules/') && !path.includes('.git/') && !path.includes('.ds_store');
        })
        .map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const content = e.target?.result as string;
              const fileName = file.webkitRelativePath.split('/').slice(1).join('/') || file.name;
              const extension = fileName.split('.').pop()?.toLowerCase();
              const language = extension === 'py' ? 'python' : extension === 'js' ? 'javascript' : 'text';
              resolve({ name: fileName, language, content });
            };
            reader.readAsText(file);
          });
        });

      const filesToUpload = await Promise.all(fileDataPromises);

      // 3. Bulk upload
      const bulkRes = await fetch(`http://localhost:3000/projects/${newProject.project_id}/files/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ files: filesToUpload })
      });

      if (bulkRes.ok) {
        setProjects(prev => [newProject, ...prev]);
        navigate(`/workspace?project=${newProject.project_id}`);
      } else {
        alert("Partial error during upload. Folder might be too large or contain invalid files.");
      }
    } catch (err) {
      console.error("Folder upload error:", err);
      alert("Failed to upload folder.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">CR</span>
          <span className="brand-text">CodeRunner</span>
        </div>
        <nav className="app-nav">
          <Link to="/dashboard" className="nav-link active">Dashboard</Link>
          <Link to="/workspace" className="nav-link">Workspace</Link>
          <div className="nav-divider"></div>
          <button onClick={handleLogout} className="nav-link btn-link">Logout</button>
        </nav>
      </header>

      <main className="app-main dashboard-layout">
        <aside className="sidebar dashboard-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Projects</h2>
            <button className="btn ghost icon-btn" onClick={createProject} title="New Project">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <ul className="project-list">
            {projects.length === 0 && (
              <div className="empty-state">No projects yet. Click + to create.</div>
            )}
            {projects.map((proj) => (
              <li key={proj.project_id} className="project-item">
                {proj.isEditing ? (
                  <div className="project-item-link">
                    <div className="project-icon glow-indigo">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div className="project-content">
                      <input 
                        className="project-name-input"
                        autoFocus
                        placeholder="Project Name"
                        value={proj.project_name}
                        onChange={(e) => handleProjectNameChange(proj.project_id, e.target.value)}
                        onBlur={() => finishProjectCreate(proj.project_id, proj.project_name)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") finishProjectCreate(proj.project_id, proj.project_name)
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <Link to={`/workspace?project=${proj.project_id}`} className="project-item-link">
                    <div className="project-icon glow-indigo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <div className="project-content">
                      <p className="project-name truncate">{proj.project_name || "Untitled Project"}</p>
                      <div className="project-meta text-muted text-xs">
                        Created: {new Date(proj.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                )}
                <button className="btn ghost delete-btn" onClick={() => deleteProject(proj.project_id)}>
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="content">
          <div className="content-header">
            <div>
              <h1 className="welcome-title text-gradient">Good afternoon, {user?.firstName || 'Developer'}</h1>
              <p className="welcome-subtitle text-muted">
                Jump back into your recent projects or start something new.
              </p>
            </div>
            <Link to="/workspace" className="btn primary big-btn shadow-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-2 w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Open Workspace
            </Link>
          </div>

          <section className="dashboard-grid">
            <article className="dash-card feature-glass">
              <h2 className="card-title">Quick Stats</h2>
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-value">{projects.length}</span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{activities.filter(a => a.status === 'Passed').length}</span>
                  <span className="stat-label">Successes</span>
                </div>
              </div>
            </article>

            <article className="dash-card feature-glass">
              <h2 className="card-title">Quick Actions</h2>
              <div className="quick-actions-grid">
                <button className="action-btn" onClick={createProject}>
                    <div className="action-icon indigo-ring">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                    <span>New Project</span>
                </button>
                <button className="action-btn" onClick={() => folderInputRef.current?.click()}>
                    <div className="action-icon cyan-ring">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <span>Import</span>
                </button>
                <button className="action-btn">
                    <div className="action-icon purple-ring">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <span>Docs</span>
                </button>
              </div>
            </article>

            <article className="dash-card feature-glass span-full">
              <h2 className="card-title flex-between">
                  Activity Timeline
                  <span className="text-xs text-muted font-normal">Recent events</span>
              </h2>
              {activities.length === 0 ? (
                  <div className="empty-state">No recent activity found.</div>
              ) : (
                <ul className="activity-list timeline-mode">
                  {activities.map((act) => (
                    <li key={act.activity_id} className="activity-item compact">
                      <div className={`timeline-dot ${act.status?.toLowerCase() === 'passed' ? 'success' : 'error'}`}></div>
                      <span className="file-name flex-1">{act.file_name}</span>
                      <span className="lang-badge generic">{act.language}</span>
                      <span className={`status-badge ${act.status?.toLowerCase() === 'passed' ? 'success' : 'error'}`}>
                          {act.status}
                      </span>
                      <span className="text-xs text-muted ml-2">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        </section>
      </main>

      <input
        type="file"
        ref={folderInputRef}
        style={{ display: "none" }}
        webkitdirectory="true"
        multiple
        onChange={handleFolderUpload}
      />
    </div>
  );
}

