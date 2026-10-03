import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText, safeErrorResponse } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    const cleanToken = sanitizeText(token, 100);

    const user = await prisma.user.findFirst({
      where: { verificationToken: cleanToken },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return NextResponse.json({
      message: "Email successfully verified! Welcome to Ipon.",
    });
  } catch (error) {
    return safeErrorResponse(error, "Failed to verify email");
  }
}
