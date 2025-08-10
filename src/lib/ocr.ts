import OpenAI from "openai";
import { createWorker } from "tesseract.js";
import { env } from "~/env";

export interface ParsedJobData {
  company: string;
  title: string;
  status: "applied" | "interview" | "offer" | "rejected";
  date: string;
  notes?: string;
  sourceImageUrl?: string;
}

const openai = env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })
  : null;

/**
 * Extract job information from screenshot using GPT-4 Vision
 */
export async function extractJobDataWithGPT4Vision(
  imageUrl: string,
): Promise<ParsedJobData | null> {
  if (!openai) {
    console.warn("OpenAI client not initialized - API key missing");
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Updated from deprecated gpt-4-vision-preview
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this job application screenshot (email, application form, or confirmation page) and extract the following information in JSON format:

IMPORTANT: Look carefully for:
- Company name (could be in email headers, signatures, reference numbers, or content like "Thank you for applying to [Company]" or "[Company] Hiring Team")
  * IGNORE common email greetings like "Dear", "Hello", "Hi", etc.
  * Look for actual company names like "Ramp", "Google", "Lockheed Martin", "Microsoft", etc.
  * Check email sender information, reference numbers, or document headers
  * PAY SPECIAL ATTENTION to words that appear MULTIPLE TIMES throughout the text - companies often repeat their name in subject lines, body text, and signatures
  * Capitalized words that appear repeatedly are very likely to be company names
- Job title/position (often mentioned as specific roles with full descriptions)
  * Look for complete job titles like "Software Engineer Internship | Frontend", "Software Associate Degree Programmer - Entry Level Hourly", etc.
  * Include specializations, levels, and department information

Examples of what to look for:
- Company: "Ramp", "Google", "Lockheed Martin", "Microsoft" (NOT "Dear", "Hello", etc.)
- Position: "Software Engineer Internship | Frontend", "Software Associate Degree Programmer - Entry Level Hourly", "Data Scientist", etc.

Common patterns:
- "Your candidate reference number - [Company Name]"
- "Thank you for applying to [Company]"
- "[Company] Hiring Team"
- Email from "[Company Name] <email@company.com>"
- Repeated mentions of company name in subject and body

STRATEGY: If you see a capitalized word (like "Lockheed", "Martin", "Ramp", etc.) appearing multiple times in different parts of the email/document, it's very likely the company name.

Return ONLY valid JSON with these exact field names:
{
  "company": "extracted company name (ignore greetings, focus on repeated capitalized words)",
  "title": "complete job title with specializations",
  "status": "applied",
  "date": "YYYY-MM-DD",
  "notes": "brief summary of key details"
}

If you cannot find certain information, use empty strings for company/title, "applied" for status, today's date, and a brief note about what type of document this appears to be.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    // Parse the JSON response
    const parsed = JSON.parse(content) as ParsedJobData;

    // Validate and normalize the status
    const validStatuses = ["applied", "interview", "offer", "rejected"];
    if (!validStatuses.includes(parsed.status)) {
      parsed.status = "applied"; // Default fallback
    }

    // Add source image URL
    parsed.sourceImageUrl = imageUrl;

    return parsed;
  } catch (error) {
    console.error("GPT-4 Vision extraction failed:", error);
    return null;
  }
}

/**
 * Extract text from image using Tesseract.js OCR
 */
export async function extractTextWithTesseract(
  imageUrl: string,
): Promise<string | null> {
  try {
    console.log("Creating Tesseract worker...");

    // Add timeout to prevent hanging
    const worker = await Promise.race([
      createWorker("eng"),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Tesseract worker creation timeout")),
          30000,
        ),
      ),
    ]);

    console.log("Tesseract worker created, starting recognition...");

    const result = await Promise.race([
      worker.recognize(imageUrl),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Tesseract recognition timeout")),
          30000,
        ),
      ),
    ]);

    const text = result.data.text;
    console.log("Tesseract recognition completed, text length:", text.length);

    await worker.terminate();
    return text;
  } catch (error) {
    console.error("Tesseract OCR failed:", error);
    return null;
  }
}

