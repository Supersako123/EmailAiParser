import { GoogleGenerativeAI } from "@google/generative-ai";
require("dotenv").config();

const key = process.env.API_KEY;

if (key == undefined) {
  throw new Error(
    "API_KEY is not defined in .env, please define it and try again"
  );
}

export const genai = new GoogleGenerativeAI(key);
