import { useEffect, useState } from "react";
import FileUpload from "../components/FileUpload";
import TableView from "../components/TableView";

const API_URL = import.meta.env.VITE_API_URL || "https://nexdash-backend-s2v9.onrender.com/api/sheet-data";
const REFRESH_INTERVAL_MS = Number(import.meta.env.VITE_REFRESH_INTERVAL_MS ?? 30000);

function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const fetchSheetData = async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const nextRows = Array.isArray(payload?.rows) ? payload.rows : [];

        if (!isActive) return;

        setTeams(nextRows);
        setError("");
      } catch (requestError) {
        if (!isActive || requestError.name === "AbortError") return;

        setError("Unable to load live sheet data.");
      } finally {
        if (isActive && !silent) {
          setLoading(false);
        }
      }
    };

    fetchSheetData();

    const shouldPoll = Number.isFinite(REFRESH_INTERVAL_MS) && REFRESH_INTERVAL_MS > 0;
    const refreshTimer = shouldPoll
      ? window.setInterval(() => {
          fetchSheetData({ silent: true });
        }, REFRESH_INTERVAL_MS)
      : null;

    return () => {
      isActive = false;
      controller.abort();

      if (refreshTimer !== null) {
        window.clearInterval(refreshTimer);
      }
    };
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Nexora Analytics</p>
        <h1>Nexora Campus Dashboard</h1>
        <p className="subtitle">
          Live Google Sheets data feeds the dashboard directly through the backend API.
        </p>
      </header>

      <section className="card">
        <div className="section-header">
          <h2>Live Data Source</h2>
          <p>Manual file uploads are disabled. The dashboard syncs from Google Sheets.</p>
        </div>
        <div className="upload-grid">
          <FileUpload
            label="Google Sheets Connection"
            helperText="The backend reads the configured sheet range and serves it to the app."
            statusText="Connected"
          />
          <FileUpload
            label="Auto Refresh"
            helperText="The dashboard re-fetches live data at the configured interval."
            statusText={
              Number.isFinite(REFRESH_INTERVAL_MS) && REFRESH_INTERVAL_MS > 0
                ? `${Math.round(REFRESH_INTERVAL_MS / 1000)}s polling`
                : "Disabled"
            }
          />
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Sheet Data</h2>
          <p>Columns are rendered directly from the live sheet rows.</p>
        </div>
        {loading ? <p className="empty-state">Loading live data...</p> : null}
        {!loading && error ? <p className="empty-state">{error}</p> : null}
        {!loading && !error ? <TableView data={teams} /> : null}
      </section>
    </div>
  );
}

export default Dashboard;
