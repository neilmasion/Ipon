import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";
import { safeErrorResponse } from "@/lib/security";

export const dynamic = "force-dynamic";

const COOLDOWN_DAYS = 3;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, avatarUrl: true, avatarUpdatedAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check 3-day cooldown
    if (user.avatarUpdatedAt) {
      const elapsed = Date.now() - new Date(user.avatarUpdatedAt).getTime();
      if (elapsed < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - elapsed;
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        const remainingDays = Math.ceil(remainingHours / 24);
        const timeText = remainingHours > 24 ? `${remainingDays} day(s)` : `${remainingHours} hour(s)`;

        return NextResponse.json(
          {
            error: `Cooldown active: You can change your profile picture once every 3 days. Available in ${timeText}.`,
            cooldownRemainingMs: remainingMs,
          },
          { status: 429 }
        );
      }
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, WebP, and GIF are supported." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum allowed size is 5MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extension from file name or mime type
    const ext = file.name.split(".").pop() || "png";
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const key = `avatars/${user.id}-${Date.now()}.${cleanExt}`;

    // Upload to Cloudflare R2
    const avatarUrl = await uploadToR2(buffer, key, file.type);

    // Update database with avatarUrl and avatarUpdatedAt timestamp
    const now = new Date();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl,
        avatarUpdatedAt: now,
      },
      select: {
        id: true,
        avatarUrl: true,
        avatarUpdatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Profile image updated successfully!",
      avatarUrl: updated.avatarUrl,
      avatarUpdatedAt: updated.avatarUpdatedAt,
    });
  } catch (error: any) {
    return safeErrorResponse(error, error.message || "Failed to upload profile picture");
  }
}
