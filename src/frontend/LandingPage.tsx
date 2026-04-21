import { useNavigate, Link } from "react-router-dom";
import "./styles/LandingPage.css";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-shell">
            <div className="ambient-background">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <header className="app-header">
                <div className="brand">
                    <div className="brand-mark">CR</div>
                    <span className="brand-text">CodeRunner</span>
                </div>
                <nav className="app-nav">
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/signup" className="nav-link active">Get Started</Link>
                </nav>
            </header>

            <main className="landing-main">
                <section className="hero-section">
                    <div className="hero-content">
                        <div className="pill-badge">
                            <span className="pulse-dot"></span>
                            CodeRunner v2.0 is Live
                        </div>
                        <h1 className="hero-title">
                            Build the future of <span className="gradient-text">Coding</span>
                        </h1>
                        <p className="hero-subtitle">
                            Experience the most powerful and intuitive cloud-based workspace for developers. 
                            Write, run, and deploy code at the speed of thought.
                        </p>
                        <div className="hero-actions">
                            <button onClick={() => navigate("/signup")} className="btn primary big">
                                Start Building Now
                                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                            <button onClick={() => navigate("/login")} className="btn secondary big">
                                View Demo
                            </button>
                        </div>
                    </div>
                </section>

                <section className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon glow-indigo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3>Fast Execution</h3>
                        <p>High-performance runners that build and execute your code in milliseconds.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon glow-cyan">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3>Cloud Workspace</h3>
                        <p>A full-featured IDE accessible from any device, anywhere in the world.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon glow-purple">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3>Secure by Default</h3>
                        <p>Isolated environments ensuring your code and data remain private and safe.</p>
                    </div>
                </section>
            </main>

            <footer className="app-footer landing-footer">
                <p>&copy; {new Date().getFullYear()} CodeRunner. All rights reserved.</p>
            </footer>
        </div>
    );
}
