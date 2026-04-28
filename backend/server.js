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
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

app.use(cors());
app.use(express.json());

function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error("Missing backend/credentials.json. Add your Google service account key.");
  }

  const rawCredentials = fs.readFileSync(CREDENTIALS_PATH, "utf8").trim();
  if (!rawCredentials) {
    throw new Error("backend/credentials.json is empty.");
  }

  const credentials = JSON.parse(rawCredentials);
  if (!credentials.client_email || !credentials.private_key || !credentials.project_id) {
    throw new Error("backend/credentials.json does not contain a valid service account payload.");
  }

  return credentials;
}

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
    const credentials = loadCredentials();

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    const clean = (str) => {
      return str
        ?.toString()
        .toLowerCase()
        .normalize("NFKD")              // 🔥 handles weird unicode
        .replace(/\s+/g, "")            // remove ALL spaces
        .replace(/[^a-z0-9]/g, "")      // remove symbols
        .trim();
    };

    const sheets = google.sheets("v4");

        const meta = await sheets.spreadsheets.get({
      auth,
      spreadsheetId: SHEET_ID,
    });

    meta.data.sheets.forEach(s =>
      console.log("👉 SHEET:", JSON.stringify(s.properties.title))
    );

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

    // 3️⃣ Merge
  const merged = teams.map((team) => {
    const teamName = clean(team[1]); // from Sheet7
    console.log("TEAM KEY:", teamName);
    const payment = paymentMap.get(teamName);

    if (!payment) {
      console.log("❌ NO MATCH:", teamName);
    } else {
      console.log("✅ MATCH:", teamName);
    }

    return [
      ...team,
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