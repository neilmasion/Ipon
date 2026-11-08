import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string[] } }
) {
  try {
    const key = Array.isArray(params.key) ? params.key.join("/") : params.key;
    if (!key) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const client = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME || "ipon";

    const s3Response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    if (!s3Response.Body) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Convert readable stream to byte array
    const byteArray = await s3Response.Body.transformToByteArray();

    return new NextResponse(Buffer.from(byteArray), {
      status: 200,
      headers: {
        "Content-Type": s3Response.ContentType || "image/jpeg",
        "Content-Length": String(s3Response.ContentLength || byteArray.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("[Media Proxy] Failed to get object:", error?.message || error);
    return new NextResponse("Not Found", { status: 404 });
  }
}
