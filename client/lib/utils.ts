import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parse JSON response from fetch
 * Throws an error if the response is not OK or not valid JSON
 */
export async function safeJsonResponse<T = any>(response: Response): Promise<T> {
  // Check if response is OK
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      } catch (e) {
        if (e instanceof Error) throw e;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } else {
      // If not JSON, it's likely an HTML error page
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
  }

  // Verify content type before parsing
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Invalid response format: expected JSON");
  }

  // Parse and return JSON
  try {
    return await response.json();
  } catch (error) {
    throw new Error("Failed to parse JSON response");
  }
}
