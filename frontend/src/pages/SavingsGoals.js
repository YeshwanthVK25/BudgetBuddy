import { useEffect, useState } from "react";
import api from "../api/axios";

function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState("");

  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals/");
      setGoals(res.data);
    } catch (err) {
      setError("Failed to load savings goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await api.post("/goals/", {
        title,
        target_amount: targetAmount,
        saved_amount: savedAmount || 0,
        deadline: deadline || null,
      });
      setTitle("");
      setTargetAmount("");
      setSavedAmount("");
      setDeadline("");
      fetchGoals();
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Failed to add goal.";
      setFormError(msg);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      <h1>Savings Goals</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "12px" }}>
          <label>Goal Title</label>
          <input
            type="text"
            placeholder="e.g. Emergency Fund, New Laptop"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", width: "100%", padding: "8px" }}
            required
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label>Target Amount</label>
          <input
            type="number"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            style={{ display: "block", width: "100%", padding: "8px" }}
            required
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label>Already Saved (optional)</label>
          <input
            type="number"
            step="0.01"
            value={savedAmount}
            onChange={(e) => setSavedAmount(e.target.value)}
            style={{ display: "block", width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label>Deadline (optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ display: "block", width: "100%", padding: "8px" }}
          />
        </div>
        {formError && <p style={{ color: "red" }}>{formError}</p>}
        <button type="submit" style={{ padding: "8px 16px" }}>
          Add Goal
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          {goals.length === 0 ? (
            <p>No savings goals yet.</p>
          ) : (
            goals.map((g) => {
              const progress = Math.min(
                (parseFloat(g.saved_amount) / parseFloat(g.target_amount)) * 100,
                100
              );
              return (
                <div
                  key={g.id}
                  style={{ border: "1px solid #ddd", borderRadius: "6px", padding: "12px", marginBottom: "12px" }}
                >
                  <h3 style={{ margin: "0 0 8px 0" }}>{g.title}</h3>
                  <p style={{ margin: "0 0 8px 0" }}>
                    ₹{g.saved_amount} of ₹{g.target_amount}
                    {g.deadline && ` · Deadline: ${g.deadline}`}
                  </p>
                  <div style={{ background: "#eee", borderRadius: "4px", height: "10px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${progress}%`,
                        background: progress >= 100 ? "green" : "#4a90d9",
                        height: "100%",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      <p style={{ marginTop: "20px" }}>
        <a href="/dashboard">Back to Dashboard</a>
      </p>
    </div>
  );
}

export default SavingsGoals;