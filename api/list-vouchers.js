import { list } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.setHeader("Content-Type", "application/json");

  try {
    const { startDate, endDate } = req.query;

    // Calculate default date range: today to 14 days back
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    twoWeeksAgo.setHours(0, 0, 0, 0); // Start of day 14 days ago

    // Use provided dates or defaults
    const endDateObj = endDate ? new Date(endDate) : today;
    const startDateObj = startDate ? new Date(startDate) : twoWeeksAgo;

    // Validate dates
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({ 
        error: "Invalid date format. Use YYYY-MM-DD format.",
        vouchers: []
      });
    }

    if (startDateObj > endDateObj) {
      return res.status(400).json({ 
        error: "Start date must be before or equal to end date",
        vouchers: []
      });
    }

    // List all blobs in the uploads folder
    const { blobs } = await list({
      prefix: "uploads/",
    });

    // Parse voucher filenames to extract reservation number and date
    // New format: {ReservationNumber}-{dateString}-voucher
    // dateString format: DD-MM-YYYY (e.g., "01-12-2025")
    // Example: 05C96053DBE54DC7947760350493D674-01-12-2025-voucher
    const parseVoucherFileName = (fileName) => {
      // Remove "uploads/" prefix if present and get just the filename
      const name = fileName.split("/").pop() || fileName;
      
      // Remove file extension if present
      const nameWithoutExt = name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "");
      
      // Split by "-" to get parts
      const parts = nameWithoutExt.split("-");
      
      // New format: ReservationNumber-DD-MM-YYYY-voucher
      // Format is: [reservationNumber, DD, MM, YYYY, voucher] (minimum 5 parts)
      if (parts.length >= 5 && parts[parts.length - 1] === "voucher") {
        // Check if the last 4 parts before "voucher" match DD-MM-YYYY format
        const year = parts[parts.length - 2]; // YYYY (4 digits)
        const month = parts[parts.length - 3]; // MM (2 digits)
        const day = parts[parts.length - 4]; // DD (2 digits)
        
        // Validate date format: year is 4 digits, month and day are 2 digits
        if (/^\d{4}$/.test(year) && /^\d{2}$/.test(month) && /^\d{2}$/.test(day)) {
          // Extract date parts: [DD, MM, YYYY]
          const dateString = `${day}-${month}-${year}`; // DD-MM-YYYY format
          
          // Everything before the date is the reservation number
          const reservationNumber = parts.slice(0, -4).join("-");
          
          // Convert DD-MM-YYYY to YYYY-MM-DD for internal use
          try {
            const dateObj = new Date(`${year}-${month}-${day}`);
            const date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
            return {
              reservationNumber: reservationNumber,
              rideId: reservationNumber,
              startDate: date,
              endDate: date,
            };
          } catch (e) {
            // If date parsing fails, just return the date string
            return {
              reservationNumber: reservationNumber,
              rideId: reservationNumber,
              startDate: dateString,
              endDate: dateString,
            };
          }
        }
      }
      
      // Fallback: Try to parse old format with date range for backward compatibility
      // Old format: {ReservationNumber}-{startDate}-{endDate}-voucher
      // Format: ReservationNumber-YYYY-MM-DD-YYYY-MM-DD-voucher
      // Minimum 7 parts: [reservationNumber, YYYY, MM, DD, YYYY, MM, DD, voucher]
      if (parts.length >= 7 && parts[parts.length - 1] === "voucher") {
        // Last 7 parts before "voucher": [reservationNumber, YYYY, MM, DD, YYYY, MM, DD]
        // Extract end date (last 3 parts before "voucher"): YYYY-MM-DD
        const endDateParts = parts.slice(-4, -1); // [YYYY, MM, DD]
        const endDate = endDateParts.join("-"); // YYYY-MM-DD
        
        // Extract start date (3 parts before end date): YYYY-MM-DD
        const startDateParts = parts.slice(-7, -4); // [YYYY, MM, DD]
        const startDate = startDateParts.join("-"); // YYYY-MM-DD
        
        // Everything before the start date is the reservation number
        const reservationNumber = parts.slice(0, -7).join("-");
        
        return {
          reservationNumber: reservationNumber,
          rideId: reservationNumber,
          startDate: startDate,
          endDate: endDate,
        };
      }
      
      // Fallback: Try to parse old format with single date for backward compatibility
      // Old format: {ReservationNumber}-{YYYY-MM-DD}-voucher
      if (parts.length >= 4 && parts[parts.length - 1] === "voucher") {
        const dateParts = parts.slice(-4, -1); // Get last 3 parts before "voucher"
        const date = dateParts.join("-"); // YYYY-MM-DD
        const reservationNumber = parts.slice(0, -4).join("-");
        
        return {
          reservationNumber: reservationNumber,
          rideId: reservationNumber,
          startDate: date,
          endDate: date,
        };
      }
      
      // Fallback: Try to parse very old format for backward compatibility
      // Very old format: {driverId}-{rideId}-voucher
      if (parts.length >= 3 && parts[parts.length - 1] === "voucher") {
        const rideId = parts.slice(1, -1).join("-");
        return {
          reservationNumber: parts[0],
          rideId: rideId,
          startDate: null,
          endDate: null,
        };
      }
      
      return null;
    };

    // Filter vouchers by date range and parse the filename
    const filteredBlobs = blobs
      .filter((blob) => {
        const uploadDate = new Date(blob.uploadedAt);
        // Check if upload date is within the date range
        return uploadDate >= startDateObj && uploadDate <= endDateObj;
      })
      .map((blob) => {
        const fileName = blob.pathname.split("/").pop() || "";
        const parsed = parseVoucherFileName(fileName);
        
        return {
          id: blob.pathname,
          url: blob.url,
          fileName: fileName,
          driverId: "unknown", // Driver ID no longer in filename
          rideId: parsed?.rideId || parsed?.reservationNumber || "unknown",
          reservationNumber: parsed?.reservationNumber || "unknown",
          date: parsed?.date || null,
          uploadedAt: blob.uploadedAt,
          size: blob.size,
        };
      });

    // Format the response to match AdminVoucher interface
    const vouchers = filteredBlobs.map((voucher) => ({
      driverId: voucher.driverId,
      rideId: voucher.rideId,
      voucherUrl: voucher.url,
      fileName: voucher.fileName,
    }));

    return res.status(200).json({ vouchers });
  } catch (error) {
    console.error("Failed to list vouchers", error);
    return res.status(500).json({ 
      error: error?.message || "Failed to list vouchers",
      vouchers: []
    });
  }
}

