import { list } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.setHeader("Content-Type", "application/json");

  try {
    const { driverId } = req.query;

    // driverId is required
    if (!driverId || driverId.trim() === "") {
      return res.status(400).json({ 
        error: "driverId is required",
        vouchers: []
      });
    }

    // List all blobs in the uploads folder
    const { blobs } = await list({
      prefix: "uploads/",
    });

    // Parse voucher filenames to extract driverId and rideId
    // Format: {driverId}-{rideId}-voucher
    const parseVoucherFileName = (fileName) => {
      // Remove "uploads/" prefix if present and get just the filename
      const name = fileName.split("/").pop() || fileName;
      
      // Remove file extension if present
      const nameWithoutExt = name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "");
      
      // Split by "-" to get parts
      const parts = nameWithoutExt.split("-");
      
      // Format should be: driverId-rideId-voucher
      if (parts.length >= 3 && parts[parts.length - 1] === "voucher") {
        const rideId = parts.slice(1, -1).join("-"); // Join middle parts in case rideId contains dashes
        return {
          driverId: parts[0],
          rideId: rideId,
        };
      }
      
      return null;
    };

    // Filter vouchers by driverId and parse the filename
    const filteredBlobs = blobs
      .filter((blob) => {
        const fileName = blob.pathname.split("/").pop() || "";
        // Check if filename starts with the driverId
        return fileName.startsWith(`${driverId}-`);
      })
      .map((blob) => {
        const fileName = blob.pathname.split("/").pop() || "";
        const parsed = parseVoucherFileName(fileName);
        
        return {
          id: blob.pathname,
          url: blob.url,
          fileName: fileName,
          driverId: parsed?.driverId || driverId,
          rideId: parsed?.rideId || "unknown",
          uploadedAt: blob.uploadedAt,
          size: blob.size,
        };
      })
      .filter((voucher) => voucher.driverId === driverId); // Double check driverId matches

    // Format the response to match AdminVoucher interface
    const vouchers = filteredBlobs.map((voucher) => ({
      driverId: voucher.driverId,
      rideId: voucher.rideId,
      voucherUrl: voucher.url,
    }));

    return res.status(200).json({ vouchers });
  } catch (error) {
    console.error("Failed to list vouchers", error);
    return res.status(500).json({ error: error?.message || "Failed to list vouchers" });
  }
}

