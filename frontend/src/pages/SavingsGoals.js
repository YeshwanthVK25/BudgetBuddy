import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/theme.css";

function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
  new Date().toISOString().slice(0, 7)
);
const [monthlySavings, setMonthlySavings] = useState([]);
  const [error, setError] = useState("");
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editSavedAmount, setEditSavedAmount] = useState("");
  const [monthlyEditGoalId, setMonthlyEditGoalId] = useState(null);
  const [monthlyEditAmount, setMonthlyEditAmount] = useState("");

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
  const fetchMonthlySavings = async () => {
  try {
    const res = await api.get("/monthly-savings/");
    setMonthlySavings(res.data);
    console.log("Monthly savings:", res.data);
  } catch (err) {
    console.error("Failed to load monthly savings:", err);
  }
};
const saveMonthlyAmount = async (goal) => {
  const amount = Number(monthlyEditAmount);

  if (amount < 0) {
    alert("Monthly saved amount cannot be negative.");
    return;
  }

  const existingRecord = monthlySavings.find(
    (item) =>
      Number(item.goal) === Number(goal.id) &&
      item.month.slice(0, 7) === selectedMonth
  );

  try {
    const data = {
      goal: goal.id,
      month: `${selectedMonth}-01`,
      planned_amount: getMonthlyRequired(goal),
      saved_amount: amount,
    };

    if (existingRecord) {
      await api.patch(
        `/monthly-savings/${existingRecord.id}/`,
        {
          planned_amount: data.planned_amount,
          saved_amount: data.saved_amount,
        }
      );
    } else {
      await api.post("/monthly-savings/", data);
    }

    setMonthlyEditGoalId(null);
    setMonthlyEditAmount("");

    await fetchMonthlySavings();

    showToast("💰 Monthly saving updated!");
  } catch (err) {
    console.error(err);
    alert("Failed to save monthly amount.");
  }
};
  useEffect(() => {
  fetchGoals();
  fetchMonthlySavings();
}, []);
const getMonthlyRequired = (goal) => {
  const target = Number(goal.target_amount || 0);
  const saved = Number(goal.saved_amount || 0);

  const remaining = Math.max(target - saved, 0);

  if (remaining <= 0) {
    return 0;
  }

  if (!goal.deadline) {
    return remaining;
  }

  const deadline = new Date(goal.deadline);
  const selected = new Date(`${selectedMonth}-01`);

  // Goal is already past its deadline
  if (selected > deadline) {
    return 0;
  }

  const monthsRemaining =
    (deadline.getFullYear() - selected.getFullYear()) * 12 +
    (deadline.getMonth() - selected.getMonth()) +
    1;

  return remaining / Math.max(monthsRemaining, 1);
};
const selectedMonthData = monthlySavings.filter((item) => {
  if (!item.month) return false;

  return item.month.slice(0, 7) === selectedMonth;
});

const monthlyTarget = selectedMonthData.reduce(
  (total, item) => total + Number(item.planned_amount || 0),
  0
);

const monthlySaved = selectedMonthData.reduce(
  (total, item) => total + Number(item.saved_amount || 0),
  0
);

const monthlyRemaining = Math.max(
  monthlyTarget - monthlySaved,
  0
);

const monthlyProgress =
  monthlyTarget > 0
    ? Math.min((monthlySaved / monthlyTarget) * 100, 100)
    : 0;

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

  const startEditGoal = (g) => {
  setEditingGoalId(g.id);
  setEditSavedAmount(g.saved_amount);
};

