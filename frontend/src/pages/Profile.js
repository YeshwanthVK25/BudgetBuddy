import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/theme.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/");
      setProfile(res.data);
      setEmail(res.data.email || "");
    } catch (err) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setSaving(true);

      const res = await api.patch("/profile/", {
        email: email.trim(),
      });

      setProfile(res.data);
      setEmail(res.data.email);
      setEditing(false);
      setMessage("Email updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.email?.[0] ||
        "Failed to update email."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return <p className="form-error">{error}</p>;
  }

  const firstLetter =
    profile?.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="profile-page">

      {/* Page Header */}
      <div className="profile-header">
        <div>
          <p className="profile-subtitle">Account</p>
          <h1>My Profile</h1>
          <p className="profile-description">
            Manage your BudgetBuddy account information
          </p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="profile-main-card">

        {/* Profile Top */}
        <div className="profile-top">

          <div className="profile-avatar-xl">
            {firstLetter}
          </div>

          <div className="profile-user-info">
            <h2>{profile.username}</h2>
            <p>BudgetBuddy Member</p>

            <span className="profile-status">
              <span className="status-dot"></span>
              Active Account
            </span>
          </div>

        </div>

        {/* Divider */}
        <div className="profile-divider"></div>

        {/* Account Information */}
        <div className="profile-section-title">
          <span className="section-icon">👤</span>
          <div>
            <h3>Account Information</h3>
            <p>Your personal account details</p>
          </div>
        </div>

        <div className="profile-info-grid">

          {/* Username */}
          <div className="profile-info-box">
            <div className="profile-info-icon username-icon">
              👤
            </div>

            <div className="profile-info-content">
              <span>Username</span>
              <strong>{profile.username}</strong>
            </div>
          </div>

          {/* Email */}
          <div className="profile-info-box">
            <div className="profile-info-icon email-icon">
              ✉️
            </div>

            <div className="profile-info-content">
              <span>Email Address</span>

              {!editing ? (
                <strong>
                  {profile.email || "No email added"}
                </strong>
              ) : (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="profile-email-input"
                />
              )}
            </div>
          </div>

        </div>

        {/* Messages */}
        {message && (
          <div className="profile-success">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="profile-error">
            ⚠ {error}
          </div>
        )}

        {/* Buttons */}
        <div className="profile-actions">

          {!editing ? (
            <button
              className="profile-edit-btn"
              onClick={() => {
                setEditing(true);
                setMessage("");
                setError("");
              }}
            >
              ✏️ Edit Email
            </button>
          ) : (
            <>
              <button
                className="profile-save-btn"
                onClick={handleSaveEmail}
                disabled={saving}
              >
                {saving ? "Saving..." : "✓ Save Email"}
              </button>

              <button
                className="profile-cancel-btn"
                onClick={() => {
                  setEmail(profile.email || "");
                  setEditing(false);
                  setError("");
                }}
              >
                Cancel
              </button>
            </>
          )}

        </div>
      </div>

      {/* Security / Account Card */}
      <div className="profile-extra-card">

        <div className="extra-icon">
          🔐
        </div>

        <div className="extra-content">
          <h3>Your account is protected</h3>
          <p>
            Keep your email address updated so BudgetBuddy
            can send you important notifications and budget alerts.
          </p>
        </div>

        <div className="security-badge">
          Secure
        </div>

      </div>

    </div>
  );
}

export default Profile;