import { list } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.setHeader("Content-Type", "application/json");

  try {
    const { jobId, driverId } = req.query;

    // List all blobs in the uploads folder
    const { blobs } = await list({
      prefix: "uploads/",
    });

    // Filter vouchers based on jobId and driverId if provided
    let filteredBlobs = blobs;
    
    if (jobId || driverId) {
      filteredBlobs = blobs.filter((blob) => {
        const fileName = blob.pathname.split("/").pop() || "";
        const matchesJobId = !jobId || fileName.includes(jobId);
        const matchesDriverId = !driverId || fileName.includes(driverId);
        return matchesJobId && matchesDriverId;
      });
    }

    // Format the response
    const vouchers = filteredBlobs.map((blob) => ({
      id: blob.pathname,
      url: blob.url,
      fileName: blob.pathname.split("/").pop() || "",
      uploadedAt: blob.uploadedAt,
      size: blob.size,
    }));

    return res.status(200).json({ vouchers });
  } catch (error) {
    console.error("Failed to list vouchers", error);
    return res.status(500).json({ error: error?.message || "Failed to list vouchers" });
  }
}

