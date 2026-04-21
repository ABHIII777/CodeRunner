import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles/Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [isAuth, setIsAuth] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  let handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  let handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsAuth(true);
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Connection error to server");
    }
  }

  useEffect(() => {
    if (isAuth) {
      navigate("/dashboard")
    }
  }, [isAuth])

  return (
    <div className="auth-page">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark"><Link to="/">CR</Link></span>
          <span className="brand-text"><Link to="/" className="nav-link">CodeRunner</Link></span>
        </div>
        <nav className="app-nav">
          <Link to="/login" className="nav-link">
            Login
          </Link>
          <Link to="/signup" className="nav-link active">
            Sign Up
          </Link>
        </nav>
      </header>

      <main className="auth-main">
        <section className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">
              Start building and running your code in minutes.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSignUp}>
            <div className="field-row">
              <label className="field">
                <span className="field-label">First name</span>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Alex"
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="field">
                <span className="field-label">Last name</span>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Johnson"
                  onChange={handleChange}
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
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <input
                type="password"
                name="password"
                placeholder="Create a strong password"
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                onChange={handleChange}
                required
              />
            </label>

            <label className="checkbox-label">
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
            >
              Create account
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?&nbsp;
            <Link to="/login" className="link-accent">
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