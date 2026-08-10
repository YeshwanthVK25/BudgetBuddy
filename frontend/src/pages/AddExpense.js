import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";

const CATEGORIES = [
  "FOOD", "TRAVEL", "SHOPPING", "EDUCATION",
  "ENTERTAINMENT", "HEALTHCARE", "BILLS", "MISCELLANEOUS"
];

function AddExpense() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/expenses/", { title, amount, category, date });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Failed to add expense.";
      setError(msg);
    }
  };

  return (
    <div className="form-panel">
      <h1>Add Expense</h1>
      <form onSubmit={handleSubmit}>
        <div className="field">
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

        <div className="field">
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

        <div className="field">
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

        <div className="field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">Expense added! Redirecting...</p>}

        <button type="submit" className="btn-primary">
          Add Expense
        </button>
      </form>
    </div>
  );
}

export default AddExpense;