import { useState } from "react";
import api from "../api/axios";
import "../styles/theme.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setError("");
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await api.get("/analytics/report/", { params });
      setReport(res.data);
    } catch (err) {
      setError("Failed to load report.");
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

  return (
    <div className="page-md">
      <h1>Reports</h1>

      <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", marginBottom: "24px" }}>
        <div className="field">
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button onClick={fetchReport} className="btn-primary" style={{ width: "auto", padding: "10px 22px" }}>
          Generate Report
        </button>
      </div>

      {loading && <p style={{ color: "var(--slate)" }}>Loading...</p>}
      {error && <p className="form-error">{error}</p>}

      {report && (
        <>
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
            <div className="stat-card">
              <div className="lab">TOTAL INCOME</div>
              <div className="val" style={{ color: "var(--accent-deep)" }}>₹{report.total_income}</div>
            </div>
            <div className="stat-card">
              <div className="lab">TOTAL EXPENSE</div>
              <div className="val" style={{ color: "var(--coral)" }}>₹{report.total_expense}</div>
            </div>
            <div className="stat-card">
              <div className="lab">BALANCE</div>
              <div className="val">₹{report.balance}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <button onClick={downloadCSV} className="btn-primary" style={{ width: "auto", padding: "10px 22px" }}>
              ⬇️ Download CSV
            </button>
            <button onClick={downloadPDF} className="btn-primary" style={{ width: "auto", padding: "10px 22px" }}>
              ⬇️ Download PDF
            </button>
          </div>

          <h2 className="section-title">Transactions in range</h2>
          <div className="panel" style={{ padding: "18px 22px" }}>
            <table>
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
                {report.income.map((i) => (
                  <tr key={`i-${i.id}`}>
                    <td>Income</td>
                    <td>{i.source}</td>
                    <td>—</td>
                    <td className="date">{i.date}</td>
                    <td className="amt" style={{ textAlign: "right" }}>₹{i.amount}</td>
                  </tr>
                ))}
                {report.expenses.map((e) => (
                  <tr key={`e-${e.id}`}>
                    <td>Expense</td>
                    <td>{e.title}</td>
                    <td>{e.category}</td>
                    <td className="date">{e.date}</td>
                    <td className="amt" style={{ textAlign: "right" }}>₹{e.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;