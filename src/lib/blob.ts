import { put } from "@vercel/blob";

export async function uploadAvatar(
  base64Image: string,
  userId: string
) {
  const matches = base64Image.match(
    /^data:(.+);base64,(.+)$/
  );

  if (!matches) {
    throw new Error("Invalid image format");
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  const buffer = Buffer.from(
    base64Data,
    "base64"
  );

  const extension = mimeType.split("/")[1];

  const blob = await put(
    `avatars/${userId}.${extension}`,
    buffer,
    {
      access: "public",
    }
  );

  return blob.url;
}