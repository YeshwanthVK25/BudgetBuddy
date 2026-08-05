import { useEffect, useState } from "react";
import api from "../api/axios";

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
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                is_read: true,
              }
            : n
        )
      );
    } catch {
      setError("Failed to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        is_read: true,
      }))
    );

    try {
      await Promise.all(
        unread.map((n) =>
          api.patch(`/notifications/${n.id}/read/`)
        )
      );
    } catch {
      setError("Failed to mark all as read.");
      fetchNotifications();
    }
  };

  const dismissNotification = async (id) => {
    const previous = notifications;

    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );

    try {
      await api.delete(`/notifications/${id}/`);
    } catch {
      setError("Failed to dismiss notification.");
      setNotifications(previous);
    }
  };

  const priorityColor = (priority) => {
    if (priority === "high") return "#ef4444";
    if (priority === "medium") return "#f59e0b";
    return "#10b981";
  };

  const typeIcon = (type) => {
    if (type === "alert") return "⚠️";
    if (type === "success") return "✅";
    return "ℹ️";
  };

  const unreadCount = notifications.filter(
    (n) => !n.is_read
  ).length;

  const filters = [
    {
      key: "all",
      label: "All",
    },
    {
      key: "unread",
      label: "Unread",
    },
    {
      key: "alert",
      label: "Alerts",
    },
    {
      key: "success",
      label: "Success",
    },
    {
      key: "info",
      label: "Info",
    },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;

    return n.notification_type === filter;
  });

  return (
    <div
      style={{
        maxWidth: "760px",
        margin: "20px auto",
        padding: "24px",
        background: "#111827",
        color: "#fff",
        borderRadius: "16px",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h1
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#fff",
          }}
        >
          Notifications

          {unreadCount > 0 && (
            <span
              style={{
                background: "#10b981",
                color: "#fff",
                borderRadius: "999px",
                padding: "2px 10px",
                fontSize: "13px",
              }}
            >
              {unreadCount}
            </span>
          )}
        </h1>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      <p
        style={{
          color: "#9ca3af",
          marginBottom: "20px",
        }}
      >
        Stay on top of your budget alerts and goals.
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              cursor: "pointer",
              border:
                filter === f.key
                  ? "1px solid #10b981"
                  : "1px solid #374151",
              background:
                filter === f.key
                  ? "#10b981"
                  : "#1f2937",
              color: "#fff",
              fontWeight: "600",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <p style={{ color: "#9ca3af" }}>
          Loading notifications...
        </p>
      )}

      {error && (
        <p style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
      {!loading && !error && (
        <>
          {filteredNotifications.length === 0 ? (
            <div
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "50px 20px",
                textAlign: "center",
                color: "#d1d5db",
              }}
            >
              <div
                style={{
                  fontSize: "50px",
                  marginBottom: "15px",
                }}
              >
                🔔
              </div>

              <h3
                style={{
                  margin: "0 0 10px",
                  color: "#fff",
                }}
              >
                No Notifications
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#9ca3af",
                }}
              >
                You're all caught up!
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onMouseEnter={() => setHoveredId(n.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: n.is_read ? "#1f2937" : "#243244",
                  border: "1px solid #374151",
                  borderLeft: `5px solid ${priorityColor(
                    n.priority
                  )}`,
                  borderRadius: "12px",
                  padding: "18px",
                  marginBottom: "15px",
                  transition: "0.2s",
                  boxShadow:
                    hoveredId === n.id
                      ? "0 8px 18px rgba(0,0,0,.35)"
                      : "0 2px 6px rgba(0,0,0,.15)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "#111827",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "18px",
                      }}
                    >
                      {typeIcon(n.notification_type)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: 0,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {n.title}

                        {!n.is_read && (
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              background: "#10b981",
                              borderRadius: "50%",
                              display: "inline-block",
                            }}
                          />
                        )}
                      </h3>

                      <p
                        style={{
                          marginTop: "8px",
                          color: "#d1d5db",
                          lineHeight: "1.5",
                        }}
                      >
                        {n.message}
                      </p>

                      <small
                        style={{
                          color: "#9ca3af",
                        }}
                      >
                        {n.notification_type} •{" "}
                        {n.priority} priority •{" "}
                        {timeAgo(n.created_at)}
                      </small>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    {!n.is_read && (
                      <button
                        onClick={() =>
                          markAsRead(n.id)
                        }
                        style={{
                          padding: "6px 12px",
                          background: "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Read
                      </button>
                    )}

                    <button
                      onClick={() =>
                        dismissNotification(n.id)
                      }
                      onMouseEnter={() =>
                        setHoveredX(n.id)
                      }
                      onMouseLeave={() =>
                        setHoveredX(null)
                      }
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        background:
                          hoveredX === n.id
                            ? "#ef4444"
                            : "#374151",
                        color: "#fff",
                        fontWeight: "bold",
                        transition: ".2s",
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