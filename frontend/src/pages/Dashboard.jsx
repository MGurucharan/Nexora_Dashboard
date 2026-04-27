import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import FileUpload from "../components/FileUpload";
import TableView from "../components/TableView";
import { mergeData } from "../utils/mergeData";

function Dashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [verifiedByRow, setVerifiedByRow] = useState({});
  const mergedData = useMemo(() => {
    if (!Array.isArray(registrations) || registrations.length === 0) return [];
    if (!Array.isArray(payments) || payments.length === 0) {
      return mergeData(registrations, []);
    }
    return mergeData(registrations, payments);
  }, [registrations, payments]);

  const summary = useMemo(() => {
    const total = mergedData.length;
    const paid = mergedData.filter(
      (row) => String(row.paymentStatus || "").trim().toLowerCase() === "paid"
    ).length;
    const unpaid = Math.max(total - paid, 0);
    return { total, paid, unpaid };
  }, [mergedData]);

  useEffect(() => {
    const nextState = {};
    mergedData.forEach((_, index) => {
      nextState[index] = false;
    });
    setVerifiedByRow(nextState);
  }, [mergedData]);

  const handleToggleVerified = (rowIndex) => {
    setVerifiedByRow((prev) => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };

  const handleDownload = () => {
    if (mergedData.length === 0) return;

    const headerMap = {
      paymentStatus: "Payment Status",
      txnId: "Txn ID",
      Verified: "Verified",
    };

    const exportRows = mergedData.map((row, index) => {
      const withVerification = {
        ...row,
        Verified: verifiedByRow[index] ? "Yes" : "No",
      };

      return Object.fromEntries(
        Object.entries(withVerification).map(([key, value]) => [
          headerMap[key] || key,
          value,
        ])
      );
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Merged Data");
    XLSX.writeFile(workbook, "Final_Team_Data.xlsx");
  };

  const hasUploads = registrations.length > 0 || payments.length > 0;

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Nexora Analytics</p>
        <h1>Nexora Campus Dashboard</h1>
        <p className="subtitle">
          Upload registrations and payments to preview consolidated team data.
        </p>
      </header>

      <section className="card">
        <div className="section-header">
          <h2>Upload Section</h2>
          <p>Use two Excel files to prepare the merged report.</p>
        </div>
        <div className="upload-grid">
          <FileUpload
            label="Registration Excel"
            helperText="Upload the team registration sheet (xlsx/xls)."
            setData={setRegistrations}
          />
          <FileUpload
            label="Payment Excel"
            helperText="Upload the payment tracking sheet (xlsx/xls)."
            setData={setPayments}
          />
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Summary</h2>
          <p>Live snapshot based on the merged dataset.</p>
        </div>
        <div className="summary-grid">
          <div className="summary-tile">
            <p className="summary-label">Total Teams</p>
            <p className="summary-value">{summary.total}</p>
          </div>
          <div className="summary-tile">
            <p className="summary-label">Paid Teams</p>
            <p className="summary-value is-paid">{summary.paid}</p>
          </div>
          <div className="summary-tile">
            <p className="summary-label">Unpaid Teams</p>
            <p className="summary-value is-unpaid">{summary.unpaid}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Merged Data (Preview)</h2>
          <p>Scrollable table view for large datasets.</p>
        </div>
        {hasUploads ? (
          <div className="table-actions">
            <button
              type="button"
              className="download-button"
              onClick={handleDownload}
            >
              Download Excel
            </button>
            <TableView
              data={mergedData}
              verifiedByRow={verifiedByRow}
              onToggleVerified={handleToggleVerified}
            />
          </div>
        ) : (
          <p className="empty-state">
            Upload at least one Excel file to preview merged data.
          </p>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
