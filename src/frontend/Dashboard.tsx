import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./styles/Dashboard.css";

export default function Dashboard() {
  const [divs, setDivs] = useState<{ id: number; text: string }[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const newProject = () => {
    const newProjects = { id: new Date().getTime(), text: "New Project" };
    setDivs((prevDivs) => [...prevDivs, newProjects]);
  };

  const handleDelete = (id) => {
    setDivs((prevDivs) => prevDivs.filter((project) => project.id !== id));
  }

  useEffect(() => {
    fetch("/activity.xml")
      .then((res) => res.text())
      .then((data) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "text/xml");

        const activities = xml.getElementsByTagName("activity");
        const parsedActivities = [];

        for (let i = 0; i < activities.length; i++) {
          const file = activities[i].getElementsByTagName("file")[0]?.textContent;
          const language = activities[i].getElementsByTagName("language")[0]?.textContent;
          const status = activities[i].getElementsByTagName("status");

          parsedActivities.push({ file, language, status });
        }

        setActivities(parsedActivities);
      });
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">CR</span>
          <span className="brand-text">CodeRunner</span>
        </div>
        <nav className="app-nav">
          <Link to="/dashboard" className="nav-link active">
            Dashboard
          </Link>
          <Link to="/workspace" className="nav-link ">
            Workspace
          </Link>
          <Link to="/" className="nav-link ">
            Logout
          </Link>
        </nav>
      </header>

      <main className="app-main dashboard-layout">
        <aside className="sidebar">
          <h2 className="sidebar-title">Projects</h2>
          <button className="btn secondary full-width" onClick={newProject}>
            + New Project
          </button>
          <ul className="project-list">
            {divs.map((divData) => (
              <li key={divData.id} className="project-item">
                <div className="project-name">{divData.text}
                  <button className="project-delete" onClick={() => handleDelete(divData.id)}>Delete</button>
                </div>
                <div className="project-meta">{divData.id}</div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="content">
          <div className="content-header">
            <div>
              <h1>Good afternoon, Developer</h1>
              <p className="muted">
                Jump back into your recent projects or start something new.
              </p>
            </div>
            <Link to="/workspace" className="btn primary">
              Open Workspace
            </Link>
          </div>

          <section className="cards-grid">
            <article className="card">
              <h2>Recent Runs</h2>
              <ul className="list">
                <li>main.py &mdash; Python &mdash; Passed</li>
                <li>index.js &mdash; Node &mdash; Failed (timeout)</li>
                <li>solution.cpp &mdash; C++ &mdash; Passed</li>
              </ul>
            </article>

            <article className="card">
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                <button className="btn ghost">New file</button>
                <button className="btn ghost">Import project</button>
                <button className="btn ghost">View logs</button>
              </div>
            </article>

            <article className="card span-2">
              <h2>Activity</h2>
              <ul className="list">
                {
                  activities.map((act, index) => (
                    <li key={index}> {act.file} - {act.language} - {act.status}</li>
                  ))
                }
              </ul>
            </article>
          </section>
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
