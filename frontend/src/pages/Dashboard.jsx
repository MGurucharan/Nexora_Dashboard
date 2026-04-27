import { useMemo, useState } from "react";
import FileUpload from "../components/FileUpload";
import TableView from "../components/TableView";

function Dashboard() {
  const [shortlistedTeams, setShortlistedTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("All Tracks");
  const [sortBy, setSortBy] = useState("teamNumber");

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

  const teamNameKeys = ["team name", "team_name", "team"];
  const teamNumberKeys = ["team number", "team no", "team_no", "team id", "team_id", "Team No."];
  const domainKeys = ["domain", "track", "category"];

  const filteredShortlistedTeams = useMemo(() => {
    if (!Array.isArray(shortlistedTeams)) return [];
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedTrack = selectedTrack.trim().toLowerCase();

    const filtered = shortlistedTeams.filter((row) => {
      const teamName = resolveValue(row, teamNameKeys);
      const domain = resolveValue(row, domainKeys);

      const matchesSearch = !normalizedQuery
        ? true
        : String(teamName || "").toLowerCase().includes(normalizedQuery);

      const matchesTrack =
        normalizedTrack === "all tracks"
          ? true
          : String(domain || "").trim().toLowerCase() === normalizedTrack;

      return matchesSearch && matchesTrack;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "teamName") {
        const aName = String(resolveValue(a, teamNameKeys) || "").toLowerCase();
        const bName = String(resolveValue(b, teamNameKeys) || "").toLowerCase();
        return aName.localeCompare(bName);
      }

      const aNumber = Number(resolveValue(a, teamNumberKeys));
      const bNumber = Number(resolveValue(b, teamNumberKeys));
      if (Number.isNaN(aNumber) && Number.isNaN(bNumber)) return 0;
      if (Number.isNaN(aNumber)) return 1;
      if (Number.isNaN(bNumber)) return -1;
      return aNumber - bNumber;
    });

    return sorted;
  }, [shortlistedTeams, searchQuery, selectedTrack, sortBy]);

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Nexora Analytics</p>
        <h1>Nexora Campus Dashboard</h1>
        <p className="subtitle">
          Upload shortlisted and full team data to manage the event workflow.
        </p>
      </header>

      <section className="card">
        <div className="section-header">
          <h2>Upload Section</h2>
          <p>Shortlisted teams power the table. All teams are stored for lookup.</p>
        </div>
        <div className="upload-grid">
          <FileUpload
            label="Shortlisted Teams Excel"
            helperText="Upload the shortlisted teams sheet (xlsx/xls)."
            setData={setShortlistedTeams}
          />
          <FileUpload
            label="All Teams Excel"
            helperText="Upload the full registration sheet (xlsx/xls)."
            setData={setAllTeams}
          />
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Shortlisted Teams</h2>
          <p>Showing key fields for the selected teams list.</p>
        </div>
        <div className="table-actions">
          <div className="table-toolbar">
            <label className="search-field">
              <span className="search-icon" aria-hidden="true">
                🔍
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Search by team name"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
            <select
              className="filter-select"
              aria-label="Filter track"
              value={selectedTrack}
              onChange={(event) => setSelectedTrack(event.target.value)}
            >
              <option>All Tracks</option>
              <option>Healthcare & Social Impact</option>
              <option>Fintech & Digital Economy</option>
              <option>Sustainability & Smart Critics</option>
              <option>AI & Automation</option>
              <option>Open Innovation</option>
            </select>
            <select
              className="sort-select"
              aria-label="Sort teams"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="teamNumber">Sort by Team No.</option>
              <option value="teamName">Sort by Team Name (A-Z)</option>
            </select>
          </div>
          {shortlistedTeams.length > 0 && filteredShortlistedTeams.length === 0 ? (
            <p className="empty-state">No results found</p>
          ) : (
            <TableView data={filteredShortlistedTeams} />
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
