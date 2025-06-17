import { exit } from "process";
import { analyzeEmails } from "./functions/gemini";
import { scrapePages } from "./functions/scraper";
import { writeToSheet } from "./functions/googlesheets";

// Validates that the given number is a positive integer suitable for use as an email limit
function isValidNumber(number: number) {
  return !(isNaN(number) || number < 0 || !Number.isInteger(number));
}

// Prompts the user to enter a valid number of emails to scrape and analyze.
// Keeps prompting until a valid positive integer is entered.
function getLimit(): number {
  const prompt = require('prompt-sync')({sigint: true});
  let limit;
  do {
    const input = prompt(
      "How many emails would you like to scrape and analyze? press Enter to select all emails "
    );
    limit = Number(input);
    if (!isValidNumber(limit)) {
      console.log("Please enter a valid positive integer.");
    }
  } while (!isValidNumber(limit));

  return limit;
}

async function main() {
  console.log("Beginning page scrape");
  const limit = getLimit();
  const emails = await scrapePages(limit);
  console.log("Page scraping completed");

  console.log("Beginning email analysis");
//  const newEmails = await analyzeEmails(emails);
  console.log("Email analysis completed");

  console.log("Writing to sheets");
  await writeToSheet(emails);
  console.log("Writing to sheets completed");

  exit(1);
}

main();
