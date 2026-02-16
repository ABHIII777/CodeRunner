import { Link, useNavigate } from "react-router-dom";
import "./styles/Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">CR</span>
          <span className="brand-text">CodeRunner</span>
        </div>
        <nav className="app-nav">
          <Link to="/" className="nav-link">
            Login
          </Link>
          <Link to="/signup" className="nav-link active">
            Sign Up
          </Link>
        </nav>
      </header>

      <main className="app-main">
        <section className="auth-card">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Start building and running your code in minutes.
          </p>

          <form className="auth-form">
            <div className="field-row">
              <label className="field">
                <span className="field-label">First name</span>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Alex"
                  required
                />
              </label>
              <label className="field">
                <span className="field-label">Last name</span>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Johnson"
                  required
                />
              </label>
            </div>

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
                placeholder="Create a strong password"
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                required
              />
            </label>

            <label className="checkbox">
              <input type="checkbox" required />
              <span>
                I agree to the
                <a href="#" className="link-accent">
                  Terms of Service
                </a>
                and
                <a href="#" className="link-accent">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            <button
              type="submit"
              className="btn primary"
              onClick={() => navigate("/")}
            >
              Create account
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?&nbsp;
            <Link to="/" className="auth-footer">
              Login
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
