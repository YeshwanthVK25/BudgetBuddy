import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/add-expense", label: "Expenses", icon: "💸" },
    { path: "/add-income", label: "Income", icon: "💰" },
    { path: "/budgets", label: "Budgets", icon: "📊" },
    { path: "/goals", label: "Savings Goals", icon: "🎯" },
    { path: "/profile", label: "Profile", icon: "⚙️" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #16241c, #0f1a14)",
        color: "#fff",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ color: "#10b981", marginBottom: "30px" }}>💰 BudgetBuddy</h2>

      <div style={{ flex: 1 }}>
        {links.map((link) => {
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                marginBottom: "8px",
                borderRadius: "8px",
                textDecoration: "none",
                color: active ? "#fff" : "#8fae9c",
                background: active
                  ? "linear-gradient(90deg, #059669, #10b981)"
                  : "transparent",
                fontWeight: active ? "600" : "400",
              }}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          );
        })}
      </div>

      <button
        onClick={handleLogout}
        style={{
          background: "rgba(255,90,90,0.15)",
          color: "#ff8080",
          border: "none",
          padding: "12px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

export default Sidebar;