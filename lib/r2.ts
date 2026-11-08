import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3-compatible client for Cloudflare R2
export function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY).");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Uploads a file buffer to Cloudflare R2 and returns its public URL
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "ipon";
  let publicUrl = process.env.R2_PUBLIC_URL || "";

  // Strip trailing slash from public url if present
  if (publicUrl.endsWith("/")) {
    publicUrl = publicUrl.slice(0, -1);
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  return publicUrl ? `${publicUrl}/${fileName}` : `/${fileName}`;
}
