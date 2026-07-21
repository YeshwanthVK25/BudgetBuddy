import { useEffect, useState } from "react";
import api from "../api/axios";

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [formError, setFormError] = useState("");

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
      await api.post("/budgets/", { title, amount, category, date });
      setTitle("");
      setAmount("");
      setCategory("");
      setDate("");
      fetchBudgets();
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Failed to add budget.";
      setFormError(msg);
    }
  };

  const total = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      <h1>Budgets</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "12px" }}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", width: "100%", padding: "8px" }}
            required
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ display: "block", width: "100%", padding: "8px" }}
            required
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label>Category</label>
          <input
            type="text"
            placeholder="e.g. Food, Travel"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ display: "block", width: "100%", padding: "8px" }}
            required
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ display: "block", width: "100%", padding: "8px" }}
            required
          />
        </div>
        {formError && <p style={{ color: "red" }}>{formError}</p>}
        <button type="submit" style={{ padding: "8px 16px" }}>
          Add Budget
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <h2>Total Budgeted: ₹{total.toFixed(2)}</h2>
          {budgets.length === 0 ? (
            <p>No budgets set yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ccc" }}>
                  <th style={{ textAlign: "left", padding: "8px" }}>Title</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Category</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Date</th>
                  <th style={{ textAlign: "right", padding: "8px" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px" }}>{b.title}</td>
                    <td style={{ padding: "8px" }}>{b.category}</td>
                    <td style={{ padding: "8px" }}>{b.date}</td>
                    <td style={{ padding: "8px", textAlign: "right" }}>₹{b.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <p style={{ marginTop: "20px" }}>
        <a href="/dashboard">Back to Dashboard</a>
      </p>
    </div>
  );
}

export default Budgets;