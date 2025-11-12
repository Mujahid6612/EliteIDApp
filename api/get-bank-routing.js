export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.setHeader("Content-Type", "application/json");

  try {
    const { routingNumber } = req.body;

    // Validate required fields
    if (!routingNumber) {
      return res.status(400).json({ error: "Routing number is required" });
    }

    // Validate routing number format (9 digits)
    if (routingNumber.length !== 9 || !/^\d+$/.test(routingNumber)) {
      return res.status(400).json({ 
        error: "Invalid routing number. Must be a valid 9-digit ABA routing number." 
      });
    }

    // Try bankrouting.io API via CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://bankrouting.io/api/v1/aba/${routingNumber}`
    )}`;

    console.log("Fetching from proxy:", proxyUrl);

    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Proxy request failed: ${response.status}`);
      return res.status(500).json({ error: "Failed to fetch bank information" });
    }

    const proxyData = await response.json();
    console.log("Proxy response:", proxyData);

    // Parse the nested JSON response from allorigins
    let data;
    try {
      data = JSON.parse(proxyData.contents);
    } catch (error) {
      console.error("Failed to parse proxy response:", error);
      return res.status(500).json({ error: "Failed to parse bank information" });
    }

    console.log("Parsed data:", data);

    // Handle API error responses
    if (data.status === "error" && data.error) {
      console.log("API returned error:", data.error.message);
      return res.status(404).json({ 
        error: data.error.message || "Invalid routing number. Must be a valid 9-digit ABA routing number."
      });
    }

    // Return bank name from successful response
    if (data.status === "success" && data.data && data.data.bank_name) {
      console.log("Found bank:", data.data.bank_name);
      return res.status(200).json({
        success: true,
        bankName: data.data.bank_name,
      });
    }

    console.log("No bank name found in response:", data);
    return res.status(404).json({ 
      error: "Invalid routing number. Must be a valid 9-digit ABA routing number." 
    });
  } catch (error) {
    console.error("Error fetching bank routing:", error);
    return res.status(500).json({ 
      error: "Failed to fetch bank information. Please try again." 
    });
  }
}

