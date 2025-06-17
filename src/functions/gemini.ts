import { genai } from "../lib/gemeni/genai";
import {
  EmailInfo,
  EmailAIResponse,
  EmailInfoAnalyzed,
} from "@/types/EmailInfo";
require("dotenv").config();

/**
 * Type guard for validating AI response structure.
 *
 * Checks whether the provided object matches the shape of an EmailAIResponse,
 * specifically ensuring it has the required string fields: `whatIsBeingPrinted` and `whoIsPrinting`.
 *
 * @param obj - The object to validate.
 * @returns True if the object conforms to the EmailAIResponse type, otherwise false.
 */
function isEmailAIResponse(obj: any): obj is EmailAIResponse {
  return (
    typeof obj === "object" &&
    typeof obj.whatIsBeingPrinted === "string" &&
    typeof obj.whoIsPrinting === "string"
  );
}

/**
 * Uses AI to analyze a single email's content and extract printing-related details.
 *
 * Given an EmailInfo object, this function prompts an AI model to parse the email content
 * and extract two specific fields:
 *   1. What is being printed (`whatIsBeingPrinted`)
 *   2. Who is requesting the printing (`whoIsPrinting`)
 *
 * The AI is instructed to return a JSON object with exactly these two fields.
 * This function parses and validates the AI response using a type guard.
 *
 * If the email content is empty or the AI response is invalid, the returned EmailInfo
 * object will have `whatIsBeingPrinted` and `whoIsPrinting` set to null.
 *
 * @param email - The email object containing the content to analyze.
 * @returns A Promise that resolves to a new EmailInfo object based on the original,
 * but with the extracted fields whatIsBeingPrinted and whoIsPrinting added.
 */
export async function analyzeSingleEmail(
  email: EmailInfo
): Promise<EmailInfoAnalyzed> {
  if (!email.content) {
    return {
      ...email,
      whatIsBeingPrinted: null,
      whoIsPrinting: null,
    };
  }

  try {
    const prompt = `
You are a precise parser.

Analyze the following printing request email:

"${email.content}"

Extract the following two fields:
1. What is being printed
2. Who is requesting the printing

Return ONLY raw JSON.

Respond exactly like this:
{
  "whatIsBeingPrinted": "...",
  "whoIsPrinting": "..."
}

responses should never be longer than 200 characters long. 
`;

    const aimodel = process.env.AI_MODEL;

    if (aimodel == undefined) {
      throw new Error(
        "AI_MODEL is not defined in .env, please define it and try again"
      );
    }

    const model = genai.getGenerativeModel({ model: aimodel });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean up Markdown-style formatting if present
    const cleanedText = text.replace(/^```json\s*|```$/g, "").trim();

    const parsed = JSON.parse(cleanedText);

    if (!isEmailAIResponse(parsed)) {
      throw new Error("Invalid response format from AI");
    }

    return {
      ...email,
      whatIsBeingPrinted: parsed.whatIsBeingPrinted,
      whoIsPrinting: parsed.whoIsPrinting,
    };
  } catch (error) {
    console.error(`Error processing email ${email.id}:`, error);
    return {
      ...email,
      whatIsBeingPrinted: null,
      whoIsPrinting: null,
    };
  }
}

/**
 * Analyzes multiple emails by running `analyzeSingleEmail` on each one concurrently.
 *
 * @param emails - Array of emails to process.
 * @returns A Promise that resolves to an array of emails with added analysis results.
 */
export async function analyzeEmails(emails: EmailInfo[]): Promise<EmailInfo[]> {
  return Promise.all(emails.map((email) => analyzeSingleEmail(email)));
}
