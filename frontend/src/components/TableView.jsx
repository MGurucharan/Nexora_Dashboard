import { useState, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";

function TableView({ data }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState("none");
  const [domainFilter, setDomainFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all"); // "all" | "paid" | "unpaid"

  const columns = [
    "Team Number",
    "Team Name",
    "Team Leader",
    "Members",       // ✅ NEW
    "Phone",
    "Email",
    "Project",
    "Domain",
    "Amount Paid",
    "Mode",
    "Transaction ID",
    "Date",
    "Screenshot",
  ];

  const mapping = {
    "Team Number": 0,
    "Team Name": 1,
    "Team Leader": 2,
    "Members": 3,        // ✅ NEW
    "Phone": 4,
    "Email": 5,
    "Project": 6,
    "Domain": 7,
    "Amount Paid": 8,
    "Mode": 9,
    "Transaction ID": 10,
    "Date": 11,
    "Screenshot": 12,
  };

  const getCellValue = (row, colKey) => {
    const dataIndex = typeof colKey === "string" ? (mapping[colKey] ?? colKey) : colKey;
    if (Array.isArray(row)) return row[dataIndex] ?? "";
    return row?.[dataIndex] ?? "";
  };

  // Determine payment status from "Amount Paid" column (index 9)
  const isPaid = (row) => {
    const val = String(getCellValue(row, "Amount Paid")).trim().toLowerCase();
    return val !== "" && val !== "-" && val !== "not paid" && val !== "0";
  };

  // Unique domains
  const domains = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const unique = new Set(data.map((r) => getCellValue(r, "Domain")).filter(Boolean));
    return ["all", ...Array.from(unique).sort()];
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    let processed = [...data];

    // Payment filter
    if (paymentFilter === "paid") {
      processed = processed.filter(isPaid);
    } else if (paymentFilter === "unpaid") {
      processed = processed.filter((r) => !isPaid(r));
    }

    // Domain filter
    if (domainFilter !== "all") {
      processed = processed.filter((r) => getCellValue(r, "Domain") === domainFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      processed = processed.filter((r) => {
        const num = String(getCellValue(r, "Team Number")).toLowerCase();
        const name = String(getCellValue(r, "Team Name")).toLowerCase();
        const leader = String(getCellValue(r, "Team Leader")).toLowerCase();
        const domain = String(getCellValue(r, "Domain")).toLowerCase();
        return num.includes(q) || name.includes(q) || leader.includes(q) || domain.includes(q);
      });
    }

    // Sort
    if (sortConfig !== "none") {
      processed.sort((a, b) => {
        let vA, vB;
        if (sortConfig.includes("Name")) {
          vA = String(getCellValue(a, "Team Name")).toLowerCase();
          vB = String(getCellValue(b, "Team Name")).toLowerCase();
          return sortConfig === "NameAZ" ? vA.localeCompare(vB) : vB.localeCompare(vA);
        }
        if (sortConfig.includes("Number")) {
          vA = parseFloat(getCellValue(a, "Team Number")) || 0;
          vB = parseFloat(getCellValue(b, "Team Number")) || 0;
          return sortConfig === "NumberAsc" ? vA - vB : vB - vA;
        }
        if (sortConfig.includes("Domain")) {
          vA = String(getCellValue(a, "Domain")).toLowerCase();
          vB = String(getCellValue(b, "Domain")).toLowerCase();
          return sortConfig === "DomainAZ" ? vA.localeCompare(vB) : vB.localeCompare(vA);
        }
        return 0;
      });
    }

    return processed;
  }, [data, searchQuery, sortConfig, domainFilter, paymentFilter]);

  // --- Export to Excel ---
  const exportToExcel = useCallback(() => {
    const exportColumns = columns.filter((c) => c !== "Screenshot");
    const headerRow = exportColumns;
    const rows = filteredAndSortedData.map((row) =>
      exportColumns.map((col) => getCellValue(row, col))
    );

    const wsData = [headerRow, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws["!cols"] = exportColumns.map((col) => {
      if (col === "Project") return { wch: 40 };
      if (col === "Team Name") return { wch: 24 };
      if (col === "Email") return { wch: 28 };
      return { wch: 18 };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nexora Teams");

    const label =
      paymentFilter === "paid"
        ? "Paid"
        : paymentFilter === "unpaid"
        ? "Unpaid"
        : "All";
    const filename = `Nexora_Teams_${label}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  }, [filteredAndSortedData, paymentFilter]);

  if (!Array.isArray(data) || data.length === 0)
    return <p className="empty-state">No Data</p>;

  const paidCount = data.filter(isPaid).length;
  const unpaidCount = data.length - paidCount;

  return (
    <div className="table-actions">
      {/* ── Payment filter pills ── */}
      <div className="payment-filter-row">
        <span className="payment-filter-label">Payment Status</span>
        <div className="payment-pills">
          <button
            id="pill-all"
            className={`payment-pill ${paymentFilter === "all" ? "active" : ""}`}
            onClick={() => setPaymentFilter("all")}
          >
            All
            <span className="pill-count">{data.length}</span>
          </button>
          <button
            id="pill-paid"
            className={`payment-pill paid ${paymentFilter === "paid" ? "active" : ""}`}
            onClick={() => setPaymentFilter("paid")}
          >
            ✅ Paid
            <span className="pill-count">{paidCount}</span>
          </button>
          <button
            id="pill-unpaid"
            className={`payment-pill unpaid ${paymentFilter === "unpaid" ? "active" : ""}`}
            onClick={() => setPaymentFilter("unpaid")}
          >
            ❌ Not Paid
            <span className="pill-count">{unpaidCount}</span>
          </button>
        </div>
      </div>

      {/* ── Toolbar: search + sort/filter + export ── */}
      <div className="table-toolbar">
        <div className="search-field">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            id="table-search"
            className="search-input"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            id="domain-filter"
            className="filter-select"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            <option value="all">All Domains</option>
            {domains
              .filter((d) => d !== "all")
              .map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
          </select>

          <select
            id="sort-select"
            className="sort-select"
            value={sortConfig}
            onChange={(e) => setSortConfig(e.target.value)}
          >
            <option value="none">Sort By</option>
            <option value="NameAZ">Name (A-Z)</option>
            <option value="NameZA">Name (Z-A)</option>
            <option value="NumberAsc">Number (↑)</option>
            <option value="NumberDesc">Number (↓)</option>
            <option value="DomainAZ">Domain (A-Z)</option>
            <option value="DomainZA">Domain (Z-A)</option>
          </select>
        </div>

        <div className="toolbar-right">
          <div className="results-badge">{filteredAndSortedData.length} Results</div>
          <button
            id="export-excel-btn"
            className="export-excel-btn"
            onClick={exportToExcel}
            title="Export current view to Excel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((row, idx) => {
                const paid = isPaid(row);
                return (
                  <tr key={idx} className={paid ? "row-paid" : "row-unpaid"}>
                    {columns.map((col) => {
                      const isProject = col === "Project";
                      const isDomain = col === "Domain";
                      const isAmountPaid = col === "Amount Paid";
                      const cellValue = getCellValue(row, col);

                      return (
                        <td
                          key={col}
                          className={`${isProject ? "project-cell" : ""} ${isDomain ? "domain-cell" : ""}`}
                        >
                          {col === "Screenshot" && cellValue !== "-" ? (
                            <a
                              href={cellValue}
                              target="_blank"
                              rel="noreferrer"
                              className="view-link"
                            >
                              👁️ View
                            </a>
                          ) : isDomain ? (
                            <span className="domain-badge">{cellValue}</span>
                          ) : isAmountPaid ? (
                            <span className={`status-badge ${paid ? "is-paid" : "is-unpaid"}`}>
                              {paid ? `✓ ${cellValue}` : "Not Paid"}
                            </span>
                          ) : (
                            cellValue
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAndSortedData.length === 0 && (
          <p className="empty-state">No matching teams found</p>
        )}
      </div>
    </div>
  );
}

export default TableView;
