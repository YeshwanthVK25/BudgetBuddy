import { useEffect, useState } from "react";
import api from "../api/axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data);
    } catch (err) {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      setError("Failed to mark notification as read.");
    }
  };

  const priorityColor = (priority) => {
    if (priority === "high") return "#e74c3c";
    if (priority === "medium") return "#f39c12";
    return "#95a5a6";
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      <h1>Notifications</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          {notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  border: "1px solid #ddd",
                  borderLeft: `4px solid ${priorityColor(n.priority)}`,
                  borderRadius: "6px",
                  padding: "12px",
                  marginBottom: "12px",
                  background: n.is_read ? "#f9f9f9" : "#fff",
                  opacity: n.is_read ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h3 style={{ margin: "0 0 6px 0", color: "#111" }}>{n.title}</h3>
  {!n.is_read && (
    <button
      onClick={() => markAsRead(n.id)}
      style={{ padding: "4px 10px", fontSize: "12px" }}
    >
      Mark as read
    </button>
  )}
</div>
<p style={{ margin: "0 0 6px 0", color: "#333" }}>{n.message}</p>
<small style={{ color: "#888" }}>
  {n.notification_type} · {n.priority} priority · {new Date(n.created_at).toLocaleString()}
</small>
              </div>
            ))
          )}
        </>
      )}

      <p style={{ marginTop: "20px" }}>
        <a href="/dashboard">Back to Dashboard</a>
      </p>
    </div>
  );
}

export default Notifications;