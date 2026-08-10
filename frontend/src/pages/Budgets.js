import { useEffect, useState } from "react";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import "../styles/theme.css";

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

  const monthName = (m) => MONTHS.find((x) => x.value === m)?.label || m;

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

  const total = budgets.reduce((sum, b) => sum + parseFloat(b.budget_amount), 0);

  return (
    <div className="page-md">
      <h1>Budgets</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }} noValidate>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={fieldErrors.category ? "invalid" : ""}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {fieldErrors.category && <p className="field-error">{fieldErrors.category}</p>}
        </div>

        <div className="field">
          <label htmlFor="budgetAmount">Budget Amount</label>
          <input
            id="budgetAmount"
            type="number"
            step="0.01"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            className={fieldErrors.budgetAmount ? "invalid" : ""}
          />
          {fieldErrors.budgetAmount && <p className="field-error">{fieldErrors.budgetAmount}</p>}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="month">Month</label>
            <select id="month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="year">Year</label>
            <input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={fieldErrors.year ? "invalid" : ""}
            />
            {fieldErrors.year && <p className="field-error">{fieldErrors.year}</p>}
          </div>
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <button type="submit" className="btn-primary" style={{ width: "auto", padding: "10px 22px" }}>
          Add Budget
        </button>
      </form>

      {loading && <Spinner />}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <>
          <h2>Total Budgeted: ₹{total.toFixed(2)}</h2>
          {budgets.length === 0 ? (
            <p style={{ color: "var(--slate)" }}>No budgets set yet.</p>
          ) : (
            <div className="panel" style={{ padding: "18px 22px" }}>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Month</th>
                    <th>Year</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => (
                    <tr key={b.id}>
                      <td>{b.category}</td>
                      <td>{monthName(b.month)}</td>
                      <td>{b.year}</td>
                      <td className="amt" style={{ textAlign: "right" }}>
                        {editingId === b.id ? (
                          <>
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className={`input-inline inline-edit${editError ? " invalid" : ""}`}
                            />
                            {editError && <p className="field-error">{editError}</p>}
                          </>
                        ) : (
                          `₹${b.budget_amount}`
                        )}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {editingId === b.id ? (
                          <>
                            <button onClick={() => saveEdit(b.id)} className="btn-pill save">Save</button>
                            <button onClick={cancelEdit} className="btn-pill cancel">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(b)} className="btn-pill edit">Edit</button>
                            <button onClick={() => handleDelete(b.id)} className="btn-pill delete">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default Budgets;