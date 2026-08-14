import { Link, useLocation } from "react-router-dom";
import "../styles/theme.css";

function Sidebar() {
  const location = useLocation();
  

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/add-expense", label: "Expenses", icon: "💸" },
    { path: "/add-income", label: "Income", icon: "💰" },
    { path: "/budgets", label: "Budgets", icon: "📊" },
    { path: "/goals", label: "Savings Goals", icon: "🎯" },
    { path: "/notifications", label: "Notifications", icon: "🔔" },
    { path: "/reports", label: "Reports", icon: "📄" },
    { path: "/profile", label: "Profile", icon: "⚙️" },
    
  ];

  
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">B</div>
        <span className="name">BudgetBuddy</span>
      </div>

      <div className="sidebar-nav">
        {links.map((link) => {
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link${active ? " active" : ""}`}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          );
        })}
      </div>


    </div>
  );
}

export default Sidebar;