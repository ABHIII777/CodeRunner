import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [IsAuth, setIsAuth] = useState(false);

  function handleChange(formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (email != "" && password != "") {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  }

  useEffect(() => {
    if (IsAuth) {
      navigate("/dashboard");
    }
  }, [IsAuth]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">CR</span>
          <span className="brand-text">CodeRunner</span>
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

      <main className="app-main">
        <div className="wrapper">
          <section className="auth-card">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">
              Login to continue to your workspace.
            </p>
            <form className="auth-form" name="authForm" action={handleChange}>
              <label className="field">
                <span className="field-label">Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="field">
                <span className="field-label">Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                />
              </label>
              <div className="field-row">
                <label className="checkbox">
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
                onClick={() => setIsAuth(false)}
              >
                {" "}
                Login
              </button>
            </form>
            <p className="auth-footer">
              Don’t have an account?&nbsp;
              <Link to="/signup" className="auth-footer">
                Sign Up
              </Link>
            </p>
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          &copy; <span id="year"></span> CodeRunner. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
