import { useState, useMemo } from "react";
import api from "../api/axios";
import "../styles/theme.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatDate(d) {
  // returns YYYY-MM-DD in local time
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const PRESETS = [
  {
    label: "This Month",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [formatDate(start), formatDate(end)];
    },
  },
  {
    label: "Last Month",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return [formatDate(start), formatDate(end)];
    },
  },
  {
    label: "Last 30 Days",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return [formatDate(start), formatDate(end)];
    },
  },
  {
    label: "This Year",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return [formatDate(start), formatDate(end)];
    },
  },
];

function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activePreset, setActivePreset] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const applyPreset = (preset) => {
    const [start, end] = preset.getRange();
    setStartDate(start);
    setEndDate(end);
    setActivePreset(preset.label);
  };

  const handleManualDateChange = (setter) => (e) => {
    setter(e.target.value);
    setActivePreset(null);
  };

  const fetchReport = async () => {
    setError("");
    setLoading(true);
    setHasGenerated(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await api.get("/analytics/report/", { params });
      setReport(res.data);
    } catch (err) {
      setError("Failed to load report. Please try again.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!report) return;

    let csv = "Type,Title/Source,Category,Amount,Date\n";

    report.income.forEach((i) => {
      csv += `Income,${i.source},,${i.amount},${i.date}\n`;
    });

    report.expenses.forEach((e) => {
      csv += `Expense,${e.title},${e.category},${e.amount},${e.date}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${startDate || "all"}_to_${endDate || "all"}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("BudgetBuddy Report", 14, 20);

    doc.setFontSize(11);
    doc.text(`Period: ${startDate || "All time"} to ${endDate || "All time"}`, 14, 28);

    doc.setFontSize(12);
    doc.text(`Total Income: Rs. ${report.total_income}`, 14, 40);
    doc.text(`Total Expense: Rs. ${report.total_expense}`, 14, 48);
    doc.text(`Balance: Rs. ${report.balance}`, 14, 56);

    const rows = [
      ...report.income.map((i) => ["Income", i.source, "-", i.date, `Rs. ${i.amount}`]),
      ...report.expenses.map((e) => ["Expense", e.title, e.category, e.date, `Rs. ${e.amount}`]),
    ];

    autoTable(doc, {
      startY: 65,
      head: [["Type", "Title/Source", "Category", "Date", "Amount"]],
      body: rows,
    });

    doc.save(`report_${startDate || "all"}_to_${endDate || "all"}.pdf`);
  };

  // merge income + expenses into one sorted, typed list for a cleaner table
  const combinedRows = useMemo(() => {
    if (!report) return [];
    const rows = [
      ...report.income.map((i) => ({
        key: `i-${i.id}`,
        type: "Income",
        title: i.source,
        category: "—",
        date: i.date,
        amount: i.amount,
      })),
      ...report.expenses.map((e) => ({
        key: `e-${e.id}`,
        type: "Expense",
        title: e.title,
        category: e.category,
        date: e.date,
        amount: e.amount,
      })),
    ];
    return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [report]);

  const balancePositive = report && Number(report.balance) >= 0;

  return (
    <div className="rp-page">
      <style>{`
        .rp-page {
          max-width: 1100px;
        }
        .rp-header {
          margin-bottom: 24px;
        }
        .rp-header h1 {
          margin: 0 0 4px 0;
        }
        .rp-header p {
          margin: 0;
          color: #6b7280;
          font-size: 0.92rem;
        }

        .rp-filter-card {
          background: #fff;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          margin-bottom: 24px;
        }
        .rp-presets {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .rp-preset-btn {
          border: 1px solid #d8d8e0;
          background: #fafafe;
          color: #333;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .rp-preset-btn:hover {
          background: #eef0fa;
          border-color: #b9c0e0;
        }
        .rp-preset-btn.active {
          background: #12193f;
          border-color: #12193f;
          color: #fff;
        }
        .rp-filter-row {
          display: flex;
          gap: 16px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .rp-field label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 0.85rem;
          color: #333;
        }
        .rp-field input {
          padding: 10px 12px;
          border: 1px solid #d8d8e0;
          border-radius: 8px;
          font-size: 0.92rem;
        }
        .rp-field input:focus {
          outline: none;
          border-color: #1e2a5e;
          box-shadow: 0 0 0 3px rgba(30,42,94,0.12);
        }
        .rp-generate-btn {
          border: none;
          border-radius: 8px;
          background: #12193f;
          color: #fff;
          font-weight: 600;
          font-size: 0.92rem;
          padding: 11px 26px;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease, opacity 0.15s ease;
        }
        .rp-generate-btn:hover:not(:disabled) {
          background: #1e2a5e;
          transform: translateY(-1px);
        }
        .rp-generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .rp-error {
          color: #b3261e;
          background: #fdecea;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.88rem;
          margin-bottom: 20px;
        }

        .rp-skeleton {
          background: #fff;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .rp-skeleton-bar {
          height: 60px;
          border-radius: 8px;
          margin-bottom: 12px;
          background: linear-gradient(90deg, #f0f1f5 25%, #e6e8ee 37%, #f0f1f5 63%);
          background-size: 400% 100%;
          animation: rp-shimmer 1.4s ease infinite;
        }
        @keyframes rp-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }

        .rp-empty-state {
          background: #fff;
          border-radius: 14px;
          padding: 48px 24px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          color: #888;
        }
        .rp-empty-state .rp-empty-icon {
          font-size: 2.2rem;
          margin-bottom: 10px;
        }

        .rp-stats-row {
          display: flex;
          gap: 16px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .rp-stat-card {
          flex: 1;
          min-width: 180px;
          background: #fff;
          border-radius: 14px;
          padding: 20px 22px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          position: relative;
          overflow: hidden;
        }
        .rp-stat-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
        }
        .rp-stat-income::before { background: #1a7f37; }
        .rp-stat-expense::before { background: #b3261e; }
        .rp-stat-balance::before { background: #2447d6; }
        .rp-stat-label {
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #888;
          margin-bottom: 8px;
        }
        .rp-stat-value {
          font-size: 1.6rem;
          font-weight: 800;
        }
        .rp-stat-income .rp-stat-value { color: #1a7f37; }
        .rp-stat-expense .rp-stat-value { color: #b3261e; }
        .rp-stat-balance .rp-stat-value.positive { color: #2447d6; }
        .rp-stat-balance .rp-stat-value.negative { color: #b3261e; }

        .rp-actions-row {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
        }
        .rp-export-btn {
          border: 1px solid #d8d8e0;
          background: #fff;
          color: #12193f;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 9px 18px;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }
        .rp-export-btn:hover {
          background: #f3f4f8;
          border-color: #b9c0e0;
        }

        .rp-table-card {
          background: #fff;
          border-radius: 14px;
          padding: 8px 22px 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .rp-table-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 16px 0 10px;
        }
        .rp-table-header h2 {
          margin: 0;
          font-size: 1.05rem;
        }
        .rp-table-count {
          font-size: 0.8rem;
          color: #888;
        }
        .rp-table {
          width: 100%;
          border-collapse: collapse;
        }
        .rp-table th {
          text-align: left;
          padding: 8px;
          font-size: 0.76rem;
          letter-spacing: 0.05em;
          color: #888;
          border-bottom: 1px solid #eceef2;
        }
        .rp-row td {
          padding: 10px 8px;
          border-top: 1px solid #f0f1f5;
          font-size: 0.9rem;
        }
        .rp-row:hover {
          background: #fafbfd;
        }
        .rp-type-pill {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
        }
        .rp-type-pill.income {
          background: #d8f3dc;
          color: #1a7f37;
        }
        .rp-type-pill.expense {
          background: #fbe3e0;
          color: #b3261e;
        }
        .rp-amount {
          text-align: right;
          font-weight: 700;
        }
        .rp-amount.income { color: #1a7f37; }
        .rp-amount.expense { color: #b3261e; }
      `}</style>

      <div className="rp-header">
        <h1>Reports</h1>
        <p>Generate a summary of your income and expenses for any date range.</p>
      </div>

      <div className="rp-filter-card">
        <div className="rp-presets">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`rp-preset-btn ${activePreset === preset.label ? "active" : ""}`}
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="rp-filter-row">
          <div className="rp-field">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={handleManualDateChange(setStartDate)}
            />
          </div>
          <div className="rp-field">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={handleManualDateChange(setEndDate)}
            />
          </div>
          <button
            onClick={fetchReport}
            className="rp-generate-btn"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {error && <div className="rp-error">{error}</div>}

      {loading && (
        <div className="rp-skeleton">
          <div className="rp-skeleton-bar" />
          <div className="rp-skeleton-bar" />
          <div className="rp-skeleton-bar" style={{ marginBottom: 0 }} />
        </div>
      )}

      {!loading && !report && hasGenerated && !error && (
        <div className="rp-empty-state">
          <div className="rp-empty-icon">📭</div>
          <p>No data found for this date range.</p>
        </div>
      )}

      {!loading && !hasGenerated && (
        <div className="rp-empty-state">
          <div className="rp-empty-icon">📊</div>
          <p>Pick a date range or preset above, then click "Generate Report" to see your summary.</p>
        </div>
      )}

      {!loading && report && (
        <>
          <div className="rp-stats-row">
            <div className="rp-stat-card rp-stat-income">
              <div className="rp-stat-label">TOTAL INCOME</div>
              <div className="rp-stat-value">₹{report.total_income}</div>
            </div>
            <div className="rp-stat-card rp-stat-expense">
              <div className="rp-stat-label">TOTAL EXPENSE</div>
              <div className="rp-stat-value">₹{report.total_expense}</div>
            </div>
            <div className="rp-stat-card rp-stat-balance">
              <div className="rp-stat-label">BALANCE</div>
              <div className={`rp-stat-value ${balancePositive ? "positive" : "negative"}`}>
                ₹{report.balance}
              </div>
            </div>
          </div>

          <div className="rp-actions-row">
            <button onClick={downloadCSV} className="rp-export-btn">
              ⬇ Download CSV
            </button>
            <button onClick={downloadPDF} className="rp-export-btn">
              ⬇ Download PDF
            </button>
          </div>

          <div className="rp-table-card">
            <div className="rp-table-header">
              <h2>Transactions</h2>
              <span className="rp-table-count">{combinedRows.length} entries</span>
            </div>

            {combinedRows.length === 0 ? (
              <p style={{ color: "#888", padding: "16px 0" }}>No transactions in this range.</p>
            ) : (
              <table className="rp-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title/Source</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedRows.map((row) => (
                    <tr className="rp-row" key={row.key}>
                      <td>
                        <span className={`rp-type-pill ${row.type === "Income" ? "income" : "expense"}`}>
                          {row.type}
                        </span>
                      </td>
                      <td>{row.title}</td>
                      <td>{row.category}</td>
                      <td>{row.date}</td>
                      <td className={`rp-amount ${row.type === "Income" ? "income" : "expense"}`}>
                        ₹{row.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;