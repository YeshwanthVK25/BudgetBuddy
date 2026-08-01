import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

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

  const errorTextStyle = {
    color: "#ff6b6b",
    fontSize: "0.85rem",
    marginTop: "4px",
  };

  return (
    <div style={{ maxWidth: "400px" }}>
      <h1>Add Income</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: "14px" }}>
          <label>Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={inputStyle(false)}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle(!!fieldErrors.amount)}
          />
          {fieldErrors.amount && <p style={errorTextStyle}>{fieldErrors.amount}</p>}
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle(!!fieldErrors.date)}
          />
          {fieldErrors.date && <p style={errorTextStyle}>{fieldErrors.date}</p>}
        </div>

        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

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
          Add Income
        </button>
      </form>

      {success && (
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
          ✅ Income added! Redirecting...
        </div>
      )}
    </div>
  );
}

export default AddIncome;