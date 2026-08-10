import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/theme.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      localStorage.setItem("username", username);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-grid">
      <div className="login-hero">
        <div>
          <div className="brand">
            <div className="brand-mark">B</div>
            <div className="brand-name">BudgetBuddy</div>
          </div>
          <div className="hero-copy">
            <span className="eyebrow">Student finance, simplified</span>
            <h1>Know where every rupee goes.</h1>
            <p>
              Track pocket money, plan budgets, and hit your savings goals —
              one clean dashboard for your whole financial life on campus.
            </p>
          </div>
        </div>
        <div className="hero-stats">
          <div className="features">
  <div className="feature-card">
    <div className="feature-icon">📊</div>
    <h3>Expense Tracking</h3>
    <p>Monitor your daily spending with detailed records.</p>
  </div>

  <div className="feature-card">
    <div className="feature-icon">💰</div>
    <h3>Income Management</h3>
    <p>Keep all your income sources organized in one place.</p>
  </div>

  <div className="feature-card">
    <div className="feature-icon">🎯</div>
    <h3>Budget Planning</h3>
    <p>Plan your budget and achieve your savings goals.</p>
  </div>
</div>
        </div>
      </div>

      <div className="login-panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <span className="kicker">WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p className="sub">Log in to continue to your budget dashboard.</p>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your.username"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: "42px" }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "16px",
                  userSelect: "none",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: "6px" }}>
            {loading ? "Signing in…" : "Log in"}
          </button>

          <div className="divider-text">or</div>

          <p className="signup-line">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;