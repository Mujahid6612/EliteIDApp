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

    // Parse voucher filenames to extract driver ID, reservation number and date
    // New format: {DriverId}-{ReservationNumber}-{dateString}-voucher
    // dateString format: DD-MM-YYYY (e.g., "01-12-2025")
    // Example: DRIVER123-05C96053DBE54DC7947760350493D674-01-12-2025-voucher
    const parseVoucherFileName = (fileName) => {
      // Remove "uploads/" prefix if present and get just the filename
      const name = fileName.split("/").pop() || fileName;
      
      // Remove file extension if present
      const nameWithoutExt = name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "");
      
      // Split by "-" to get parts
      const parts = nameWithoutExt.split("-");
      
      // New format: DriverId-ReservationNumber-DD-MM-YYYY-voucher
      // Format is: [driverId, reservationNumber, DD, MM, YYYY, voucher] (minimum 6 parts)
      if (parts.length >= 6 && parts[parts.length - 1] === "voucher") {
        // Check if the last 4 parts before "voucher" match DD-MM-YYYY format
        const year = parts[parts.length - 2]; // YYYY (4 digits)
        const month = parts[parts.length - 3]; // MM (2 digits)
        const day = parts[parts.length - 4]; // DD (2 digits)
        
        // Validate date format: year is 4 digits, month and day are 2 digits
        if (/^\d{4}$/.test(year) && /^\d{2}$/.test(month) && /^\d{2}$/.test(day)) {
          // Extract date parts: [DD, MM, YYYY]
          const dateString = `${day}-${month}-${year}`; // DD-MM-YYYY format
          
          // Extract reservation number (everything between driverId and date)
          // Parts structure: [driverId, ...reservationNumber parts..., DD, MM, YYYY, voucher]
          const reservationNumber = parts.slice(1, -4).join("-");
          const driverId = parts[0]; // First part is driver ID
          
          // Convert DD-MM-YYYY to YYYY-MM-DD for internal use
          try {
            const dateObj = new Date(`${year}-${month}-${day}`);
            // Validate the date is valid (not NaN)
            if (isNaN(dateObj.getTime())) {
              // Invalid date, try alternative parsing
              throw new Error("Invalid date");
            }
            const date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
            // Double-check the date format is correct
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
              throw new Error("Invalid date format");
            }
            return {
              driverId: driverId,
              reservationNumber: reservationNumber,
              rideId: reservationNumber,
              startDate: date,
              endDate: date,
            };
          } catch (e) {
            // If date parsing fails, construct YYYY-MM-DD manually
            const date = `${year}-${month}-${day}`;
            return {
              driverId: driverId,
              reservationNumber: reservationNumber,
              rideId: reservationNumber,
              startDate: date,
              endDate: date,
            };
          }
        }
      }
      
      // Fallback: Try to parse old format without driver ID for backward compatibility
      // Old format: ReservationNumber-DD-MM-YYYY-voucher
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
            // Validate the date is valid (not NaN)
            if (isNaN(dateObj.getTime())) {
              throw new Error("Invalid date");
            }
            const date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
            // Double-check the date format is correct
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
              throw new Error("Invalid date format");
            }
            return {
              driverId: "unknown", // No driver ID in old format
              reservationNumber: reservationNumber,
              rideId: reservationNumber,
              startDate: date,
              endDate: date,
            };
          } catch (e) {
            // If date parsing fails, construct YYYY-MM-DD manually
            const date = `${year}-${month}-${day}`;
            return {
              driverId: "unknown", // No driver ID in old format
              reservationNumber: reservationNumber,
              rideId: reservationNumber,
              startDate: date,
              endDate: date,
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
          driverId: "unknown", // No driver ID in old format
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
          driverId: "unknown", // No driver ID in old format
          reservationNumber: reservationNumber,
          rideId: reservationNumber,
          startDate: date,
          endDate: date,
        };
      }
      
      // Fallback: Try to parse very old format for backward compatibility
      // Very old format: {driverId}-{rideId}-voucher
      // Example: 123-05C96053DBE54DC7947760350493D674-voucher
      if (parts.length >= 3 && parts[parts.length - 1] === "voucher") {
        const driverId = parts[0]; // First part is driverId
        const rideId = parts.slice(1, -1).join("-"); // Everything between driverId and "voucher" is rideId
        return {
          driverId: driverId, // Extract driverId from first part
          reservationNumber: rideId, // rideId is the reservation number
          rideId: rideId,
          startDate: null,
          endDate: null,
        };
      }
      
      return null;
    };

    // Filter vouchers by date range and parse the filename
    // IMPORTANT: Filter by the date in the filename (voucher creation date), not upload date
    const filteredBlobs = blobs
      .map((blob) => {
        const fileName = blob.pathname.split("/").pop() || "";
        const parsed = parseVoucherFileName(fileName);
        
        // Extract driver ID - prioritize parsed value, but also try to extract from filename if parsing failed
        let extractedDriverId = parsed?.driverId || "unknown";
        
        // If parsing failed but filename matches new format pattern, try to extract driverId manually
        if (!parsed && fileName.includes("-voucher")) {
          const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "");
          const parts = nameWithoutExt.split("-");
          // New format should have at least 6 parts: [driverId, reservationNumber, DD, MM, YYYY, voucher]
          if (parts.length >= 6 && parts[parts.length - 1] === "voucher") {
            // Check if last 4 parts before "voucher" look like a date
            const year = parts[parts.length - 2];
            const month = parts[parts.length - 3];
            const day = parts[parts.length - 4];
            if (/^\d{4}$/.test(year) && /^\d{2}$/.test(month) && /^\d{2}$/.test(day)) {
              extractedDriverId = parts[0] || "unknown";
            }
          }
        }
        
        return {
          id: blob.pathname,
          url: blob.url,
          fileName: fileName,
          driverId: extractedDriverId, // Always include driverId, even if parsing failed
          rideId: parsed?.rideId || parsed?.reservationNumber || "unknown",
          reservationNumber: parsed?.reservationNumber || "unknown",
          date: parsed?.startDate || parsed?.endDate || null,
          parsedDate: parsed?.startDate || parsed?.endDate || null, // Date from filename
          uploadedAt: blob.uploadedAt,
          size: blob.size,
        };
      })
      .filter((voucher) => {
        // If we have a parsed date from filename, use it for filtering
        if (voucher.parsedDate) {
          try {
            const voucherDate = new Date(voucher.parsedDate);
            // Validate the date is valid
            if (isNaN(voucherDate.getTime())) {
              throw new Error("Invalid date");
            }
            voucherDate.setHours(0, 0, 0, 0); // Start of day for comparison
            const startDate = new Date(startDateObj);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(endDateObj);
            endDate.setHours(23, 59, 59, 999);
            
            // Check if voucher date is within the date range
            return voucherDate >= startDate && voucherDate <= endDate;
          } catch (e) {
            // If date parsing fails, fall back to upload date
            const uploadDate = new Date(voucher.uploadedAt);
            return uploadDate >= startDateObj && uploadDate <= endDateObj;
          }
        }
        
        // If no parsed date (old format or parsing failed), use upload date as fallback
        const uploadDate = new Date(voucher.uploadedAt);
        return uploadDate >= startDateObj && uploadDate <= endDateObj;
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

