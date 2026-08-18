import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import "../styles/theme.css";

const CATEGORIES = [
  "FOOD", "TRAVEL", "SHOPPING", "EDUCATION",
  "ENTERTAINMENT", "HEALTHCARE", "BILLS", "MISCELLANEOUS"
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const monthKey = (dateStr) => (dateStr ? dateStr.slice(0, 7) : ""); // "YYYY-MM"

const monthLabel = (key) => {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
};

function AddExpense() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", amount: "", category: "FOOD", date: "" });
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // month filter: "all" or "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState("all");

  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const res = await api.get("/expenses/");
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to load expenses", err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/expenses/", { title, amount, category, date });
      setSuccess(true);
      setTitle("");
      setAmount("");
      setCategory("FOOD");
      setDate("");
      fetchExpenses();
      setTimeout(() => setSuccess(false), 1500);
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Failed to add expense.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/expenses/${id}/`);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err) {
      console.error("Failed to delete expense", err);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setEditError("");
    setEditForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: exp.date,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (id) => {
    setSavingEdit(true);
    setEditError("");
    try {
      const res = await api.put(`/expenses/${id}/`, editForm);
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? res.data : exp))
      );
      setEditingId(null);
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Failed to update expense.";
      setEditError(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  // list of months that actually have expenses, newest first
  const availableMonths = useMemo(() => {
    const keys = new Set(expenses.map((e) => monthKey(e.date)));
    return Array.from(keys)
      .filter(Boolean)
      .sort((a, b) => (a < b ? 1 : -1));
  }, [expenses]);

  // expenses filtered by selected month (or all)
  const filteredExpenses = useMemo(() => {
    if (selectedMonth === "all") return expenses;
    return expenses.filter((e) => monthKey(e.date) === selectedMonth);
  }, [expenses, selectedMonth]);

  // group filtered expenses by month, newest month first, newest date first within month
  const groupedByMonth = useMemo(() => {
    const groups = {};
    filteredExpenses.forEach((e) => {
      const key = monthKey(e.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.keys(groups)
      .sort((a, b) => (a < b ? 1 : -1))
      .map((key) => ({
        key,
        label: monthLabel(key),
        items: groups[key].sort((a, b) => (a.date < b.date ? 1 : -1)),
        total: groups[key].reduce((sum, e) => sum + Number(e.amount || 0), 0),
      }));
  }, [filteredExpenses]);

  const totalShown = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="ae-layout">
      <style>{`
        .ae-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .ae-form-panel {
          flex: 0 0 380px;
          background: #fff;
          border-radius: 14px;
          padding: 28px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .ae-form-panel h1 {
          margin-top: 0;
          margin-bottom: 20px;
        }
        .ae-field {
          margin-bottom: 16px;
        }
        .ae-field label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 0.9rem;
        }
        .ae-field input,
        .ae-field select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d8d8e0;
          border-radius: 8px;
          font-size: 0.95rem;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .ae-field input:focus,
        .ae-field select:focus {
          outline: none;
          border-color: #1e2a5e;
          box-shadow: 0 0 0 3px rgba(30,42,94,0.12);
        }
        .ae-submit-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: #12193f;
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.1s ease, background 0.15s ease, opacity 0.15s ease;
        }
        .ae-submit-btn:hover:not(:disabled) {
          background: #1e2a5e;
          transform: translateY(-1px);
        }
        .ae-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .ae-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ae-error {
          color: #b3261e;
          font-size: 0.85rem;
          margin: 4px 0 12px;
        }
        .ae-success {
          color: #1a7f37;
          font-size: 0.85rem;
          margin: 4px 0 12px;
          animation: ae-fade-in 0.2s ease;
        }
        @keyframes ae-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ae-expenses-panel {
          flex: 1;
          min-width: 320px;
          background: #fff;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .ae-expenses-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 16px;
        }
        .ae-expenses-header h2 {
          margin: 0;
        }
        .ae-expenses-total {
          font-size: 0.9rem;
          color: #555;
          white-space: nowrap;
        }
        .ae-header-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .ae-month-select {
          padding: 6px 10px;
          border: 1px solid #d8d8e0;
          border-radius: 8px;
          font-size: 0.85rem;
          background: #fff;
          cursor: pointer;
        }
        .ae-month-select:focus {
          outline: none;
          border-color: #1e2a5e;
          box-shadow: 0 0 0 3px rgba(30,42,94,0.12);
        }
        .ae-month-group {
          margin-bottom: 22px;
        }
        .ae-month-group:last-child {
          margin-bottom: 0;
        }
        .ae-month-group-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 8px 8px;
          background: #f3f4f8;
          border-radius: 8px;
          margin-bottom: 4px;
        }
        .ae-month-group-label {
          font-weight: 700;
          font-size: 0.88rem;
          color: #2b2f42;
        }
        .ae-month-group-total {
          font-weight: 700;
          font-size: 0.85rem;
          color: #444;
        }
        .ae-table {
          width: 100%;
          border-collapse: collapse;
        }
        .ae-table th {
          text-align: left;
          padding: 8px;
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          color: #777;
        }
        .ae-row {
          border-top: 1px solid #eceef2;
          transition: background 0.15s ease;
        }
        .ae-row:hover {
          background: #f7f8fb;
        }
        .ae-row td {
          padding: 10px 8px;
          vertical-align: middle;
        }
        .ae-amount {
          font-weight: 700;
        }
        .ae-actions {
          display: flex;
          gap: 6px;
          white-space: nowrap;
        }
        .ae-btn {
          border: none;
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease, opacity 0.15s ease;
        }
        .ae-btn:active {
          transform: scale(0.96);
        }
        .ae-btn-edit {
          background: #e5ecff;
          color: #2447d6;
        }
        .ae-btn-edit:hover {
          background: #d3ddff;
        }
        .ae-btn-delete {
          background: #fbe3e0;
          color: #b3261e;
        }
        .ae-btn-delete:hover {
          background: #f6cfca;
        }
        .ae-btn-save {
          background: #d8f3dc;
          color: #1a7f37;
        }
        .ae-btn-save:hover {
          background: #c4ecc9;
        }
        .ae-btn-cancel {
          background: #eee;
          color: #444;
        }
        .ae-btn-cancel:hover {
          background: #e0e0e0;
        }
        .ae-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ae-edit-input,
        .ae-edit-select {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #c9cfe0;
          border-radius: 6px;
          font-size: 0.85rem;
          box-sizing: border-box;
        }
        .ae-empty {
          color: #888;
          font-style: italic;
          padding: 16px 0;
        }
        .ae-skeleton-row {
          height: 18px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f0f1f5 25%, #e6e8ee 37%, #f0f1f5 63%);
          background-size: 400% 100%;
          animation: ae-shimmer 1.4s ease infinite;
          margin: 10px 0;
        }
        @keyframes ae-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>

      <div className="ae-form-panel">
        <h1>Add Expense</h1>
        <form onSubmit={handleSubmit}>
          <div className="ae-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="ae-field">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="ae-field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="ae-field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {error && <p className="ae-error">{error}</p>}
          {success && <p className="ae-success">✓ Expense added!</p>}

          <button type="submit" className="ae-submit-btn" disabled={submitting}>
            {submitting ? "Adding..." : "Add Expense"}
          </button>
        </form>
      </div>

      <div className="ae-expenses-panel">
        <div className="ae-expenses-header">
          <h2>Expenses</h2>
          <div className="ae-header-right">
            {availableMonths.length > 0 && (
              <select
                className="ae-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="all">All months</option>
                {availableMonths.map((key) => (
                  <option key={key} value={key}>{monthLabel(key)}</option>
                ))}
              </select>
            )}
            {!loadingExpenses && filteredExpenses.length > 0 && (
              <span className="ae-expenses-total">
                Total: ₹{totalShown.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {loadingExpenses ? (
          <>
            <div className="ae-skeleton-row" />
            <div className="ae-skeleton-row" />
            <div className="ae-skeleton-row" />
          </>
        ) : filteredExpenses.length === 0 ? (
          <p className="ae-empty">
            {expenses.length === 0
              ? "No expenses yet. Add your first one on the left."
              : "No expenses for this month."}
          </p>
        ) : (
          groupedByMonth.map((group) => (
            <div key={group.key} className="ae-month-group">
              <div className="ae-month-group-header">
                <span className="ae-month-group-label">{group.label}</span>
                <span className="ae-month-group-total">₹{group.total.toFixed(2)}</span>
              </div>
              <table className="ae-table">
                <thead>
                  <tr>
                    <th>TITLE</th>
                    <th>CATEGORY</th>
                    <th>DATE</th>
                    <th>AMOUNT</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((exp) => {
                    const isEditing = editingId === exp.id;
                    return (
                      <tr className="ae-row" key={exp.id}>
                        {isEditing ? (
                          <>
                            <td>
                              <input
                                className="ae-edit-input"
                                value={editForm.title}
                                onChange={(e) => handleEditChange("title", e.target.value)}
                              />
                            </td>
                            <td>
                              <select
                                className="ae-edit-select"
                                value={editForm.category}
                                onChange={(e) => handleEditChange("category", e.target.value)}
                              >
                                {CATEGORIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                className="ae-edit-input"
                                type="date"
                                value={editForm.date}
                                onChange={(e) => handleEditChange("date", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                className="ae-edit-input"
                                type="number"
                                step="0.01"
                                value={editForm.amount}
                                onChange={(e) => handleEditChange("amount", e.target.value)}
                              />
                            </td>
                            <td>
                              <div className="ae-actions">
                                <button
                                  className="ae-btn ae-btn-save"
                                  onClick={() => saveEdit(exp.id)}
                                  disabled={savingEdit}
                                  type="button"
                                >
                                  {savingEdit ? "Saving..." : "Save"}
                                </button>
                                <button
                                  className="ae-btn ae-btn-cancel"
                                  onClick={cancelEdit}
                                  disabled={savingEdit}
                                  type="button"
                                >
                                  Cancel
                                </button>
                              </div>
                              {editError && <p className="ae-error">{editError}</p>}
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{exp.title}</td>
                            <td>{exp.category}</td>
                            <td>{exp.date}</td>
                            <td className="ae-amount">₹{Number(exp.amount).toFixed(2)}</td>
                            <td>
                              <div className="ae-actions">
                                <button
                                  className="ae-btn ae-btn-edit"
                                  onClick={() => startEdit(exp)}
                                  type="button"
                                >
                                  Edit
                                </button>
                                <button
                                  className="ae-btn ae-btn-delete"
                                  onClick={() => handleDelete(exp.id)}
                                  disabled={deletingId === exp.id}
                                  type="button"
                                >
                                  {deletingId === exp.id ? "..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AddExpense;