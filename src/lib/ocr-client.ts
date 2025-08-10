import { createWorker } from "tesseract.js";
import type { ParsedJobData } from "~/lib/ocr";

/**
 * Check if a string is a common email greeting or personal name that should be filtered out
 */
function isCommonGreeting(text: string): boolean {
  const lowerText = text.toLowerCase().trim();
  const commonGreetings = [
    "dear",
    "hello",
    "hi",
    "greetings",
    "good morning",
    "good afternoon",
    "good evening",
    "to whom it may concern",
    "sir",
    "madam",
    "mr",
    "mrs",
    "ms",
    "dr",
    "prof",
    "professor",
    "candidate",
    "applicant",
    "team",
    "hiring",
    "hr",
    "human resources",
    "recruiting",
    "recruitment",
  ];

  return commonGreetings.some(
    (greeting) =>
      lowerText === greeting ||
      lowerText.startsWith(greeting + " ") ||
      lowerText.endsWith(" " + greeting),
  );
}

/**
 * Find repeated capitalized words that are likely company names
 * Companies often mention their name multiple times in emails (subject, body, signature)
 */
function findRepeatedCapitalizedWords(text: string): string[] {
  // Extract both single capitalized words and multi-word capitalized phrases
  const singleWordPattern = /\b[A-Z][a-z]+\b/g;
  const multiWordPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;

  const singleWords = text.match(singleWordPattern) ?? [];
  const multiWords = text.match(multiWordPattern) ?? [];

  // Combine all matches
  const allMatches = [...singleWords, ...multiWords];

  // Count occurrences of each word/phrase
  const wordCounts = new Map<string, number>();
  const commonWords = new Set([
    "Thank",
    "You",
    "Your",
    "Application",
    "Team",
    "Hiring",
    "Email",
    "Message",
    "Subject",
    "Dear",
    "Hello",
    "Best",
    "Regards",
    "Sincerely",
    "Please",
    "We",
    "This",
    "That",
    "The",
    "A",
    "An",
    "And",
    "Or",
    "But",
    "For",
    "To",
    "From",
    "With",
    "By",
    "At",
    "In",
    "On",
    "Of",
    "As",
    "Is",
    "Are",
    "Was",
    "Were",
    "Be",
    "Been",
    "Have",
    "Has",
    "Had",
    "Do",
    "Does",
    "Did",
    "Will",
    "Would",
    "Could",
    "Should",
    "May",
    "Might",
    "Can",
    "Must",
    "Shall",
    "Reference",
    "Number",
    "Candidate",
    "Letter",
    "Letters",
    "Inbox",
  ]);

  for (const match of allMatches) {
    const cleanWord = match.trim();
    // Skip common words, single letters, and greetings
    if (
      cleanWord.length > 1 &&
      !commonWords.has(cleanWord) &&
      !isCommonGreeting(cleanWord) &&
      // Skip words that are clearly not company names
      !/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/.test(
        cleanWord,
      )
    ) {
      wordCounts.set(cleanWord, (wordCounts.get(cleanWord) ?? 0) + 1);
    }
  }

  // Find words that appear multiple times (likely company names)
  // Prioritize multi-word phrases and longer words
  const repeatedWords = Array.from(wordCounts.entries())
    .filter(([word, count]) => count >= 2 && word.length >= 3)
    .sort(([wordA, countA], [wordB, countB]) => {
      // First sort by frequency
      if (countA !== countB) return countB - countA;
      // Then prefer multi-word phrases
      const wordsA = wordA.split(" ").length;
      const wordsB = wordB.split(" ").length;
      if (wordsA !== wordsB) return wordsB - wordsA;
      // Finally prefer longer words
      return wordB.length - wordA.length;
    })
    .map(([word]) => word);

  console.log("Repeated capitalized words found:", repeatedWords);
  return repeatedWords;
}

/**
 * Client-side OCR extraction using Tesseract.js
 * This runs in the browser to avoid server-side issues
 */
export async function extractTextWithTesseractClient(
  imageUrl: string,
): Promise<string | null> {
  try {
    console.log("Creating Tesseract worker (client-side)...");

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
    console.log(
      "Tesseract recognition completed, extracted text:",
      text.substring(0, 200) + "...",
    );

    await worker.terminate();
    return text;
  } catch (error) {
    console.error("Tesseract OCR failed:", error);
    return null;
  }
}

/**
 * Parse extracted text into job data using pattern matching
 */
