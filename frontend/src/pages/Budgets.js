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
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await api.post("/budgets/", { category, budget_amount: budgetAmount, month, year });
      setBudgetAmount("");
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
      fetchBudgets();
    } catch (err) {
      alert("Failed to delete budget.");
    }
  };

  const startEdit = (b) => {
    setEditingId(b.id);
    setEditAmount(b.budget_amount);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/budgets/${id}/`, { budget_amount: editAmount });
      setEditingId(null);
      fetchBudgets();
    } catch (err) {
      alert("Failed to update budget.");
    }
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "#16241c",
    color: "#fff",
    marginTop: "4px",
    boxSizing: "border-box",
  };

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

      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "14px" }}>
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: "14px" }}>
          <label>Budget Amount</label>
          <input type="number" step="0.01" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} style={inputStyle} required />
        </div>
        <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
          <div style={{ flex: 1 }}>
            <label>Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={inputStyle}>
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Year</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={inputStyle} required />
          </div>
        </div>
        {formError && <p style={{ color: "#ff6b6b" }}>{formError}</p>}
        <button type="submit" style={{ padding: "10px 20px", background: "linear-gradient(90deg, #059669, #10b981)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
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
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          style={{ ...inputStyle, width: "90px", display: "inline-block", marginTop: 0 }}
                        />
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
    </div>
  );
}

export default Budgets;