import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/theme.css";

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

  return (
    <div className="page-md">
      <h1>Savings Goals</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }} noValidate>
        <div className="field">
          <label htmlFor="title">Goal Title</label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Emergency Fund, New Laptop"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldErrors.title ? "invalid" : ""}
          />
          {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
        </div>

        <div className="field">
          <label htmlFor="targetAmount">Target Amount</label>
          <input
            id="targetAmount"
            type="number"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className={fieldErrors.targetAmount ? "invalid" : ""}
          />
          {fieldErrors.targetAmount && <p className="field-error">{fieldErrors.targetAmount}</p>}
        </div>

        <div className="field">
          <label htmlFor="savedAmount">Already Saved (optional)</label>
          <input
            id="savedAmount"
            type="number"
            step="0.01"
            value={savedAmount}
            onChange={(e) => setSavedAmount(e.target.value)}
            className={fieldErrors.savedAmount ? "invalid" : ""}
          />
          {fieldErrors.savedAmount && <p className="field-error">{fieldErrors.savedAmount}</p>}
        </div>

        <div className="field">
          <label htmlFor="deadline">Deadline (optional)</label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={fieldErrors.deadline ? "invalid" : ""}
          />
          {fieldErrors.deadline && <p className="field-error">{fieldErrors.deadline}</p>}
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <button type="submit" className="btn-primary" style={{ width: "auto", padding: "10px 22px" }}>
          Add Goal
        </button>
      </form>

      {loading && <p style={{ color: "var(--slate)" }}>Loading...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <>
          {goals.length === 0 ? (
            <p style={{ color: "var(--slate)" }}>No savings goals yet.</p>
          ) : (
            goals.map((g) => {
              const progress = Math.min(
                (parseFloat(g.saved_amount) / parseFloat(g.target_amount)) * 100,
                100
              );
              return (
                <div key={g.id} className="goal-card-item">
                  <div className="goal-head">
                    <h3>{g.title}</h3>
                    <button onClick={() => handleDelete(g.id)} className="btn-pill delete">
                      Delete
                    </button>
                  </div>
                  <p className="goal-meta">
                    ₹{g.saved_amount} of ₹{g.target_amount}
                    {g.deadline && ` · Deadline: ${g.deadline}`}
                  </p>
                  <div className="goal-progress-track">
                    <div
                      className={`goal-progress-fill${progress >= 100 ? " complete" : ""}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      <p style={{ marginTop: "20px" }}>
        <a href="/dashboard" className="back-link">Back to Dashboard</a>
      </p>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default SavingsGoals;