const saveEditGoal = async (id, targetAmount) => {
  if (Number(editSavedAmount) < 0) {
    alert("Saved amount can't be negative.");
    return;
  }
  if (Number(editSavedAmount) > Number(targetAmount)) {
    alert("Saved amount can't exceed the target amount.");
    return;
  }
  try {
    await api.patch(`/goals/${id}/`, {
      saved_amount: editSavedAmount,
    });
    setEditingGoalId(null);
    showToast("✅ Goal updated!");
    fetchGoals();
  } catch (err) {
    alert("Failed to update goal.");
  }
};

  return (
    <div className="page-md">

  <div className="savings-header">
    <div>
      <p className="savings-label">Savings Planner</p>
      <h1>Savings Goals</h1>
      <p className="savings-subtitle">
        Plan your savings and track your progress
      </p>
    </div>

    <div className="month-selector">
      <label htmlFor="month">Month</label>

      <input
        id="month"
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      />
    </div>
  </div>
<div className="monthly-summary">

  <div className="monthly-card">
    <span className="summary-icon">🎯</span>
    <div>
      <small>Monthly Target</small>
      <strong>₹{monthlyTarget.toFixed(2)}</strong>
    </div>
  </div>

  <div className="monthly-card">
    <span className="summary-icon">💰</span>
    <div>
      <small>Saved This Month</small>
      <strong>₹{monthlySaved.toFixed(2)}</strong>
    </div>
  </div>

  <div className="monthly-card">
    <span className="summary-icon">📌</span>
    <div>
      <small>Remaining</small>
      <strong>₹{monthlyRemaining.toFixed(2)}</strong>
    </div>
  </div>

  <div className="monthly-card">
    <span className="summary-icon">📊</span>
    <div>
      <small>Progress</small>
      <strong>{monthlyProgress.toFixed(0)}%</strong>
    </div>
  </div>

</div>

<div className="monthly-progress">

  <div className="monthly-progress-header">

    <div>
      <span>Monthly Progress</span>
      <small>
        {selectedMonth}
      </small>
    </div>

    <strong>
      {monthlyProgress.toFixed(0)}%
    </strong>

  </div>

  <div className="monthly-progress-track">

    <div
      className="monthly-progress-fill"
      style={{
        width: `${monthlyProgress}%`,
      }}
    />

  </div>

  <div className="monthly-progress-info">

    <div>
      <span>Saved</span>
      <strong>
        ₹{monthlySaved.toFixed(2)}
      </strong>
    </div>

    <div>
      <span>Target</span>
      <strong>
        ₹{monthlyTarget.toFixed(2)}
      </strong>
    </div>

    <div>
      <span>Remaining</span>
      <strong>
        ₹{monthlyRemaining.toFixed(2)}
      </strong>
    </div>

  </div>

</div>
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
              const monthlyRequired = getMonthlyRequired(g);
              const remainingAmount = Math.max(Number(g.target_amount) - Number(g.saved_amount),0);
              
              return (
                <div key={g.id} className="goal-card-item">
                  <div className="goal-head">
  <h3>{g.title}</h3>
  <div>
    {editingGoalId === g.id ? (
      <>
        <button onClick={() => saveEditGoal(g.id, g.target_amount)} className="btn-pill save">
          Save
        </button>
        <button onClick={() => setEditingGoalId(null)} className="btn-pill cancel">
          Cancel
        </button>
      </>
    ) : (
      <>
        <button onClick={() => startEditGoal(g)} className="btn-pill edit">
          Edit
        </button>
        <button onClick={() => handleDelete(g.id)} className="btn-pill delete">
          Delete
        </button>
      </>
    )}
  </div>
</div>
<div className="goal-meta">
  <div className="goal-monthly-info">

  <div>
    <span>Remaining</span>
    <strong>₹{remainingAmount.toFixed(2)}</strong>
  </div>

  <div>
    <span>This Month Required</span>
    <strong>₹{monthlyRequired.toFixed(2)}</strong>
  </div>

</div>

<div className="monthly-save-box">

  <div className="monthly-save-header">
    <span>
      Saved in {selectedMonth}
    </span>

    {monthlyEditGoalId !== g.id && (
      <button
        type="button"
        className="btn-pill edit"
        onClick={() => {
          const existingRecord = monthlySavings.find(
            (item) =>
              Number(item.goal) === Number(g.id) &&
              item.month.slice(0, 7) === selectedMonth
          );

          setMonthlyEditGoalId(g.id);
          setMonthlyEditAmount(
            existingRecord ? existingRecord.saved_amount : ""
          );
        }}
      >
        Update
      </button>
    )}
  </div>

  {monthlyEditGoalId === g.id ? (
    <div className="monthly-edit-row">

      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Enter amount"
        value={monthlyEditAmount}
        onChange={(e) => setMonthlyEditAmount(e.target.value)}
      />

      <button
        type="button"
        className="btn-pill save"
        onClick={() => saveMonthlyAmount(g)}
      >
        Save
      </button>

      <button
        type="button"
        className="btn-pill cancel"
        onClick={() => {
          setMonthlyEditGoalId(null);
          setMonthlyEditAmount("");
        }}
      >
        Cancel
      </button>

    </div>
  ) : (
    <strong>
      ₹
      {Number(
        monthlySavings.find(
          (item) =>
            Number(item.goal) === Number(g.id) &&
            item.month.slice(0, 7) === selectedMonth
        )?.saved_amount || 0
      ).toFixed(2)}
    </strong>
  )}

</div>
  {editingGoalId === g.id ? (
    <>
      ₹
      <input
        type="number"
        step="0.01"
        value={editSavedAmount}
        onChange={(e) => setEditSavedAmount(e.target.value)}
        className="input-inline"
      />
      {" "}of ₹{g.target_amount}
    </>
  ) : (
    <>₹{g.saved_amount} of ₹{g.target_amount}</>
  )}
  {g.deadline && ` · Deadline: ${g.deadline}`}
</div>
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

