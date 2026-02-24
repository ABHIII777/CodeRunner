import "./styles/LandingPage.css";
import { useNavigate, Link } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-shell">
            <header className="landing-header">
                <div className="brand">
                    <div className="brand-mark">C</div>
                    <span className="brand-text">CodeRunner</span>
                </div>
                <nav className="landing-nav">
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/signup" className="nav-link active">Get Started</Link>
                </nav>
            </header>

            <main className="landing-main">
                <div className="hero-section">
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
                        </button>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Fast Execution</h3>
                        <p>High-performance runners that build and execute your code in milliseconds.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🌐</div>
                        <h3>Cloud Workspace</h3>
                        <p>A full-featured IDE accessible from any device, anywhere in the world.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>Secure by Default</h3>
                        <p>Isolated environments ensuring your code and data remain private and safe.</p>
                    </div>
                </div>
            </main>

            <footer className="landing-footer">
                <p>&copy; 2026 CodeRunner. All rights reserved.</p>
            </footer>
        </div>
    );
}
