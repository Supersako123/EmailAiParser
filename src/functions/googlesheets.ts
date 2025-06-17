import { sheets, spreadsheetId } from "../lib/Googlesheets/googlesheets";
import { EmailInfo } from "@/types/EmailInfo";

/**
 * Formats an array of EmailInfo objects and writes the data to Google Sheets.
 *
 * @param {EmailInfo[]} emails - Array of email data to write to the sheet.
 * @returns A Promise that resolves when the write operation is complete.
 */
export async function writeToSheet(emails: EmailInfo[]): Promise<void> {
  if (!emails.length) {
    console.warn("No emails to write.");
    return;
  }

  const headers = Object.keys(emails[0]);
  const rows = emails.map((obj) =>
    headers.map((key) => obj[key as keyof EmailInfo] ?? "")
  );

  const values = [headers, ...rows];

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: { values },
    });
  } catch (error) {
    console.error("Error updating sheet:", error);
  }
}
