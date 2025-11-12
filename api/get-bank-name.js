/**
 * Backend API endpoint to fetch bank name from routing number
 * Handles CORS issues by doing the fetch server-side
 * Falls back through multiple APIs
 */

const tryAPI1 = async (routingNumber) => {
  // API 1: Using CORS proxy for bankrouting.io via backend (more reliable)
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
    `https://bankrouting.io/api/v1/aba/${routingNumber}`
  )}`;
  
  const response = await fetch(proxyUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'EliteIDApp/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`API1 failed with status ${response.status}`);
  }

  let proxyData;
  try {
    proxyData = await response.json();
  } catch {
    throw new Error("Invalid proxy response");
  }

  let data;
  try {
    data = JSON.parse(proxyData.contents);
  } catch {
    throw new Error("Invalid JSON in proxy contents");
  }
  
  if (data.status === "error" && data.error) {
    throw new Error(data.error.message || "Invalid routing number");
  }
  
  if (data.status === "success" && data.data && data.data.bank_name) {
    return data.data.bank_name;
  }
  
  throw new Error("No bank name in response");
};

const tryAPI2 = async (routingNumber) => {
  // API 2: routingnumbers.info (direct call from backend, no CORS issues)
  const response = await fetch(
    `https://www.routingnumbers.info/api/data.json?rn=${routingNumber}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EliteIDApp/1.0',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`API2 failed with status ${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid JSON response");
  }
  
  if (data.customer_name) return data.customer_name;
  if (data.bank_name) return data.bank_name;
  if (data.name) return data.name;
  
  throw new Error("No bank name field found");
};

const tryAPI3 = async (routingNumber) => {
  // API 3: Alternative fedrouting API
  const response = await fetch(
    `https://api.fedrouting.org/api/v1/aba/${routingNumber}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EliteIDApp/1.0',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`API3 failed with status ${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid JSON response");
  }
  
  if (data.bank_name) return data.bank_name;
  if (data.name) return data.name;
  if (data.customer_name) return data.customer_name;
  
  throw new Error("No bank name field found");
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { routingNumber } = req.query;

  if (!routingNumber) {
    res.status(400).json({ 
      error: "Missing routing number parameter" 
    });
    return;
  }

  if (routingNumber.length !== 9 || !/^\d+$/.test(routingNumber)) {
    res.status(400).json({ 
      error: "Invalid routing number. Must be a valid 9-digit ABA routing number." 
    });
    return;
  }

  const apis = [tryAPI1, tryAPI2, tryAPI3];
  let lastError = null;

  for (const api of apis) {
    try {
      const bankName = await api(routingNumber);
      if (bankName && bankName.trim()) {
        res.status(200).json({ 
          success: true, 
          bankName: bankName.trim() 
        });
        return;
      }
    } catch (error) {
      console.log(`API attempt failed:`, error.message);
      lastError = error;
      continue;
    }
  }

  // All APIs failed
  if (lastError) {
    console.error("All routing number APIs failed:", lastError);
  }

  res.status(400).json({ 
    error: "Invalid routing number. Must be a valid 9-digit ABA routing number." 
  });
}

