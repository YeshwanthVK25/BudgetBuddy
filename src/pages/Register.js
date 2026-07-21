import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/register/", { username, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Registration failed.";
      setError(msg);
    }
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#16241c",
    color: "#fff",
    marginTop: "6px",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #16241c, #0f1a14)",
      }}
    >
      <div
        style={{
          width: "360px",
          background: "#1a2b21",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: "#10b981", margin: 0 }}>💰 BudgetBuddy</h1>
          <p style={{ color: "#8fae9c", marginTop: "6px" }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#8fae9c" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#8fae9c" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
          {success && <p style={{ color: "#10b981" }}>Account created! Redirecting to login...</p>}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(90deg, #059669, #10b981)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Register
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#8fae9c" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#10b981" }}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;