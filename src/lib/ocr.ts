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
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this job application screenshot and extract the following information in JSON format:
- company: Company name
- title: Job title/position
- status: One of "applied", "interview", "offer", "rejected"
- date: Application date (format: YYYY-MM-DD, use today's date if not visible)
- notes: Any key highlights, requirements, or important details

Return ONLY valid JSON with these exact field names. If you cannot find certain information, use reasonable defaults or empty strings.`,
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
    const worker = await createWorker("eng");
    const {
      data: { text },
    } = await worker.recognize(imageUrl);
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
 * Tries GPT-4 Vision first, falls back to Tesseract OCR
 */
export async function extractJobDataFromScreenshot(
  imageUrl: string,
): Promise<ParsedJobData> {
  // Try GPT-4 Vision first
  if (env.OPENAI_API_KEY) {
    console.log("Attempting GPT-4 Vision extraction...");
    const gptResult = await extractJobDataWithGPT4Vision(imageUrl);
    if (gptResult) {
      console.log("GPT-4 Vision extraction successful");
      return gptResult;
    }
  }

  // Fallback to Tesseract OCR
  console.log("Falling back to Tesseract OCR...");
  const extractedText = await extractTextWithTesseract(imageUrl);

  if (extractedText) {
    console.log("Tesseract OCR successful, parsing text...");
    return parseJobDataFromText(extractedText, imageUrl);
  }

  // Ultimate fallback - return empty data structure
  console.log("Both OCR methods failed, returning default data");
  return {
    company: "Unknown Company",
    title: "Unknown Position",
    status: "applied",
    date: new Date().toISOString().split("T")[0]!,
    notes: "Failed to extract data from screenshot",
    sourceImageUrl: imageUrl,
  };
}
