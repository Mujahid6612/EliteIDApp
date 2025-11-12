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

    // Get Apify API token from environment variable
    const apifyApiToken = process.env.VITE_APIFY_API_TOKEN;

    if (!apifyApiToken) {
      console.error("Apify API token not configured");
      return res.status(500).json({ error: "API configuration error. Please contact support." });
    }

    // Call Apify API using run-sync-get-dataset-items endpoint
    const apifyUrl = new URL('https://api.apify.com/v2/acts/easyapi~bank-routing-number-lookup/run-sync-get-dataset-items');
    apifyUrl.searchParams.append('token', apifyApiToken);

    const input = {
      routingNumbers: [routingNumber],
      paymentMethod: "ACH",
    };

    console.log("Calling Apify API with routing number:", routingNumber);
    console.log("Request URL:", apifyUrl.toString());
    console.log("Input:", input);

    const apifyResponse = await fetch(apifyUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    console.log("Apify response status:", apifyResponse.status);
    console.log("Apify response headers:", Object.fromEntries(apifyResponse.headers.entries()));

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error("Apify API error response:", errorText);
      return res.status(500).json({ error: "Failed to fetch bank information from Apify" });
    }

    const contentType = apifyResponse.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      try {
        data = await apifyResponse.json();
      } catch (parseError) {
        console.error("Failed to parse Apify response as JSON:", parseError);
        return res.status(500).json({ error: "Failed to parse bank information" });
      }
    } else {
      const text = await apifyResponse.text();
      console.error("Unexpected Apify response format:", text);
      return res.status(500).json({ error: "Unexpected API response format" });
    }

    console.log("Apify parsed response:", JSON.stringify(data, null, 2));

    // Handle the response - it should be an array of results
    if (!Array.isArray(data)) {
      console.log("Response is not an array, checking for nested data...");
      if (data.results && Array.isArray(data.results)) {
        data = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        data = data.data;
      } else if (data.items && Array.isArray(data.items)) {
        data = data.items;
      } else {
        data = [];
      }
    }

    console.log("Processed data:", data);
    console.log("Data length:", data.length);

    // Check if we got results
    if (!data || data.length === 0) {
      console.log("No results returned from Apify for routing number:", routingNumber);
      return res.status(404).json({ 
        error: "Invalid routing number. Must be a valid 9-digit ABA routing number." 
      });
    }

    // Extract bank name from the first result
    const result = data[0];
    console.log("First result:", JSON.stringify(result, null, 2));
    console.log("Result keys:", Object.keys(result));

    let bankName = null;

    // Try different possible field names for bank name
    if (result.bankName && typeof result.bankName === 'string') {
      bankName = result.bankName;
    } else if (result.bank_name && typeof result.bank_name === 'string') {
      bankName = result.bank_name;
    } else if (result.name && typeof result.name === 'string') {
      bankName = result.name;
    } else if (result.institutionName && typeof result.institutionName === 'string') {
      bankName = result.institutionName;
    } else if (result.institution_name && typeof result.institution_name === 'string') {
      bankName = result.institution_name;
    } else if (result.customer_name && typeof result.customer_name === 'string') {
      bankName = result.customer_name;
    }

    if (!bankName) {
      console.log("Could not extract bank name from result");
      return res.status(404).json({ 
        error: "Invalid routing number. Must be a valid 9-digit ABA routing number." 
      });
    }

    console.log("Bank found:", bankName);
    return res.status(200).json({
      success: true,
      bankName: bankName.trim(),
    });

  } catch (error) {
    console.error("Error fetching bank routing:", error);
    return res.status(500).json({ 
      error: "Failed to fetch bank information. Please try again." 
    });
  }
}
