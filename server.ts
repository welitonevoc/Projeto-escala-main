import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Google Sheets Auth Helper
let sheetsClient: any = null;

function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY;
  if (key) {
    // Remove aspas extras se houver e trata as quebras de linha \n
    key = key.replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n');
  }
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (!email || !key || !spreadsheetId) {
    throw new Error("Google Sheets credentials are not fully configured.");
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

// Helper to check if credentials are set
const isConfigured = () => {
  return !!(process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
};

// API Routes
app.get("/api/status", (req, res) => {
  res.json({ configured: isConfigured() });
});

app.get("/api/sheets/:range", async (req, res) => {
  if (!isConfigured()) return res.status(400).json({ error: "Google Sheets not configured" });
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: req.params.range,
    });
    res.json(response.data.values || []);
  } catch (error: any) {
    console.error("Sheets Get Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sheets/update", async (req, res) => {
  if (!isConfigured()) return res.status(400).json({ error: "Google Sheets not configured" });
  const { range, values } = req.body;
  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error(`Sheets Update Error [${range}]:`, error.message);
    // Erro amigável se a aba não existir
    if (error.message.includes("Unable to parse range")) {
      return res.status(500).json({ 
        error: `A aba "${range.split("!")[0]}" não existe na planilha. Por favor, crie-a no Google Sheets.`,
        detail: error.message 
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// Sync data (Get all at once)
app.get("/api/sync", async (req, res) => {
  if (!isConfigured()) return res.status(400).json({ error: "Google Sheets not configured" });
  try {
    const sheets = getSheetsClient();
    const ranges = ["Obreiros!A:C", "Congregacoes!A:J", "EscalaOficial!A:E", "EscalaLocal!A:G", "Eventos!A:D", "TiposCulto!A:B", "RegrasCulto!A:H"];
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges,
    });
    const data = response.data.valueRanges?.map(vr => vr.values || []) || [];
    res.json({
      obreiros: data[0],
      congregacoes: data[1],
      escalaOficial: data[2],
      escalaLocal: data[3],
      eventos: data[4],
      tiposCulto: data[5],
      regrasCulto: data[6]
    });
  } catch (error: any) {
    console.error("Sync Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!isConfigured()) {
      console.warn("⚠️ Warning: Google Sheets credentials are not set in environment variables.");
    }
  });
}

startServer();
