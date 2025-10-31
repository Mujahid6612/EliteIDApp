import { put } from "@vercel/blob";

export default async function handler(request) {
  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        Allow: "POST",
      },
    });
  }

  try {
    // Parse the request body
    const contentType = request.headers.get("content-type") || "";

    let fileBuffer;
    let fileName;
    let fileContentType;

    // Handle FormData (multipart/form-data)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      fileName = formData.get("filename");

      if (!file) {
        return new Response(
          JSON.stringify({ error: "No file provided in FormData" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (!fileName) {
        return new Response(JSON.stringify({ error: "Filename is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Convert File/Blob to ArrayBuffer then to Buffer
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      fileContentType = file.type || "application/octet-stream";
    }

    // Validate filename
    if (!fileName || fileName.trim() === "") {
      return new Response(JSON.stringify({ error: "Filename is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Upload to blob storage
    const { url } = await put(fileName, fileBuffer, {
      access: "public",
      allowOverwrite: true,
      contentType: fileContentType,
    });

    return new Response(
      JSON.stringify({
        url,
        filename: fileName,
        message: "File uploaded successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to upload file",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
