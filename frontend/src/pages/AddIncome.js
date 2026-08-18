import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import "../styles/theme.css";

const SOURCES = [
  "SALARY", "POCKET_MONEY", "SCHOLARSHIP", "FREELANCING", "BUSINESS", "OTHER"
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

function AddIncome() {
  const [source, setSource] = useState("SALARY");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [incomes, setIncomes] = useState([]);
  const [loadingIncomes, setLoadingIncomes] = useState(true);

  // editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ source: "SALARY", amount: "", date: "" });
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // month filter: "all" or "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState("all");

  const fetchIncomes = async () => {
    try {
      setLoadingIncomes(true);
      const res = await api.get("/income/");
      setIncomes(res.data);
    } catch (err) {
      console.error("Failed to load income", err);
    } finally {
      setLoadingIncomes(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const validate = () => {
    const errs = {};
    if (!amount || Number(amount) <= 0) errs.amount = "Enter an amount greater than 0";
    if (!date) errs.date = "Date is required";
    else if (date > new Date().toISOString().split("T")[0]) errs.date = "Date can't be in the future";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await api.post("/income/", { source, amount, date });
      setSuccess(true);
      setSource("SALARY");
      setAmount("");
      setDate("");
      fetchIncomes();
      setTimeout(() => setSuccess(false), 1500);
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Failed to add income.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/income/${id}/`);
      setIncomes((prev) => prev.filter((inc) => inc.id !== id));
    } catch (err) {
      console.error("Failed to delete income", err);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (inc) => {
    setEditingId(inc.id);
    setEditError("");
    setEditForm({
      source: inc.source,
      amount: inc.amount,
      date: inc.date,
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
      const res = await api.put(`/income/${id}/`, editForm);
      setIncomes((prev) =>
        prev.map((inc) => (inc.id === id ? res.data : inc))
      );
      setEditingId(null);
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Failed to update income.";
      setEditError(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  // list of months that actually have income, newest first
  const availableMonths = useMemo(() => {
    const keys = new Set(incomes.map((i) => monthKey(i.date)));
    return Array.from(keys)
      .filter(Boolean)
      .sort((a, b) => (a < b ? 1 : -1));
  }, [incomes]);

  // incomes filtered by selected month (or all)
  const filteredIncomes = useMemo(() => {
    if (selectedMonth === "all") return incomes;
    return incomes.filter((i) => monthKey(i.date) === selectedMonth);
  }, [incomes, selectedMonth]);

  // group filtered incomes by month, newest month first, newest date first within month
  const groupedByMonth = useMemo(() => {
    const groups = {};
    filteredIncomes.forEach((i) => {
      const key = monthKey(i.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(i);
    });
    return Object.keys(groups)
      .sort((a, b) => (a < b ? 1 : -1))
      .map((key) => ({
        key,
        label: monthLabel(key),
        items: groups[key].sort((a, b) => (a.date < b.date ? 1 : -1)),
        total: groups[key].reduce((sum, i) => sum + Number(i.amount || 0), 0),
      }));
  }, [filteredIncomes]);

  const totalShown = filteredIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  return (
    <div className="ai-layout">
      <style>{`
        .ai-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .ai-form-panel {
          flex: 0 0 380px;
          background: #fff;
          border-radius: 14px;
          padding: 28px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .ai-form-panel h1 {
          margin-top: 0;
          margin-bottom: 20px;
        }
        .ai-field {
          margin-bottom: 16px;
        }
        .ai-field label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 0.9rem;
        }
        .ai-field input,
        .ai-field select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d8d8e0;
          border-radius: 8px;
          font-size: 0.95rem;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .ai-field input:focus,
        .ai-field select:focus {
          outline: none;
          border-color: #1e2a5e;
          box-shadow: 0 0 0 3px rgba(30,42,94,0.12);
        }
        .ai-field input.invalid {
          border-color: #b3261e;
        }
        .ai-submit-btn {
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
        .ai-submit-btn:hover:not(:disabled) {
          background: #1e2a5e;
          transform: translateY(-1px);
        }
        .ai-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .ai-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ai-error,
        .ai-field-error {
          color: #b3261e;
          font-size: 0.85rem;
          margin: 4px 0 12px;
        }
        .ai-success {
          color: #1a7f37;
          font-size: 0.85rem;
          margin: 4px 0 12px;
          animation: ai-fade-in 0.2s ease;
        }
        @keyframes ai-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ai-income-panel {
          flex: 1;
          min-width: 320px;
          background: #fff;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .ai-income-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .ai-income-header h2 {
          margin: 0;
        }
        .ai-header-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .ai-income-total {
          font-size: 0.9rem;
          color: #555;
          white-space: nowrap;
        }
        .ai-month-select {
          padding: 6px 10px;
          border: 1px solid #d8d8e0;
          border-radius: 8px;
          font-size: 0.85rem;
          background: #fff;
          cursor: pointer;
        }
        .ai-month-select:focus {
          outline: none;
          border-color: #1e2a5e;
          box-shadow: 0 0 0 3px rgba(30,42,94,0.12);
        }
        .ai-month-group {
          margin-bottom: 22px;
        }
        .ai-month-group:last-child {
          margin-bottom: 0;
        }
        .ai-month-group-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 8px 8px;
          background: #f3f4f8;
          border-radius: 8px;
          margin-bottom: 4px;
        }
        .ai-month-group-label {
          font-weight: 700;
          font-size: 0.88rem;
          color: #2b2f42;
        }
        .ai-month-group-total {
          font-weight: 700;
          font-size: 0.85rem;
          color: #1a7f37;
        }
        .ai-table {
          width: 100%;
          border-collapse: collapse;
        }
        .ai-table th {
          text-align: left;
          padding: 8px;
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          color: #777;
        }
        .ai-row {
          border-top: 1px solid #eceef2;
          transition: background 0.15s ease;
        }
        .ai-row:hover {
          background: #f7f8fb;
        }
        .ai-row td {
          padding: 10px 8px;
          vertical-align: middle;
        }
        .ai-amount {
          font-weight: 700;
          color: #1a7f37;
        }
        .ai-actions {
          display: flex;
          gap: 6px;
          white-space: nowrap;
        }
        .ai-btn {
          border: none;
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease, opacity 0.15s ease;
        }
        .ai-btn:active {
          transform: scale(0.96);
        }
        .ai-btn-edit {
          background: #e5ecff;
          color: #2447d6;
        }
        .ai-btn-edit:hover {
          background: #d3ddff;
        }
        .ai-btn-delete {
          background: #fbe3e0;
          color: #b3261e;
        }
        .ai-btn-delete:hover {
          background: #f6cfca;
        }
        .ai-btn-save {
          background: #d8f3dc;
          color: #1a7f37;
        }
        .ai-btn-save:hover {
          background: #c4ecc9;
        }
        .ai-btn-cancel {
          background: #eee;
          color: #444;
        }
        .ai-btn-cancel:hover {
          background: #e0e0e0;
        }
        .ai-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ai-edit-input,
        .ai-edit-select {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #c9cfe0;
          border-radius: 6px;
          font-size: 0.85rem;
          box-sizing: border-box;
        }
        .ai-empty {
          color: #888;
          font-style: italic;
          padding: 16px 0;
        }
        .ai-skeleton-row {
          height: 18px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f0f1f5 25%, #e6e8ee 37%, #f0f1f5 63%);
          background-size: 400% 100%;
          animation: ai-shimmer 1.4s ease infinite;
          margin: 10px 0;
        }
        @keyframes ai-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>

      <div className="ai-form-panel">
        <h1>Add Income</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="ai-field">
            <label htmlFor="source">Source</label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="ai-field">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={fieldErrors.amount ? "invalid" : ""}
            />
            {fieldErrors.amount && <p className="ai-field-error">{fieldErrors.amount}</p>}
          </div>

          <div className="ai-field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fieldErrors.date ? "invalid" : ""}
            />
            {fieldErrors.date && <p className="ai-field-error">{fieldErrors.date}</p>}
          </div>

          {error && <p className="ai-error">{error}</p>}
          {success && <p className="ai-success">✓ Income added!</p>}

          <button type="submit" className="ai-submit-btn" disabled={submitting}>
            {submitting ? "Adding..." : "Add Income"}
          </button>
        </form>
      </div>

      <div className="ai-income-panel">
        <div className="ai-income-header">
          <h2>Income</h2>
          <div className="ai-header-right">
            {availableMonths.length > 0 && (
              <select
                className="ai-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="all">All months</option>
                {availableMonths.map((key) => (
                  <option key={key} value={key}>{monthLabel(key)}</option>
                ))}
              </select>
            )}
            {!loadingIncomes && filteredIncomes.length > 0 && (
              <span className="ai-income-total">
                Total: ₹{totalShown.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {loadingIncomes ? (
          <>
            <div className="ai-skeleton-row" />
            <div className="ai-skeleton-row" />
            <div className="ai-skeleton-row" />
          </>
        ) : filteredIncomes.length === 0 ? (
          <p className="ai-empty">
            {incomes.length === 0
              ? "No income yet. Add your first one on the left."
              : "No income for this month."}
          </p>
        ) : (
          groupedByMonth.map((group) => (
            <div key={group.key} className="ai-month-group">
              <div className="ai-month-group-header">
                <span className="ai-month-group-label">{group.label}</span>
                <span className="ai-month-group-total">₹{group.total.toFixed(2)}</span>
              </div>
              <table className="ai-table">
                <thead>
                  <tr>
                    <th>SOURCE</th>
                    <th>DATE</th>
                    <th>AMOUNT</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((inc) => {
                    const isEditing = editingId === inc.id;
                    return (
                      <tr className="ai-row" key={inc.id}>
                        {isEditing ? (
                          <>
                            <td>
                              <select
                                className="ai-edit-select"
                                value={editForm.source}
                                onChange={(e) => handleEditChange("source", e.target.value)}
                              >
                                {SOURCES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                className="ai-edit-input"
                                type="date"
                                value={editForm.date}
                                onChange={(e) => handleEditChange("date", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                className="ai-edit-input"
                                type="number"
                                step="0.01"
                                value={editForm.amount}
                                onChange={(e) => handleEditChange("amount", e.target.value)}
                              />
                            </td>
                            <td>
                              <div className="ai-actions">
                                <button
                                  className="ai-btn ai-btn-save"
                                  onClick={() => saveEdit(inc.id)}
                                  disabled={savingEdit}
                                  type="button"
                                >
                                  {savingEdit ? "Saving..." : "Save"}
                                </button>
                                <button
                                  className="ai-btn ai-btn-cancel"
                                  onClick={cancelEdit}
                                  disabled={savingEdit}
                                  type="button"
                                >
                                  Cancel
                                </button>
                              </div>
                              {editError && <p className="ai-error">{editError}</p>}
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{inc.source}</td>
                            <td>{inc.date}</td>
                            <td className="ai-amount">₹{Number(inc.amount).toFixed(2)}</td>
                            <td>
                              <div className="ai-actions">
                                <button
                                  className="ai-btn ai-btn-edit"
                                  onClick={() => startEdit(inc)}
                                  type="button"
                                >
                                  Edit
                                </button>
                                <button
                                  className="ai-btn ai-btn-delete"
                                  onClick={() => handleDelete(inc.id)}
                                  disabled={deletingId === inc.id}
                                  type="button"
                                >
                                  {deletingId === inc.id ? "..." : "Delete"}
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

export default AddIncome;