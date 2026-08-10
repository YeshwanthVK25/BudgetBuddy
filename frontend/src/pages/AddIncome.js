import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";

const SOURCES = [
  "SALARY", "POCKET_MONEY", "SCHOLARSHIP", "FREELANCING", "BUSINESS", "OTHER"
];

function AddIncome() {
  const [source, setSource] = useState("SALARY");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

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
    try {
      await api.post("/income/", { source, amount, date });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Failed to add income.";
      setError(msg);
    }
  };

  return (
    <div className="form-panel">
      <h1>Add Income</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
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

        <div className="field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={fieldErrors.amount ? "invalid" : ""}
          />
          {fieldErrors.amount && <p className="field-error">{fieldErrors.amount}</p>}
        </div>

        <div className="field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={fieldErrors.date ? "invalid" : ""}
          />
          {fieldErrors.date && <p className="field-error">{fieldErrors.date}</p>}
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary">
          Add Income
        </button>
      </form>

      {success && <div className="toast">✅ Income added! Redirecting...</div>}
    </div>
  );
}

export default AddIncome;