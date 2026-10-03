import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email-service";
import { sanitizeEmail, safeErrorResponse } from "@/lib/security";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Return success anyway for security so emails aren't leaked
      return NextResponse.json({
        message: "If an account exists with this email, a reset link has been generated.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      message: "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    return safeErrorResponse(error, "Failed to process request");
  }
}