export function parseJobDataFromText(
  text: string,
  imageUrl?: string,
): ParsedJobData {
  console.log("Parsing job data from text:", text.substring(0, 500) + "...");

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  console.log("Text lines:", lines.slice(0, 15)); // Log first 15 lines for debugging

  // Simple pattern matching for common job application fields
  let company = "";
  let title = "";
  let status: ParsedJobData["status"] = "applied";
  let date = new Date().toISOString().split("T")[0]; // Default to today
  let notes = "";

  // Enhanced company name detection
  for (const line of lines) {
    const lineLower = line.toLowerCase();

    // Look for explicit company patterns
    if (
      lineLower.includes("company:") ||
      lineLower.includes("employer:") ||
      lineLower.includes("organization:")
    ) {
      company = line.split(":")[1]?.trim() ?? "";
      break;
    }

    // Look for "Thank you for applying to [Company]" pattern
    const thankYouPattern = /thank you for applying to ([^!.]+)/i;
    const thankYouMatch = thankYouPattern.exec(line);
    if (thankYouMatch) {
      company = thankYouMatch[1]?.trim() ?? "";
      break;
    }

    // Look for "at [Company]" pattern
    const atCompanyPattern = /\sat\s+([A-Z][a-zA-Z0-9\s&]+?)[\s!.,]/;
    const atCompanyMatch = atCompanyPattern.exec(line);
    if (atCompanyMatch) {
      company = atCompanyMatch[1]?.trim() ?? "";
      break;
    }

    // Look for "[Company] Hiring Team" pattern
    const hiringTeamPattern = /^([A-Z][a-zA-Z0-9\s&]+?)\s+Hiring\s+Team/i;
    const hiringTeamMatch = hiringTeamPattern.exec(line);
    if (hiringTeamMatch) {
      company = hiringTeamMatch[1]?.trim() ?? "";
      break;
    }

    // Look for email sender patterns like "Company Name <email@company.com>"
    const emailSenderPattern =
      /^([A-Z][a-zA-Z0-9\s&]+?)\s*<[^>]+@([a-zA-Z0-9.-]+)/;
    const emailSenderMatch = emailSenderPattern.exec(line);
    if (emailSenderMatch) {
      const senderName = emailSenderMatch[1]?.trim() ?? "";
      // Skip common email greetings and personal names
      if (!isCommonGreeting(senderName) && senderName.length > 2) {
        company = senderName;
        break;
      }
    }

    // Look for patterns like "Your candidate reference number - [Company Name]"
    const candidateRefPattern = /reference number\s*-\s*([A-Za-z\s]+)/i;
    const candidateRefMatch = candidateRefPattern.exec(line);
    if (candidateRefMatch) {
      const companyName = candidateRefMatch[1]?.trim() ?? "";
      if (!isCommonGreeting(companyName) && companyName.length > 2) {
        company = companyName;
        break;
      }
    }
  }

  // If no company found yet, try repeated capitalized word detection
  if (!company) {
    console.log(
      "No company found in patterns, trying repeated word detection...",
    );
    const repeatedWords = findRepeatedCapitalizedWords(text);

    // Take the most frequent repeated word that looks like a company name
    for (const word of repeatedWords) {
      if (
        !isCommonGreeting(word) &&
        word.length >= 3 &&
        word.length <= 30 &&
        // Additional checks to ensure it's likely a company name
        !/^(Application|Position|Job|Role|Team|Hiring|Email|Message|Subject)$/i.test(
          word,
        )
      ) {
        company = word;
        console.log(`Found repeated company name: ${company}`);
        break;
      }
    }
  }

  // Enhanced job title detection
  for (const line of lines) {
    const lineLower = line.toLowerCase();

    // Look for explicit position patterns
    if (
      lineLower.includes("position:") ||
      lineLower.includes("title:") ||
      lineLower.includes("role:") ||
      lineLower.includes("job title:")
    ) {
      title = line.split(":")[1]?.trim() ?? "";
      break;
    }

    // Look for "apply to our [Position]" pattern
    const applyToPattern =
      /apply to our ([^!.]+?)(?:\s+opening|\s+at|\s+position|!|\.)/i;
    const applyToMatch = applyToPattern.exec(line);
    if (applyToMatch) {
      title = applyToMatch[1]?.trim() ?? "";
      break;
    }

    // Look for common job title patterns with specific keywords
    if (
      lineLower.includes("engineer") ||
      lineLower.includes("developer") ||
      lineLower.includes("internship") ||
      lineLower.includes("manager") ||
      lineLower.includes("analyst") ||
      lineLower.includes("specialist") ||
      lineLower.includes("coordinator") ||
      lineLower.includes("assistant") ||
      lineLower.includes("director") ||
      lineLower.includes("frontend") ||
      lineLower.includes("backend") ||
      lineLower.includes("fullstack") ||
      lineLower.includes("software")
    ) {
      // Clean up the line to extract just the job title
      const cleanTitle = line
        .replace(/^(to our|for our|apply to|applying to|the|a|an)\s+/i, "")
        .replace(/\s+(opening|position|role|at\s+\w+).*$/i, "")
        .trim();

      if (cleanTitle.length > 5 && cleanTitle.length < 100) {
        title = cleanTitle;
        break;
      }
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

  // Enhanced date detection
  const datePatterns = [
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
    /\b\d{4}-\d{2}-\d{2}\b/,
    /\b\d{1,2}-\d{1,2}-\d{4}\b/,
    /\b\w+ \d{1,2}, \d{4}\b/,
    /\b\w+,\s+\w+ \d{1,2}, \d{1,2}:\d{2}\w{2}/,
  ];

  for (const pattern of datePatterns) {
    const dateMatch = pattern.exec(text);
    if (dateMatch) {
      const foundDate = dateMatch[0];
      try {
        const parsedDate = new Date(foundDate);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split("T")[0]!;
          break;
        }
      } catch {
        // Keep looking for other date patterns
      }
    }
  }

  // Fallback: Look for single-word company names in the first few lines
  if (!company) {
    for (const line of lines.slice(0, 8)) {
      // Skip email addresses, common words, and greetings
      if (
        !line.includes("@") &&
        !line.includes("http") &&
        !line.toLowerCase().includes("thank") &&
        !line.toLowerCase().includes("application") &&
        !line.toLowerCase().includes("team") &&
        !isCommonGreeting(line) &&
        line.length > 2 &&
        line.length < 50
      ) {
        // Look for capitalized words that could be company names
        const words = line.split(/\s+/);
        for (const word of words) {
          if (
            /^[A-Z][a-z]+$/.test(word) &&
            word.length > 3 &&
            !isCommonGreeting(word)
          ) {
            company = word;
            break;
          }
        }
        if (company) break;

        // Also try multi-word company names (like "Lockheed Martin")
        const cleanLine = line.replace(/[^\w\s]/g, "").trim();
        if (
          /^[A-Z][a-zA-Z\s]+$/.test(cleanLine) &&
          cleanLine.split(/\s+/).length <= 3 &&
          !isCommonGreeting(cleanLine)
        ) {
          company = cleanLine;
          break;
        }
      }
    }
  }

  // Fallback: Look for job titles in the text using broader patterns
  if (!title) {
    const jobTitlePatterns = [
      /software\s+associate\s+degree\s+programmer[^.]*?(?:entry\s+level)?[^.]*/i,
      /software\s+engineer(?:\s+internship)?(?:\s*\|\s*frontend)?/i,
      /frontend\s+(?:engineer|developer)(?:\s+internship)?/i,
      /backend\s+(?:engineer|developer)(?:\s+internship)?/i,
      /full\s*stack\s+(?:engineer|developer)(?:\s+internship)?/i,
      /data\s+(?:scientist|analyst|engineer)/i,
      /product\s+manager(?:\s+internship)?/i,
      /(?:senior|junior|lead)\s+(?:engineer|developer)/i,
      /(?:entry\s+level\s+)?(?:software|hardware|systems?)\s+(?:engineer|developer|programmer)/i,
      /associate\s+(?:software|hardware|systems?)\s+(?:engineer|developer|programmer)/i,
    ];

    for (const pattern of jobTitlePatterns) {
      const match = pattern.exec(text);
      if (match) {
        title = match[0].trim();
        break;
      }
    }
  }

  // Clean up extracted data
  company = company.replace(/[<>]/g, "").trim();
  title = title.replace(/[<>]/g, "").trim();

  // Use remaining text as notes (exclude company and title lines)
  const notesLines = lines.filter(
    (line) =>
      !line.includes(company) &&
      !line.includes(title) &&
      line.length > 15 &&
      !line.includes("@") &&
      !line.includes("http"),
  );
  notes = notesLines.slice(0, 2).join(" ").substring(0, 500); // Limit notes length

  console.log("Extracted data:", {
    company,
    title,
    status,
    date,
    notes: notes.substring(0, 100),
  });

  return {
    company: company || "",
    title: title || "",
    status,
    date: date ?? new Date().toISOString().split("T")[0]!,
    notes,
    sourceImageUrl: imageUrl,
  };
}

/**
 * Client-side OCR extraction - fallback when server-side OCR fails
 */
export async function extractJobDataFromScreenshotClient(
  imageUrl: string,
): Promise<ParsedJobData> {
  console.log("Starting client-side OCR extraction for image:", imageUrl);

  try {
    const extractedText = await extractTextWithTesseractClient(imageUrl);
    if (extractedText) {
      console.log("Client-side Tesseract OCR successful, parsing text...");
      return parseJobDataFromText(extractedText, imageUrl);
    }
  } catch (error) {
    console.error("Client-side Tesseract OCR failed:", error);
  }

  // Fallback - return empty data structure
  console.log("Client-side OCR failed, returning default data");
  return {
    company: "",
    title: "",
    status: "applied",
    date: new Date().toISOString().split("T")[0]!,
    notes: "OCR extraction failed - please fill in manually",
    sourceImageUrl: imageUrl,
  };
}
