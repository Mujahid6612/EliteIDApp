/**
 * Try multiple free APIs to get bank name from routing number
 * Falls back to next API if one fails
 */
const tryAPI1 = async (routingNumber: string): Promise<string> => {
  // API 1: Using CORS proxy for bankrouting.io (Primary - confirmed working)
  // Using api.allorigins.win as CORS proxy to access bankrouting.io API
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
    `https://bankrouting.io/api/v1/aba/${routingNumber}`
  )}`;
  
  const response = await fetch(proxyUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bank information");
  }

  let proxyData;
  try {
    proxyData = await response.json();
  } catch {
    throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
  }

  // Check if the contents is valid JSON
  let data;
  try {
    data = JSON.parse(proxyData.contents);
  } catch {
    // If parsing fails, it might be HTML or invalid response
    throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
  }
  
  // Handle API error responses
  if (data.status === "error" && data.error) {
    const errorMessage = data.error.message || "Invalid routing number. Must be a valid 9-digit ABA routing number.";
    throw new Error(errorMessage);
  }
  
  // Return bank name from successful response
  if (data.status === "success" && data.data && data.data.bank_name) {
    return data.data.bank_name;
  }
  
  throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
};

const tryAPI2 = async (routingNumber: string): Promise<string> => {
  // API 2: routingnumbers.info (fallback option - free, no API key)
  const response = await fetch(
    `https://www.routingnumbers.info/api/data.json?rn=${routingNumber}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch bank information");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
  }
  
  if (data.customer_name) return data.customer_name;
  if (data.bank_name) return data.bank_name;
  if (data.name) return data.name;
  
  throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
};

const tryAPI3 = async (routingNumber: string): Promise<string> => {
  // API 3: Alternative approach using lookup service
  // This is a fallback that uses a different endpoint format
  const response = await fetch(
    `https://www.routingnumbers.info/api/data.json?rn=${routingNumber}`,
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch bank information");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
  }
  
  // Try different response formats
  if (data.customer_name) return data.customer_name;
  if (data.bank_name) return data.bank_name;
  if (data.name) return data.name;
  if (data.institution_name) return data.institution_name;
  
  throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
};

export const getBankNameFromRouting = async (routingNumber: string): Promise<string> => {
  if (!routingNumber || routingNumber.length !== 9) {
    throw new Error("Invalid routing number");
  }

  // Prioritize the working CORS proxy API first
  const apis = [tryAPI1, tryAPI2, tryAPI3];
  let lastError: Error | null = null;

  // Try each API in sequence
  for (const api of apis) {
    try {
      const bankName = await api(routingNumber);
      if (bankName && bankName.trim()) {
        return bankName.trim();
      }
    } catch (error) {
      console.log(`API attempt failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to next API
      continue;
    }
  }

  // If all APIs failed, throw the last error or a generic one
  if (lastError) {
    // Check for various error patterns and show user-friendly message
    const errorMsg = lastError.message.toLowerCase();
    if (errorMsg.includes("invalid routing number") || 
        errorMsg.includes("invalid_aba") ||
        errorMsg.includes("not valid json") ||
        errorMsg.includes("unexpected token")) {
      throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
    }
    // If it's a network/connection error, show that
    if (errorMsg.includes("failed to fetch") || errorMsg.includes("network")) {
      throw new Error("Failed to fetch bank information. Please check your connection and try again.");
    }
    // Otherwise, show the error message if it's user-friendly, or default message
    if (errorMsg.includes("invalid") || errorMsg.includes("not found")) {
      throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
    }
    throw lastError;
  }

  throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
};

