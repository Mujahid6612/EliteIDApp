const jobAcknowledgedMessage = "Sorry. You can not view this job: Job acknowledged. You may close this browser window now.";

/**
 * Normalizes error messages to replace technical/server errors with user-friendly messages
 * This is the same logic used in apiServices.ts sanitizeErrorMessage function
 */
export const normalizeErrorMessage = (errorMessage: string | undefined | null): string | undefined => {
  if (!errorMessage) {
    return undefined;
  }

  // List of technical error patterns that should be replaced with user-friendly messages
  const technicalErrorPatterns = [
    {
      pattern: /Value cannot be null/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Parameter name:/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /An error has occurred/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Invalid response from server/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /No data received from server/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // Handles server-side file locking issues like:
      // "The process cannot access the file ... because it is being used by another process"
      pattern: /process cannot access the file/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // String buffer errors
      pattern: /string buffer/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /buffer.*error/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // Null reference exceptions
      pattern: /NullReferenceException/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Object reference not set/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // Timeout errors
      pattern: /timeout/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Request timeout/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // Connection errors
      pattern: /connection.*refused/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /ECONNREFUSED/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /network.*error/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // Database errors
      pattern: /database.*error/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /SQL.*error/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /connection.*string/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // HTTP errors
      pattern: /HTTP.*error/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Internal Server Error/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Bad Request/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Service Unavailable/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Gateway Timeout/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // JSON parsing errors
      pattern: /JSON.*parse/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Unexpected token/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // Authentication/Authorization errors
      pattern: /Unauthorized/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Forbidden/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Access denied/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // Generic server errors
      pattern: /Server Error/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /500.*error/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /502.*error/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /503.*error/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /504.*error/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // Exception patterns
      pattern: /System\.Exception/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /System\.NullReferenceException/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /System\.ArgumentException/i,
      replacement: jobAcknowledgedMessage,
    },
  ];

  // Check if the error message matches any technical error pattern
  for (const { pattern, replacement } of technicalErrorPatterns) {
    if (pattern.test(errorMessage)) {
      return replacement;
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
    return jobAcknowledgedMessage;
  }

  // Return the original message if it seems user-friendly already
  return errorMessage;
};

