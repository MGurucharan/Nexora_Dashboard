function TableView({ data }) {
  if (!Array.isArray(data) || data.length === 0) return <p>No Data</p>;

  const columnConfig = [
    {
      header: "Team Number",
      keys: ["team number", "Team No.","team no", "team_no", "team id", "team_id"],
    },
    {
      header: "Team Name",
      keys: ["team name", "team_name", "team"],
    },
    {
      header: "Team Leader",
      keys: ["team leader","Team Leader Name", "leader name", "leader", "captain"],
    },
    {
      header: "Leader Phone Number",
      keys: [
        "Team Leader Phone ",
        "leader phone number",
        "leader phone",
        "leader phone no",
        "leader_phone",
        "phone",
        "mobile",
      ],
    },
    {
      header: "Leader Email",
      keys: ["Team Leader Email","Team Leader mail", "leader email", "leader_email", "email"],
    },
    {
      header: "Project Title",
      keys: ["project title", "project", "title"],
      cellStyle: {
        maxWidth: "250px",
        whiteSpace: "normal",
        wordWrap: "break-word",
      },
    },
    {
      header: "Domain",
      keys: ["domain", "track", "category"],
    },
  ];

  const normalizeKey = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

  const resolveValue = (row, keys) => {
    const normalizedRow = new Map(
      Object.entries(row).map(([key, value]) => [normalizeKey(key), value])
    );

    for (const key of keys) {
      const normalizedKey = normalizeKey(key);
      if (normalizedRow.has(normalizedKey)) {
        return normalizedRow.get(normalizedKey);
      }
    }

    return "";
  };

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columnConfig.map((column) => (
                <th key={column.header}>{column.header}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columnConfig.map((column) => (
                  <td key={column.header} style={column.cellStyle}>
                    {resolveValue(row, column.keys)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableView;