import * as cheerio from "cheerio";
import { EmailInfo } from "../types/EmailInfo";

/**
 * Scrapes a single page of Hillary Clinton emails related to "printing" from Wikileaks.
 *
 * Fetches the search results page for the given page number, extracts basic email metadata,
 * then visits each email's detail page to scrape and clean the email content.
 * The content is trimmed and whitespace normalized, limited to 49,999 characters
 * (to comply with Excel sheet's maximum cell size).
 * @param pageNum - The page number of search results to scrape.
 * @returns A Promise that resolves to an array of EmailInfo objects with metadata and content.
 */
export async function scrapePage(pageNum: number): Promise<EmailInfo[]> {
  const url = `https://wikileaks.org/clinton-emails/?q=printing&count=50&page=${pageNum}`;
  const $ = await cheerio.fromURL(url);

  const data = $.extract({
    result: [
      {
        selector: ".table.table-striped.search-result tbody tr",

        value: {
          id: { selector: "td:nth-child(1)" },
          href: { selector: "td:nth-child(1) a", value: "href" },
          date: { selector: "td:nth-child(2)" },
          subject: { selector: "td:nth-child(3)" },
          from: { selector: "td:nth-child(4)" },
          to: { selector: "td:nth-child(5)" },
        },
      },
    ],
  });

  const emails = data.result as EmailInfo[];

  for (const email of emails) {
    const contentUrl = `https://wikileaks.org/clinton-emails/${email.href}`;
    const $ = await cheerio.fromURL(contentUrl);

    const content = $("div.email-content#uniquer").text().trim();

    // Regular expression replacing any instance of whitespace with a single space
    // also truncates text to < 49,999 characters for excel
    email.content = content.replace(/\s+/g, " ").trim().slice(0, 49999);
  }

  // Log the structured result

  return emails;
}

/**
 * Scrapes multiple pages of emails until there are no more pages or an optional limit is reached.
 *
 * Calls `scrapePage` starting from page 1, accumulating emails from each page.
 * Stops scraping when a page returns no emails (end of results) or when the total
 * number of emails collected reaches the specified limit.
 *
 * @param limit - Optional maximum number of emails to collect.
 * @returns A Promise that resolves to an array of EmailInfo objects collected across pages.
 */
export async function scrapePages(limit?: number): Promise<EmailInfo[]> {
  let i = 1; // Current page number iterator
  let emails: EmailInfo[] = []; // Accumulator for all emails collected across pages

  while (true) {
    const tempEmails = await scrapePage(i);

    // Stop if we've gone through all the pages
    if (tempEmails.length === 0) {
      console.log(`Scraper reached last page: ${i - 1}`);
      break;
    }

    emails.push(...tempEmails);

    // Stop if we have reached or exceeded the limit
    if (limit != null && emails.length >= limit) {
      emails = emails.slice(0, limit); // Trim to exact limit
      console.log(`Scraper reached limit of ${limit} emails at page ${i}`);
      break;
    }

    i++; // increment page iterator
  }

  return emails;
}
