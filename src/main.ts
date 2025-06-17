import { exit } from "process";
import { analyzeEmails } from "./functions/gemini";
import { scrapePages } from "./functions/scraper";
import { writeToSheet } from "./functions/googlesheets";

async function main() {
  console.log("Beginning page scrape");
  const emails = await scrapePages(3);
  console.log("Page scraping completed");

  console.log("Beginning email analysis");
  const newEmails = await analyzeEmails(emails);
  console.log("Email analysis completed");

  console.log("Writing to sheets");
  await writeToSheet(newEmails);
  console.log("Writing to sheets completed");

  exit(1);
}

main();
