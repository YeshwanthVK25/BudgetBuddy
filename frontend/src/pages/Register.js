import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/register/", { username, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-panel" style={{ minHeight: "100vh" }}>
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div className="brand" style={{ justifyContent: "center" }}>
            <div className="brand-mark">B</div>
            <span className="brand-name" style={{ color: "var(--ink)" }}>BudgetBuddy</span>
          </div>
          <p className="sub" style={{ marginTop: "10px" }}>Create your account</p>
        </div>

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">Account created! Redirecting to login...</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </button>

        <p className="signup-line" style={{ marginTop: "20px" }}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}

export default Register;