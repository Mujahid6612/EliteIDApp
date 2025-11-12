/**
 * Get bank name from routing number using backend API
 * @param routingNumber - 9-digit ABA routing number
 * @returns Bank name or throws error
 */
export const getBankNameFromRouting = async (routingNumber: string): Promise<string> => {
  if (!routingNumber || routingNumber.length !== 9) {
    throw new Error("Invalid routing number. Must be exactly 9 digits.");
  }

  try {
    console.log("Calling backend API for routing number:", routingNumber);
    
    const response = await fetch('/api/get-bank-routing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ routingNumber }),
    });

    console.log('Backend response status:', response.status);
    
    // Try to parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error("Failed to fetch bank information. Please try again.");
      }
    } else {
      // If not JSON, read as text
      const text = await response.text();
      console.error('Unexpected response format:', text);
      throw new Error("API endpoint not available. Please make sure the dev server was restarted after installing new API routes.");
    }
    
    console.log('Backend response:', data);

    if (!response.ok) {
      // Use the error message from the API response
      throw new Error(data.error || "Failed to fetch bank information");
    }

    if (data.success && data.bankName) {
      console.log('Bank found:', data.bankName);
      return data.bankName;
    }

    throw new Error(data.error || "Invalid routing number. Must be a valid 9-digit ABA routing number.");
  } catch (error) {
    console.error("Error fetching bank name:", error);
    
    // Re-throw the error if it's already an Error instance
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Failed to fetch bank information. Please try again.");
  }
};
