import { useEffect, useState } from "react";
import api from "../api/axios";
import Spinner from "../components/Spinner";

const CATEGORIES = [
  "FOOD", "TRAVEL", "SHOPPING", "EDUCATION",
  "ENTERTAINMENT", "HEALTHCARE", "BILLS", "MISCELLANEOUS"
];

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("FOOD");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editError, setEditError] = useState("");

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budgets/");
      setBudgets(res.data);
    } catch (err) {
      setError("Failed to load budgets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const validate = () => {
    const errs = {};
    if (!budgetAmount || Number(budgetAmount) <= 0) {
      errs.budgetAmount = "Enter an amount greater than 0";
    }
    if (!year || year < 2000 || year > 2100) {
      errs.year = "Enter a valid year";
    }
    const duplicate = budgets.some(
      (b) => b.category === category && b.month === month && b.year === year
    );
    if (duplicate) {
      errs.category = `A ${category} budget already exists for ${monthName(month)} ${year}`;
    }
    return errs;
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
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
      await api.post("/budgets/", { category, budget_amount: budgetAmount, month, year });
      setBudgetAmount("");
      showToast("✅ Budget added!");
      fetchBudgets();
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Failed to add budget.";
      setFormError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await api.delete(`/budgets/${id}/`);
      showToast("🗑️ Budget deleted");
      fetchBudgets();
    } catch (err) {
      alert("Failed to delete budget.");
    }
  };

  const startEdit = (b) => {
    setEditingId(b.id);
    setEditAmount(b.budget_amount);
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
    setEditError("");
  };

  const saveEdit = async (id) => {
    if (!editAmount || Number(editAmount) <= 0) {
      setEditError("Enter an amount greater than 0");
      return;
    }
    try {
      await api.patch(`/budgets/${id}/`, { budget_amount: editAmount });
      setEditingId(null);
      showToast("✅ Budget updated");
      fetchBudgets();
    } catch (err) {
      alert("Failed to update budget.");
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

  const smallBtn = {
    padding: "5px 10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    marginLeft: "6px",
  };

  const total = budgets.reduce((sum, b) => sum + parseFloat(b.budget_amount), 0);
  const monthName = (m) => MONTHS.find((x) => x.value === m)?.label || m;

  return (
    <div style={{ maxWidth: "650px" }}>
      <h1>Budgets</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }} noValidate>
        <div style={{ marginBottom: "14px" }}>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle(!!fieldErrors.category)}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {fieldErrors.category && <p style={errorTextStyle}>{fieldErrors.category}</p>}
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label>Budget Amount</label>
          <input
            type="number"
            step="0.01"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            style={inputStyle(!!fieldErrors.budgetAmount)}
          />
          {fieldErrors.budgetAmount && <p style={errorTextStyle}>{fieldErrors.budgetAmount}</p>}
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
          <div style={{ flex: 1 }}>
            <label>Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={inputStyle(false)}>
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={inputStyle(!!fieldErrors.year)}
            />
            {fieldErrors.year && <p style={errorTextStyle}>{fieldErrors.year}</p>}
          </div>
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
          Add Budget
        </button>
      </form>

      {loading && <Spinner />}
      {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

      {!loading && !error && (
        <>
          <h2>Total Budgeted: ₹{total.toFixed(2)}</h2>
          {budgets.length === 0 ? (
            <p style={{ color: "#8fae9c" }}>No budgets set yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #2a3f32" }}>
                  <th style={{ textAlign: "left", padding: "8px" }}>Category</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Month</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Year</th>
                  <th style={{ textAlign: "right", padding: "8px" }}>Amount</th>
                  <th style={{ padding: "8px" }}></th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #1f2e25" }}>
                    <td style={{ padding: "8px" }}>{b.category}</td>
                    <td style={{ padding: "8px" }}>{monthName(b.month)}</td>
                    <td style={{ padding: "8px" }}>{b.year}</td>
                    <td style={{ padding: "8px", textAlign: "right" }}>
                      {editingId === b.id ? (
                        <>
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            style={{ ...inputStyle(!!editError), width: "90px", display: "inline-block", marginTop: 0 }}
                          />
                          {editError && <p style={errorTextStyle}>{editError}</p>}
                        </>
                      ) : (
                        `₹${b.budget_amount}`
                      )}
                    </td>
                    <td style={{ padding: "8px", whiteSpace: "nowrap" }}>
                      {editingId === b.id ? (
                        <>
                          <button onClick={() => saveEdit(b.id)} style={{ ...smallBtn, background: "#10b981", color: "#fff" }}>Save</button>
                          <button onClick={cancelEdit} style={{ ...smallBtn, background: "#333", color: "#fff" }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(b)} style={{ ...smallBtn, background: "#2a3f32", color: "#10b981" }}>Edit</button>
                          <button onClick={() => handleDelete(b.id)} style={{ ...smallBtn, background: "rgba(255,90,90,0.15)", color: "#ff8080" }}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

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

export default Budgets;