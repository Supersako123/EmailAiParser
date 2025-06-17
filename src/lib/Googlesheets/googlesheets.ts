import { google } from "googleapis";
import path from "path";
require("dotenv").config();
import fs from "fs";

const id = process.env.SPREADSHEET_ID;
const credentialsPath = path.resolve(
  __dirname,
  "../../../credentials/credentials.json"
);

if (id == undefined) {
  throw new Error(
    "SPREADSHEET_ID is not defined in .env, please define it and try again"
  );
}

if (!fs.existsSync(credentialsPath)) {
  throw new Error(`credentials.json file not found at: ${credentialsPath}`);
}

const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const sheets = google.sheets({ version: "v4", auth });
export const spreadsheetId = process.env.SPREADSHEET_ID;
