import Sidebar from "./Sidebar";
import "../styles/theme.css";

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">{children}</div>
    </div>
  );
}

export default Layout;