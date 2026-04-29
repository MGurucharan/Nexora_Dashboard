const fs = require("fs");
const path = require("path");

const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const { google } = require("googleapis");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const SHEET_ID = process.env.SHEET_ID;
const SHEET_RANGE = process.env.SHEET_RANGE || "Sheet1!A1:Z1000";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

app.use(cors());
app.use(express.json());


function normalizeSheetRows(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return [];
  }

  return values
    .slice(1)
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) => {
      const normalizedRow = row.slice(0, 9).map((cell) => cell ?? "");

      while (normalizedRow.length < 9) {
        normalizedRow.push("");
      }

      return normalizedRow;
    });
}

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/sheet-data", async (_request, response) => {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

  const clean = (str) => {
    return str
      ?.toString()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\u00A0/g, "")        // remove non-breaking space
      .replace(/\s+/g, "")           // remove ALL spaces
      .replace(/[^\w]/g, "")         // remove non-alphanumeric
      .trim();
  };

    const sheets = google.sheets("v4");



    // 1️⃣ Fetch both sheets
  const [teamsRes, paymentsRes] = await Promise.all([
    sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: process.env.SHEET_ID, // teams
      range: process.env.SHEET_RANGE_TEAMS,
    }),
    sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: process.env.SHEET_ID_PAYMENTS, // payments ✅
      range: process.env.SHEET_RANGE_PAYMENTS,
    }),
  ]);

    const teams = teamsRes.data.values.slice(1);
    const payments = paymentsRes.data.values.slice(1);

    // 2️⃣ Create payment lookup map (by email)
    const paymentMap = new Map();

  payments.forEach((row) => {
    const teamName = clean(row[6]); // column G
    console.log("PAYMENT KEY:", teamName);
    paymentMap.set(teamName, row);
  });

    
  const headers = teamsRes.data.values[0];

  const getIndex = (name) =>
    headers.findIndex(h =>
      h?.toString().toLowerCase().includes(name)
    );
      
  const idx = {
    teamNo: getIndex("team no"),
    teamName: getIndex("team name"),
    leader: getIndex("team leader"),
    members: getIndex("team members"),
    phone: getIndex("leader phone"),
    email: getIndex("leader email"),
    project: getIndex("project title"),  // 🔥 FIX
    domain: getIndex("domain"),          // 🔥 FIX
    };
    
    console.log("INDEXES:", idx);

  // 3️⃣ Merge (CLEAN STRUCTURE)
  const merged = teams.map((team) => {
    const teamName = clean(team[idx.teamName]);
    const payment = paymentMap.get(teamName);

    return [
      team[idx.teamNo],
      team[idx.teamName],
      team[idx.leader],
      team[idx.members],   // ✅ FIXED (was breaking UI)
      team[idx.phone],
      team[idx.email],
      team[idx.project],
      team[idx.domain],
      payment?.[7] || "Not Paid",
      payment?.[8] || "-",
      payment?.[9] || "-",
      payment?.[10] || "-",
      payment?.[11] || "-",
    ];
  });
    

    return response.json({
      rows: merged,
    });

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Merge failed" });
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});