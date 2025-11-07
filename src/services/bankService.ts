export const getBankNameFromRouting = async (routingNumber: string): Promise<string> => {
  if (!routingNumber || routingNumber.length !== 9) {
    throw new Error("Invalid routing number");
  }

  try {
    // Using routingnumbers.info API (free, no API key required)
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

    const data = await response.json();
    
    // The API returns bank information in different formats
    if (data.customer_name) {
      return data.customer_name;
    }
    if (data.bank_name) {
      return data.bank_name;
    }
    if (data.name) {
      return data.name;
    }
    
    return "";
  } catch (error) {
    console.error("Error fetching bank name:", error);
    
    // Return empty string if API fails
    // In production, you might want to use a different API or backend service
    // Alternative APIs:
    // - https://bankrouting.io/api/routing/{routingNumber} (requires API key)
    // - Your own backend service that queries a routing number database
    return "";
  }
};

