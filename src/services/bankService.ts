/**
 * Call backend API to get bank name from routing number
 * Backend handles the API calls to avoid CORS issues
 * The backend tries multiple APIs as fallback
 */
export const getBankNameFromRouting = async (routingNumber: string): Promise<string> => {
  if (!routingNumber || routingNumber.length !== 9) {
    throw new Error("Invalid routing number");
  }

  try {
    // Determine the API endpoint based on environment
    // In production (Vercel), it will be /api/get-bank-name
    // In local development, it will also be /api/get-bank-name
    const apiUrl = `/api/get-bank-name?routingNumber=${encodeURIComponent(routingNumber)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle various error statuses
      if (response.status === 400) {
        throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
      }
      if (response.status === 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw new Error(`Failed to fetch bank information (${response.status})`);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid response from server");
    }

    if (data.success && data.bankName) {
      return data.bankName.trim();
    }

    if (data.error) {
      throw new Error(data.error);
    }

    throw new Error("No bank name returned from server");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // Check for network/connection errors
    if (errorMsg.includes("Failed to fetch") || errorMsg.includes("ERR_FAILED")) {
      throw new Error("Failed to fetch bank information. Please check your connection and try again.");
    }
    
    // Re-throw with user-friendly message
    throw error;
  }
};

