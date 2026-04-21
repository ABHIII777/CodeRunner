import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles/Login.css";

export default function Login() {
    const navigate = useNavigate();

    const [IsAuth, setIsAuth] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    let handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    let handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const res = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: formData.email, 
                    password: formData.password 
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                setIsAuth(true);
            } else {
                alert(data.message || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Connection error to server");
        }
    }

    useEffect(() => {
        if (IsAuth) {
            navigate("/dashboard");
        }
    }, [IsAuth]);

    return (
        <div className="auth-page">
            <header className="app-header">
                <div className="brand">
                    <span className="brand-mark"><Link to="/" className="nav-link">CR</Link></span>
                    <span className="brand-text"><Link to="/" className="nav-link">CodeRunner</Link></span>
                </div>

                <nav className="app-nav">
                    <Link to="/login" className="nav-link active">
                        Login
                    </Link>
                    <Link to="/signup" className="nav-link">
                        Sign Up
                    </Link>
                </nav>
            </header>

            <main className="auth-main">
                <section className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Welcome back</h1>
                        <p className="auth-subtitle">
                            Login to continue to your workspace.
                        </p>
                    </div>
                    <form className="auth-form" onSubmit={handleLogin}>
                        <label className="field">
                            <span className="field-label">Email</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label className="field">
                            <span className="field-label">Password</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <div className="field-row">
                            <label className="checkbox-label">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="link-muted">
                                Forgot password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            className="btn primary"
                        >
                            Login
                        </button>
                    </form>
                    <p className="auth-footer">
                        Don’t have an account?&nbsp;
                        <Link to="/signup" className="link-accent">
                            Sign Up
                        </Link>
                    </p>
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