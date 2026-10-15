import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email-service";
import { sanitizeEmail, safeErrorResponse } from "@/lib/security";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Do not reveal email existence
      return NextResponse.json({
        message: "If this email is registered and unverified, a new 6-digit code has been sent.",
      });
    }

    if (user.isVerified) {
      return NextResponse.json({
        message: "This account is already verified! You can log in directly.",
        alreadyVerified: true,
      });
    }

    // Generate fresh 6-digit numeric verification code
    const newCode = crypto.randomInt(100000, 1000000).toString();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: newCode,
      },
    });

    // Send code via free Gmail SMTP / mailer
    await sendVerificationEmail(user.email, newCode, user.name);

    return NextResponse.json({
      message: "A new 6-digit verification code has been sent to your inbox.",
      success: true,
    });
  } catch (error) {
    return safeErrorResponse(error, "Failed to resend verification code");
  }
}
