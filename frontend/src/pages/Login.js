import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#1a1730",
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
        background: "linear-gradient(180deg, #1e1b3a, #0f0d1f)",
      }}
    >
      <div
        style={{
          width: "360px",
          background: "#1a1730",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: "#b388ff", margin: 0 }}>💰 BudgetBuddy</h1>
          <p style={{ color: "#a89cd6", marginTop: "6px" }}>Welcome back! Log in to continue.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#c9c3e6" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#c9c3e6" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ ...inputStyle, paddingRight: "40px" }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "18px",
                  userSelect: "none",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(90deg, #7b2ff7, #a855f7)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Log In
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#a89cd6" }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#b388ff" }}>
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;