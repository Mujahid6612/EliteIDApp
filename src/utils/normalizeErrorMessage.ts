import { getErrorMessage } from "../services/apiServices";

/**
 * Normalizes error messages to replace technical/server errors with user-friendly messages
 * This is the same logic used in apiServices.ts sanitizeErrorMessage function
 */
export const normalizeErrorMessage = (
  errorMessage: string | undefined | null
): string | undefined => {
  if (!errorMessage) {
    return undefined;
  }

  // List of technical error patterns that should be replaced with user-friendly messages
  const technicalErrorPatterns = [
    {
      pattern: /Value cannot be null/i,
    },
    {
      pattern: /Parameter name:/i,
    },
    {
      pattern: /An error has occurred/i,
    },
    {
      pattern: /Invalid response from server/i,
    },
    {
      pattern: /No data received from server/i,
    },
    {
      // Handles server-side file locking issues like:
      // "The process cannot access the file ... because it is being used by another process"
      pattern: /process cannot access the file/i,
    },
    {
      // String buffer errors
      pattern: /string buffer/i,
    },
    {
      pattern: /buffer.*error/i,
    },
    {
      // Null reference exceptions
      pattern: /NullReferenceException/i,
    },
    {
      pattern: /Object reference not set/i,
    },
    {
      // Timeout errors
      pattern: /timeout/i,
    },
    {
      pattern: /Request timeout/i,
    },
    {
      // Connection errors
      pattern: /connection.*refused/i,
    },
    {
      pattern: /ECONNREFUSED/i,
    },
    {
      pattern: /network.*error/i,
    },
    {
      // Database errors
      pattern: /database.*error/i,
    },
    {
      pattern: /SQL.*error/i,
    },
    {
      pattern: /connection.*string/i,
    },
    {
      // HTTP errors
      pattern: /HTTP.*error/i,
    },
    {
      pattern: /Internal Server Error/i,
    },
    {
      pattern: /Bad Request/i,
    },
    {
      pattern: /Service Unavailable/i,
    },
    {
      pattern: /Gateway Timeout/i,
    },
    {
      // JSON parsing errors
      pattern: /JSON.*parse/i,
    },
    {
      pattern: /Unexpected token/i,
    },
    {
      // Authentication/Authorization errors
      pattern: /Unauthorized/i,
    },
    {
      pattern: /Forbidden/i,
    },
    {
      pattern: /Access denied/i,
    },
    {
      // Generic server errors
      pattern: /Server Error/i,
    },
    {
      pattern: /500.*error/i,
    },
    {
      pattern: /502.*error/i,
    },
    {
      pattern: /503.*error/i,
    },
    {
      pattern: /504.*error/i,
    },
    {
      // Exception patterns
      pattern: /System\.Exception/i,
    },
    {
      pattern: /System\.NullReferenceException/i,
    },
    {
      pattern: /System\.ArgumentException/i,
    },
  ];

  // Check if the error message matches any technical error pattern
  for (const { pattern } of technicalErrorPatterns) {
    if (pattern.test(errorMessage)) {
      return getErrorMessage(errorMessage);
    }
  }

  // If it's a generic server error or unknown error, return user-friendly message
  if (
    errorMessage.includes("error") ||
    errorMessage.includes("Error") ||
    errorMessage.includes("failed") ||
    errorMessage.includes("Failed") ||
    errorMessage.toLowerCase().includes("exception")
  ) {
    return getErrorMessage(errorMessage);
  }

  // Return the original message if it seems user-friendly already
  return errorMessage;
};
