import { useEffect, useState } from "react";
import api from "../api/axios";

function StatCard({ icon, label, value, color }) {
  return (
    <div
      style={{
        background: "#1a2b21",
        borderRadius: "12px",
        padding: "20px",
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div style={{ fontSize: "28px" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "13px", color: "#8fae9c" }}>{label}</div>
        <div style={{ fontSize: "22px", fontWeight: "700", color }}>{value}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, incomeRes] = await Promise.all([
          api.get("/expenses/"),
          api.get("/income/"),
        ]);
        setExpenses(expensesRes.data);
        setIncome(incomeRes.data);
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalIncome = income.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const balance = totalIncome - totalExpenses;

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "#ff6b6b" }}>{error}</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "4px" }}>Dashboard</h1>
      <p style={{ color: "#8fae9c", marginBottom: "24px" }}>Welcome back! 👋</p>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard icon="💰" label="TOTAL INCOME" value={`₹${totalIncome.toFixed(2)}`} color="#10b981" />
        <StatCard icon="💸" label="TOTAL EXPENSES" value={`₹${totalExpenses.toFixed(2)}`} color="#ff6b6b" />
        <StatCard
          icon="⚖️"
          label="BALANCE"
          value={`₹${balance.toFixed(2)}`}
          color={balance >= 0 ? "#10b981" : "#ff6b6b"}
        />
      </div>

      <h2 style={{ color: "#fff" }}>Income</h2>
      {income.length === 0 ? (
        <p style={{ color: "#8fae9c" }}>No income recorded yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", color: "#fff" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #2a3f32" }}>
              <th style={{ textAlign: "left", padding: "8px" }}>Source</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Date</th>
              <th style={{ textAlign: "right", padding: "8px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {income.map((i) => (
              <tr key={i.id} style={{ borderBottom: "1px solid #1f2e25" }}>
                <td style={{ padding: "8px" }}>{i.source}</td>
                <td style={{ padding: "8px" }}>{i.date}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>₹{i.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ color: "#fff" }}>Expenses</h2>
      {expenses.length === 0 ? (
        <p style={{ color: "#8fae9c" }}>No expenses yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #2a3f32" }}>
              <th style={{ textAlign: "left", padding: "8px" }}>Title</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Category</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Date</th>
              <th style={{ textAlign: "right", padding: "8px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #1f2e25" }}>
                <td style={{ padding: "8px" }}>{e.title}</td>
                <td style={{ padding: "8px" }}>{e.category}</td>
                <td style={{ padding: "8px" }}>{e.date}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>₹{e.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;