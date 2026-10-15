import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText, sanitizeEmail, safeErrorResponse } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body.token || body.code;
    const email = body.email;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Please enter your 6-digit verification code." },
        { status: 400 }
      );
    }

    const cleanToken = sanitizeText(token.trim(), 50);

    // If email is provided, check with email; otherwise find by token
    let user = null;
    const cleanEmail = email ? sanitizeEmail(email) : null;
    if (cleanEmail) {
      user = await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          verificationToken: cleanToken,
        },
      });

      // Check if user is already verified
      if (!user) {
        const alreadyVerified = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
        if (alreadyVerified?.isVerified) {
          return NextResponse.json({
            message: "Your email is already verified! You can proceed to the app.",
            alreadyVerified: true,
          });
        }
      }
    } else {
      user = await prisma.user.findFirst({
        where: { verificationToken: cleanToken },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired 6-digit code. Please check your email or request a new code." },
        { status: 400 }
      );
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
      success: true,
    });
  } catch (error) {
    return safeErrorResponse(error, "Failed to verify code");
  }
}
