import { put } from "@vercel/blob";
import formidable from "formidable";
import { createReadStream } from "node:fs";
import { posix } from "node:path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.setHeader("Content-Type", "application/json");

  try {
    const { file, fileName } = await parseMultipartForm(req);

    if (!file) {
      return res.status(400).json({ error: "Missing file" });
    }

    const determinedName = fileName;

    if (!determinedName) {
      return res.status(400).json({ error: "Missing file name" });
    }

    const safeFileName = determinedName;
    const blobPath = `uploads/${safeFileName}`;

    const { url } = await put(blobPath, createReadStream(file.filepath), {
      access: "public",
      contentType: file.mimetype,
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return res.status(200).json({ url, path: blobPath });
  } catch (error) {
    console.error("Failed to upload file", error);
    return res.status(400).json({ error: error?.message || "Upload failed" });
  }
}

function parseMultipartForm(req) {
  const form = formidable({ multiples: false, keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      const uploadedFile = normalizeFile(
        files.file ?? firstValue(Object.values(files))
      );
      const providedName = firstValue(
        fields.fileName ?? fields.filename ?? fields.name ?? fields.file
      );

      resolve({ file: uploadedFile, fileName: providedName });
    });
  });
}

function firstValue(value) {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeFile(file) {
  if (!file) {
    return undefined;
  }

  if (Array.isArray(file)) {
    return file[0];
  }

  return file;
}
