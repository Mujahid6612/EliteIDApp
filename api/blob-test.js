import { put } from "@vercel/blob";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  const { url } = await put("articles/blob.txt", "Hello World!", {
    access: "public",
  });

  res.status(200).json({ url });
}
