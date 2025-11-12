/**
 * Call backend API endpoint to fetch bank name from routing number
 * This works on Vercel production - the API call is server-side so no CORS issues
 */
export const getBankNameFromRouting = async (routingNumber: string): Promise<string> => {
  if (!routingNumber || routingNumber.length !== 9) {
    throw new Error("Invalid routing number");
  }

  try {
    console.log(`[getBankName] Fetching bank info for routing number: ${routingNumber}`);
    
    // Call the backend API endpoint
    // On Vercel: /api/get-bank-name will be routed to /api/get-bank-name.js by vercel.json
    const apiUrl = `/api/get-bank-name?routingNumber=${encodeURIComponent(routingNumber)}`;
    console.log(`[getBankName] Calling API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`[getBankName] API Response Status: ${response.status}`);

    if (!response.ok) {
      // Log the response text for debugging
      let responseText = '';
      try {
        responseText = await response.text();
        console.error(`[getBankName] Error response: ${responseText.substring(0, 200)}`);
      } catch {
        console.error(`[getBankName] Could not read error response`);
      }

      if (response.status === 400) {
        throw new Error("Invalid routing number. Must be a valid 9-digit ABA routing number.");
      }
      if (response.status === 404) {
        throw new Error("API endpoint not found. Please contact support.");
      }
      if (response.status === 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw new Error(`Failed to fetch bank information (${response.status})`);
    }

    let data;
    try {
      data = await response.json();
      console.log(`[getBankName] Successfully parsed JSON response:`, data);
    } catch (error) {
      console.error(`[getBankName] Failed to parse JSON:`, error);
      throw new Error("Invalid response from server - expected JSON");
    }

    if (data.success && data.bankName) {
      console.log(`[getBankName] Success! Bank name: ${data.bankName}`);
      return data.bankName.trim();
    }

    if (data.error) {
      console.error(`[getBankName] API returned error:`, data.error);
      throw new Error(data.error);
    }

    console.error(`[getBankName] Unexpected response format:`, data);
    throw new Error("No bank name returned from server");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[getBankName] Error:`, errorMsg);
    
    // Check for network/connection errors
    if (errorMsg.includes("Failed to fetch") || errorMsg.includes("ERR_FAILED") || errorMsg.includes("TypeError")) {
      throw new Error("Failed to fetch bank information. Please check your connection and try again.");
    }
    
    // Re-throw with user-friendly message
    throw error;
  }
};

