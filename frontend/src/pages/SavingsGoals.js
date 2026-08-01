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
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);

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

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Goal title is required";
    if (!targetAmount || Number(targetAmount) <= 0) {
      errs.targetAmount = "Enter a target amount greater than 0";
    }
    if (savedAmount && Number(savedAmount) < 0) {
      errs.savedAmount = "Saved amount can't be negative";
    }
    if (
      savedAmount &&
      targetAmount &&
      Number(savedAmount) > Number(targetAmount)
    ) {
      errs.savedAmount = "Saved amount can't exceed the target";
    }
    if (deadline && deadline < new Date().toISOString().split("T")[0]) {
      errs.deadline = "Deadline can't be in the past";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
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
      showToast("🎯 Goal added!");
      fetchGoals();
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Failed to add goal.";
      setFormError(msg);
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Delete this savings goal?")) return;
  try {
    await api.delete(`/goals/${id}/`);
    showToast("🗑️ Goal deleted");
    fetchGoals();
  } catch (err) {
    alert("Failed to delete goal.");
  }
};


  
  const inputStyle = (hasError) => ({
    display: "block",
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: hasError ? "1px solid #ff6b6b" : "1px solid #333",
    background: "#16241c",
    color: "#fff",
    marginTop: "4px",
    boxSizing: "border-box",
  });

  const errorTextStyle = { color: "#ff6b6b", fontSize: "0.85rem", marginTop: "4px" };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1>Savings Goals</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }} noValidate>
        <div style={{ marginBottom: "14px" }}>
          <label>Goal Title</label>
          <input
            type="text"
            placeholder="e.g. Emergency Fund, New Laptop"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle(!!fieldErrors.title)}
          />
          {fieldErrors.title && <p style={errorTextStyle}>{fieldErrors.title}</p>}
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label>Target Amount</label>
          <input
            type="number"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            style={inputStyle(!!fieldErrors.targetAmount)}
          />
          {fieldErrors.targetAmount && <p style={errorTextStyle}>{fieldErrors.targetAmount}</p>}
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label>Already Saved (optional)</label>
          <input
            type="number"
            step="0.01"
            value={savedAmount}
            onChange={(e) => setSavedAmount(e.target.value)}
            style={inputStyle(!!fieldErrors.savedAmount)}
          />
          {fieldErrors.savedAmount && <p style={errorTextStyle}>{fieldErrors.savedAmount}</p>}
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label>Deadline (optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={inputStyle(!!fieldErrors.deadline)}
          />
          {fieldErrors.deadline && <p style={errorTextStyle}>{fieldErrors.deadline}</p>}
        </div>

        {formError && <p style={{ color: "#ff6b6b" }}>{formError}</p>}

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "linear-gradient(90deg, #059669, #10b981)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Add Goal
        </button>
      </form>

      {loading && <p style={{ color: "#8fae9c" }}>Loading...</p>}
      {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

      {!loading && !error && (
        <>
          {goals.length === 0 ? (
            <p style={{ color: "#8fae9c" }}>No savings goals yet.</p>
          ) : (
            goals.map((g) => {
              const progress = Math.min(
                (parseFloat(g.saved_amount) / parseFloat(g.target_amount)) * 100,
                100
              );
              return (
                <div
                  key={g.id}
                  style={{
                    border: "1px solid #2a3f32",
                    borderRadius: "8px",
                    padding: "14px",
                    marginBottom: "12px",
                    background: "#16241c",
                    color: "#fff",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h3 style={{ margin: "0 0 8px 0" }}>{g.title}</h3>
  <button
    onClick={() => handleDelete(g.id)}
    style={{
      background: "rgba(255,90,90,0.15)",
      color: "#ff8080",
      border: "none",
      padding: "5px 10px",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "13px",
    }}
  >
    Delete
  </button>
</div>
                  <p style={{ margin: "0 0 8px 0", color: "#8fae9c" }}>
                    ₹{g.saved_amount} of ₹{g.target_amount}
                    {g.deadline && ` · Deadline: ${g.deadline}`}
                  </p>
                  <div style={{ background: "#2a3f32", borderRadius: "4px", height: "10px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${progress}%`,
                        background: progress >= 100 ? "#10b981" : "#4a90d9",
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
        <a href="/dashboard" style={{ color: "#10b981" }}>Back to Dashboard</a>
      </p>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "linear-gradient(90deg, #059669, #10b981)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            fontWeight: "600",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default SavingsGoals;