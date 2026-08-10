import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/theme.css";

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString();
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [hoveredId, setHoveredId] = useState(null);
  const [hoveredX, setHoveredX] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data);
    } catch {
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
    } catch {
      setError("Failed to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await Promise.all(unread.map((n) => api.patch(`/notifications/${n.id}/read/`)));
    } catch {
      setError("Failed to mark all as read.");
      fetchNotifications();
    }
  };

  const dismissNotification = async (id) => {
    const previous = notifications;

    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      await api.delete(`/notifications/${id}/`);
    } catch {
      setError("Failed to dismiss notification.");
      setNotifications(previous);
    }
  };

  const priorityColor = (priority) => {
    if (priority === "high") return "var(--coral)";
    if (priority === "medium") return "var(--amber)";
    return "var(--accent)";
  };

  const typeIcon = (type) => {
    if (type === "alert") return "⚠️";
    if (type === "success") return "✅";
    return "ℹ️";
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filters = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "alert", label: "Alerts" },
    { key: "success", label: "Success" },
    { key: "info", label: "Info" },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    return n.notification_type === filter;
  });

  return (
    <div className="notif-shell">
      <div className="notif-header">
        <h1 className="notif-title-row">
          Notifications
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </h1>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-btn">
            Mark all as read
          </button>
        )}
      </div>

      <p className="notif-sub">Stay on top of your budget alerts and goals.</p>

      <div className="filter-row">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`filter-pill${filter === f.key ? " active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "var(--slate)" }}>Loading notifications...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <>
          {filteredNotifications.length === 0 ? (
            <div className="notif-empty">
              <div className="ic">🔔</div>
              <h3>No Notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onMouseEnter={() => setHoveredId(n.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`notif-card${n.is_read ? "" : " unread"}`}
                style={{
                  borderLeft: `5px solid ${priorityColor(n.priority)}`,
                  boxShadow: hoveredId === n.id ? "0 8px 18px rgba(16,26,43,.14)" : undefined,
                }}
              >
                <div className="notif-card-inner">
                  <div className="notif-main">
                    <div className="notif-icon">{typeIcon(n.notification_type)}</div>

                    <div className="notif-body">
                      <h3>
                        {n.title}
                        {!n.is_read && <span className="unread-dot" />}
                      </h3>

                      <p className="notif-message">{n.message}</p>

                      <small className="notif-meta">
                        {n.notification_type} • {n.priority} priority • {timeAgo(n.created_at)}
                      </small>
                    </div>
                  </div>

                  <div className="notif-actions">
                    {!n.is_read && (
                      <button onClick={() => markAsRead(n.id)} className="notif-read-btn">
                        Read
                      </button>
                    )}

                    <button
                      onClick={() => dismissNotification(n.id)}
                      onMouseEnter={() => setHoveredX(n.id)}
                      onMouseLeave={() => setHoveredX(null)}
                      className="notif-dismiss-btn"
                      style={{
                        background: hoveredX === n.id ? "var(--coral)" : undefined,
                        color: hoveredX === n.id ? "#fff" : undefined,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default Notifications;