import { useEffect, useState } from "react";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../styles/theme.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const COLORS = [
  "#2E8BFF",
  "#E8604C",
  "#F0A93B",
  "#6C7BD4",
  "#B968C7",
  "#3FB0A3",
  "#8C97AE",
  "#1D6FDB",
];

function StatCard({ icon, label, value, tone }) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ fontSize: "26px" }}>{icon}</div>
        <div>
          <div className="lab">{label}</div>
          <div
            className="val"
            style={tone ? { color: tone } : undefined}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  );

  const totalIncome = income.reduce(
    (sum, i) => sum + parseFloat(i.amount),
    0
  );

  const balance = totalIncome - totalExpenses;

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
      await api.patch(`/expenses/${id}/`, {
        amount: editExpenseAmount,
      });

      setEditingExpenseId(null);
      fetchData();
    } catch {
      alert("Failed to update expense.");
    }
  };

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
      await api.patch(`/income/${id}/`, {
        amount: editIncomeAmount,
      });

      setEditingIncomeId(null);
      fetchData();
    } catch {
      alert("Failed to update income.");
    }
  };

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] =
      (acc[e.category] || 0) + parseFloat(e.amount);
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(
    ([category, value]) => ({
      name: category,
      value,
    })
  );

  const barData = [
    {
      name: "Income",
      value: totalIncome,
    },
    {
      name: "Expenses",
      value: totalExpenses,
    },
  ];

  if (loading) return <Spinner />;

  if (error)
    return (
      <p style={{ color: "var(--coral)" }}>
        {error}
      </p>
    );

  const username =
    localStorage.getItem("username") || "User";

  return (
    <div
      className="main"
      style={{ padding: "26px 34px 60px" }}
    >
      <div className="topbar">
        <div className="greeting">
          <span className="kicker">
            {username.toUpperCase()}
          </span>

          <h1>
            Welcome back, 👋
          </h1>
        </div>

        <div className="topbar-right">
          <div className="user-profile">
            <div className="user-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <span>{username}</span>
              <span>BudgetBuddy User</span>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("username");
              logout();
              navigate("/login");
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div
        className="cards-row"
        style={{
          gridTemplateColumns:
            "repeat(3, 1fr)",
        }}
      >
        <StatCard
          icon="💰"
          label="TOTAL INCOME"
          value={`₹${totalIncome.toFixed(2)}`}
          tone="var(--accent-deep)"
        />

        <StatCard
          icon="💸"
          label="TOTAL EXPENSES"
          value={`₹${totalExpenses.toFixed(2)}`}
          tone="var(--coral)"
        />

        <StatCard
          icon="⚖️"
          label="BALANCE"
          value={`₹${balance.toFixed(2)}`}
          tone={
            balance >= 0
              ? "var(--accent-deep)"
              : "var(--coral)"
          }
        />
      </div>
      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
  <div className="panel chart-panel">
    <h3>Expenses by category</h3>
    {pieData.length === 0 ? (
      <p style={{ color: "var(--slate)" }}>No expense data yet.</p>
    ) : (
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
          <Legend
  verticalAlign="bottom"
  wrapperStyle={{
    paddingTop: "15px",
  }}
/>
        </PieChart>
      </ResponsiveContainer>
    )}
  </div>

  <div className="panel chart-panel">
    <h3>Income vs expenses</h3>
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={barData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
        <XAxis dataKey="name" stroke="var(--slate)" />
        <YAxis stroke="var(--slate)" />
        <Tooltip
          formatter={(value) => `₹${value.toFixed(2)}`}
          contentStyle={{
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: "8px",
          }}
        />
        <Bar
          dataKey="value"
          fill="var(--accent)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginTop: "4px",
    alignItems: "start",
  }}
>
  {/* Income Section */}
  <div>
    <h2 className="section-title">Income</h2>

    {income.length === 0 ? (
      <p style={{ color: "var(--slate)" }}>
        No income recorded yet.
      </p>
    ) : (
      <div
  className="panel"
  style={{
    padding: "18px 22px",
  }}
>
  <div
  className="table-scroll"
  style={{
    height: "170px",
    overflowY: "auto",
  }}
>
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>
                Amount
              </th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {income.map((i) => (
              <tr key={i.id}>
                <td>{i.source}</td>

                <td className="date">
                  {i.date}
                </td>

                <td
                  className="amt"
                  style={{
                    textAlign: "right",
                  }}
                >
                  {editingIncomeId === i.id ? (
                    <input
                      type="number"
                      value={editIncomeAmount}
                      onChange={(e) =>
                        setEditIncomeAmount(
                          e.target.value
                        )
                      }
                      className="input-inline"
                    />
                  ) : (
                    `₹${i.amount}`
                  )}
                </td>

                <td
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {editingIncomeId === i.id ? (
                    <>
                      <button
                        onClick={() =>
                          saveEditIncome(i.id)
                        }
                        className="btn-pill save"
                      >
                        Save
                      </button>

                      <button
                        onClick={() =>
                          setEditingIncomeId(null)
                        }
                        className="btn-pill cancel"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          startEditIncome(i)
                        }
                        className="btn-pill edit"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteIncome(i.id)
                        }
                        className="btn-pill delete"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    )}
  </div>
  {/* Expenses Section */}
  <div>
    <h2 className="section-title">Expenses</h2>

    {expenses.length === 0 ? (
      <p style={{ color: "var(--slate)" }}>
        No expenses yet.
      </p>
    ) : (
      <div
  className="panel"
  style={{
    padding: "18px 22px",
  }}
>
  <div
  className="table-scroll"
  style={{
    height: "170px",
    overflowY: "auto",
  }}
>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>
                Amount
              </th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>

                <td>{e.category}</td>

                <td className="date">
                  {e.date}
                </td>

                <td
                  className="amt"
                  style={{
                    textAlign: "right",
                  }}
                >
                  {editingExpenseId === e.id ? (
                    <input
                      type="number"
                      value={editExpenseAmount}
                      onChange={(ev) =>
                        setEditExpenseAmount(
                          ev.target.value
                        )
                      }
                      className="input-inline"
                    />
                  ) : (
                    `₹${e.amount}`
                  )}
                </td>

                <td
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {editingExpenseId === e.id ? (
                    <>
                      <button
                        onClick={() =>
                          saveEditExpense(e.id)
                        }
                        className="btn-pill save"
                      >
                        Save
                      </button>

                      <button
                        onClick={() =>
                          setEditingExpenseId(null)
                        }
                        className="btn-pill cancel"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          startEditExpense(e)
                        }
                        className="btn-pill edit"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteExpense(e.id)
                        }
                        className="btn-pill delete"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    )}
  </div>
</div>
</div>
  );
}

export default Dashboard;