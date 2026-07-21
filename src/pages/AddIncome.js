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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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

  return (
    <div style={{ maxWidth: "400px" }}>
      <h1>Add Income</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "14px" }}>
          <label>Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={inputStyle}
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
            style={inputStyle}
            required
          />
        </div>
        <div style={{ marginBottom: "14px" }}>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
            required
          />
        </div>
        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
        {success && <p style={{ color: "#10b981" }}>Income added! Redirecting...</p>}
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
    </div>
  );
}

export default AddIncome;