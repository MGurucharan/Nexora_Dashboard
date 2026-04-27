function TableView({ data, verifiedByRow, onToggleVerified }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const statusColumn = columns.find(
    (col) => col.toLowerCase() === "paymentstatus"
  );

  const getStatusClassName = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "paid") return "is-paid";
    if (normalized === "not paid") return "is-unpaid";
    return "";
  };

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
              <th>Verified</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => {
                  const value = row[col];
                  const isStatus = statusColumn && col === statusColumn;
                  const className = isStatus ? getStatusClassName(value) : "";

                  return (
                    <td key={col}>
                      {isStatus ? (
                        <span className={`status-badge ${className}`}>{value}</span>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
                <td>
                  <button
                    type="button"
                    className={`verify-toggle ${verifiedByRow[i] ? "is-yes" : "is-no"}`}
                    onClick={() => onToggleVerified(i)}
                  >
                    {verifiedByRow[i] ? "Yes" : "No"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableView;