import { useEffect, useState } from "react";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "#1a2b21", borderRadius: "12px", padding: "20px", flex: 1, display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ fontSize: "28px" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "13px", color: "#8fae9c" }}>{label}</div>
        <div style={{ fontSize: "22px", fontWeight: "700", color }}>{value}</div>
      </div>
    </div>
  );
}

const smallBtn = {
  padding: "5px 10px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  fontSize: "13px",
  marginLeft: "6px",
};

const inputStyle = {
  padding: "6px",
  borderRadius: "5px",
  border: "1px solid #333",
  background: "#16241c",
  color: "#fff",
  width: "90px",
};

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editExpenseAmount, setEditExpenseAmount] = useState("");
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [editIncomeAmount, setEditIncomeAmount] = useState("");

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

  useEffect(() => {
    fetchData();
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalIncome = income.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const balance = totalIncome - totalExpenses;

  // Expense handlers
  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}/`);
      fetchData();
    } catch {
      alert("Failed to delete expense.");
    }
  };
  const startEditExpense = (e) => {
    setEditingExpenseId(e.id);
    setEditExpenseAmount(e.amount);
  };
  const saveEditExpense = async (id) => {
    try {
      await api.patch(`/expenses/${id}/`, { amount: editExpenseAmount });
      setEditingExpenseId(null);
      fetchData();
    } catch {
      alert("Failed to update expense.");
    }
  };

  // Income handlers
  const deleteIncome = async (id) => {
    if (!window.confirm("Delete this income?")) return;
    try {
      await api.delete(`/income/${id}/`);
      fetchData();
    } catch {
      alert("Failed to delete income.");
    }
  };
  const startEditIncome = (i) => {
    setEditingIncomeId(i.id);
    setEditIncomeAmount(i.amount);
  };
  const saveEditIncome = async (id) => {
    try {
      await api.patch(`/income/${id}/`, { amount: editIncomeAmount });
      setEditingIncomeId(null);
      fetchData();
    } catch {
      alert("Failed to update income.");
    }
  };

  const categoryTotals = expenses.reduce((acc, e) => {
  acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
  return acc;
}, {});

const pieData = Object.entries(categoryTotals).map(([category, value]) => ({
  name: category,
  value,
}));

const COLORS = ["#10b981", "#4a90d9", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const barData = [
  { name: "Income", value: totalIncome },
  { name: "Expenses", value: totalExpenses },
];

  if (loading) return <Spinner />;
  if (error) return <p style={{ color: "#ff6b6b" }}>{error}</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "4px" }}>Dashboard</h1>
      <p style={{ color: "#8fae9c", marginBottom: "24px" }}>Welcome back! 👋</p>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard icon="💰" label="TOTAL INCOME" value={`₹${totalIncome.toFixed(2)}`} color="#10b981" />
        <StatCard icon="💸" label="TOTAL EXPENSES" value={`₹${totalExpenses.toFixed(2)}`} color="#ff6b6b" />
        <StatCard icon="⚖️" label="BALANCE" value={`₹${balance.toFixed(2)}`} color={balance >= 0 ? "#10b981" : "#ff6b6b"} />
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
  <div style={{ background: "#1a2b21", borderRadius: "12px", padding: "20px", flex: 1, minWidth: "300px" }}>
    <h3 style={{ color: "#fff", marginTop: 0 }}>Expenses by Category</h3>
    {pieData.length === 0 ? (
      <p style={{ color: "#8fae9c" }}>No expense data yet.</p>
    ) : (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )}
  </div>

  <div style={{ background: "#1a2b21", borderRadius: "12px", padding: "20px", flex: 1, minWidth: "300px" }}>
    <h3 style={{ color: "#fff", marginTop: 0 }}>Income vs Expenses</h3>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={barData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3f32" />
        <XAxis dataKey="name" stroke="#8fae9c" />
        <YAxis stroke="#8fae9c" />
        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} contentStyle={{ background: "#16241c", border: "1px solid #2a3f32" }} />
        <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
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
              <th style={{ padding: "8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {income.map((i) => (
              <tr key={i.id} style={{ borderBottom: "1px solid #1f2e25" }}>
                <td style={{ padding: "8px" }}>{i.source}</td>
                <td style={{ padding: "8px" }}>{i.date}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {editingIncomeId === i.id ? (
                    <input type="number" value={editIncomeAmount} onChange={(e) => setEditIncomeAmount(e.target.value)} style={inputStyle} />
                  ) : (
                    `₹${i.amount}`
                  )}
                </td>
                <td style={{ padding: "8px", whiteSpace: "nowrap" }}>
                  {editingIncomeId === i.id ? (
                    <>
                      <button onClick={() => saveEditIncome(i.id)} style={{ ...smallBtn, background: "#10b981", color: "#fff" }}>Save</button>
                      <button onClick={() => setEditingIncomeId(null)} style={{ ...smallBtn, background: "#333", color: "#fff" }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditIncome(i)} style={{ ...smallBtn, background: "#2a3f32", color: "#10b981" }}>Edit</button>
                      <button onClick={() => deleteIncome(i.id)} style={{ ...smallBtn, background: "rgba(255,90,90,0.15)", color: "#ff8080" }}>Delete</button>
                    </>
                  )}
                </td>
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
              <th style={{ padding: "8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #1f2e25" }}>
                <td style={{ padding: "8px" }}>{e.title}</td>
                <td style={{ padding: "8px" }}>{e.category}</td>
                <td style={{ padding: "8px" }}>{e.date}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {editingExpenseId === e.id ? (
                    <input type="number" value={editExpenseAmount} onChange={(ev) => setEditExpenseAmount(ev.target.value)} style={inputStyle} />
                  ) : (
                    `₹${e.amount}`
                  )}
                </td>
                <td style={{ padding: "8px", whiteSpace: "nowrap" }}>
                  {editingExpenseId === e.id ? (
                    <>
                      <button onClick={() => saveEditExpense(e.id)} style={{ ...smallBtn, background: "#10b981", color: "#fff" }}>Save</button>
                      <button onClick={() => setEditingExpenseId(null)} style={{ ...smallBtn, background: "#333", color: "#fff" }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditExpense(e)} style={{ ...smallBtn, background: "#2a3f32", color: "#10b981" }}>Edit</button>
                      <button onClick={() => deleteExpense(e.id)} style={{ ...smallBtn, background: "rgba(255,90,90,0.15)", color: "#ff8080" }}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;