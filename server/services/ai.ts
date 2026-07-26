import { GoogleGenerativeAI, Content } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const FALLBACK_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.0-pro"
];

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateAIContent(contents: string | Content[]) {
  let lastError: any;

  for (const modelName of FALLBACK_MODELS) {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent({ contents: typeof contents === 'string' ? [{ role: "user", parts: [{ text: contents }] }] : contents });
        return result;
      } catch (error: any) {
        lastError = error;
        // Check if it's a retryable error (503 Service Unavailable or 429 Too Many Requests)
        if (error.status === 503 || error.status === 429) {
          console.warn(`[AI Service] Model ${modelName} attempt ${attempt} failed with ${error.status}. Retrying...`);
          if (attempt < MAX_RETRIES) {
            await delay(BASE_DELAY_MS * Math.pow(2, attempt - 1)); // Exponential backoff
            continue;
          }
        } else {
          // For other errors, don't retry the same model
          console.error(`[AI Service] Model ${modelName} failed with non-retryable error:`, error);
          break; // Break retry loop, try next model
        }
      }
    }
    console.warn(`[AI Service] All retries exhausted for model ${modelName}. Trying next model...`);
  }

  throw new Error(`Failed to generate AI content after trying multiple models. Last error: ${lastError?.message || lastError}`);
}