/**
 * Parse extracted text into job data using simple pattern matching
 */
export function parseJobDataFromText(
  text: string,
  imageUrl?: string,
): ParsedJobData {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  // Simple pattern matching for common job application fields
  let company = "";
  let title = "";
  let status: ParsedJobData["status"] = "applied";
  let date = new Date().toISOString().split("T")[0]; // Default to today
  let notes = "";

  // Look for company name (often in headers or near "Company:")
  for (const line of lines) {
    if (
      line.toLowerCase().includes("company:") ||
      line.toLowerCase().includes("employer:")
    ) {
      company = line.split(":")[1]?.trim() ?? "";
      break;
    }
  }

  // Look for job title
  for (const line of lines) {
    if (
      line.toLowerCase().includes("position:") ||
      line.toLowerCase().includes("title:") ||
      line.toLowerCase().includes("role:")
    ) {
      title = line.split(":")[1]?.trim() ?? "";
      break;
    }
  }

  // Look for status keywords
  const textLower = text.toLowerCase();
  if (textLower.includes("interview") || textLower.includes("scheduled")) {
    status = "interview";
  } else if (textLower.includes("offer") || textLower.includes("accepted")) {
    status = "offer";
  } else if (textLower.includes("reject") || textLower.includes("declined")) {
    status = "rejected";
  }

  // Look for dates (basic pattern matching)
  const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/;
  const dateMatch = dateRegex.exec(text);
  if (dateMatch) {
    const foundDate = dateMatch[0];
    // Convert MM/DD/YYYY to YYYY-MM-DD if needed
    if (foundDate.includes("/")) {
      const dateParts = foundDate.split("/");
      const month = dateParts[0];
      const day = dateParts[1];
      const year = dateParts[2];
      if (month && day && year) {
        date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    } else {
      date = foundDate;
    }
  }

  // If we couldn't find company or title in structured format,
  // try to infer from the first few lines
  if (!company && lines.length > 0) {
    company = lines[0] ?? ""; // Often the first line is the company name
  }

  if (!title && lines.length > 1) {
    title = lines[1] ?? ""; // Job title often follows company name
  }

  // Use remaining text as notes
  notes = lines.slice(2).join(" ").substring(0, 500); // Limit notes length

  return {
    company: company || "Unknown Company",
    title: title || "Unknown Position",
    status,
    date: date ?? new Date().toISOString().split("T")[0]!,
    notes,
    sourceImageUrl: imageUrl,
  };
}

/**
 * Main function to extract job data from screenshot
 * Tries GPT-4 Vision first, falls back to Tesseract OCR, then provides manual option
 */
export async function extractJobDataFromScreenshot(
  imageUrl: string,
): Promise<ParsedJobData> {
  console.log("Starting OCR extraction for image:", imageUrl);

  // Try GPT-4 Vision first
  if (env.OPENAI_API_KEY) {
    console.log("Attempting GPT-4 Vision extraction...");
    try {
      const gptResult = await extractJobDataWithGPT4Vision(imageUrl);
      if (gptResult) {
        console.log("GPT-4 Vision extraction successful");
        return gptResult;
      }
    } catch (error) {
      console.error("GPT-4 Vision failed:", error);
    }
  } else {
    console.log("OpenAI API key not found, skipping GPT-4 Vision");
  }

  // Check if we're in a browser environment for Tesseract
  if (typeof window !== "undefined") {
    console.log("Falling back to Tesseract OCR...");
    try {
      const extractedText = await extractTextWithTesseract(imageUrl);
      if (extractedText) {
        console.log("Tesseract OCR successful, parsing text...");
        return parseJobDataFromText(extractedText, imageUrl);
      }
    } catch (error) {
      console.error("Tesseract OCR failed:", error);
    }
  } else {
    console.log("Skipping Tesseract OCR (server-side environment)");
  }

  // Ultimate fallback - return default data structure
  console.log("OCR methods failed or unavailable, returning default data");
  return {
    company: "",
    title: "",
    status: "applied",
    date: new Date().toISOString().split("T")[0]!,
    notes: "No data extracted - please fill in manually",
    sourceImageUrl: imageUrl,
  };
}
