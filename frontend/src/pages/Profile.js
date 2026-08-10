import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/theme.css";

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

  if (loading) return <p style={{ color: "var(--slate)" }}>Loading...</p>;
  if (error) return <p className="form-error">{error}</p>;

  return (
    <div className="page-md" style={{ maxWidth: "400px" }}>
      <h1>Profile</h1>
      <div className="profile-card">
        <div className="profile-avatar-lg">
          {profile.username.charAt(0).toUpperCase()}
        </div>

        <div className="profile-field">
          <div className="lab">Username</div>
          <div className="val">{profile.username}</div>
        </div>

        <div className="profile-field">
          <div className="lab">Email</div>
          <div className="val">{profile.email || "Not provided"}</div>
        </div>
      </div>
    </div>
  );
}

export default Profile;