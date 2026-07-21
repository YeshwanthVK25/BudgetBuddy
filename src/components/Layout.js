import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f1a14" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "30px", color: "#fff" }}>{children}</div>
    </div>
  );
}

export default Layout;