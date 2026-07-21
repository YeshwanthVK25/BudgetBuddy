import { useEffect, useState } from "react";
import api from "../api/axios";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/");
        setProfile(res.data);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "#ff6b6b" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "400px" }}>
      <h1>Profile</h1>
      <div
        style={{
          background: "#1a2b21",
          borderRadius: "12px",
          padding: "24px",
          marginTop: "16px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "linear-gradient(90deg, #059669, #10b981)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "16px",
          }}
        >
          {profile.username.charAt(0).toUpperCase()}
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ color: "#8fae9c", fontSize: "13px" }}>Username</div>
          <div style={{ fontSize: "16px" }}>{profile.username}</div>
        </div>

        <div>
          <div style={{ color: "#8fae9c", fontSize: "13px" }}>Email</div>
          <div style={{ fontSize: "16px" }}>{profile.email || "Not provided"}</div>
        </div>
      </div>
    </div>
  );
}

export default Profile;