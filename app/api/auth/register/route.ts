import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { sendVerificationEmail, sendWelcomeGreetingEmail } from "@/lib/email-service";
import { sanitizeText, sanitizeEmail, toSafeUser, getSecureCookieOptions, safeErrorResponse } from "@/lib/security";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanName = sanitizeText(name, 50);
    const cleanEmail = sanitizeEmail(email);

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { error: "Please provide a valid name (at least 2 characters)" },
        { status: 400 }
      );
    }

    if (!cleanEmail) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long for security" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    // Generate secure 6-digit verification code
    const verificationToken = crypto.randomInt(100000, 1000000).toString();

    // Create user with default reminder settings
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        isVerified: true,
        verificationToken,
        reminderSettings: {
          create: {
            enabled: true,
            reminderTime: "20:00",
            email: cleanEmail,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        currency: true,
        currencySymbol: true,
        createdAt: true,
      },
    });

    // Send verification & welcome emails safely in background without blocking user registration
    try {
      await Promise.allSettled([
        sendVerificationEmail(newUser.email, verificationToken, newUser.name),
        sendWelcomeGreetingEmail(newUser.email, newUser.name),
      ]);
    } catch (mailErr) {
      console.warn("[Register] Email send skipped or failed:", mailErr);
    }

    // Sign JWT and set secure cookie
    const token = signToken({ userId: newUser.id, email: newUser.email });

    const response = NextResponse.json(
      {
        message: "Registration successful!",
        email: newUser.email,
        user: toSafeUser(newUser),
      },
      { status: 201 }
    );

    const cookieOpts = getSecureCookieOptions();
    response.cookies.set({
      name: "ipon_token",
      value: token,
      ...cookieOpts,
    });

    return response;
  } catch (error: any) {
    console.error("[Registration Error]:", error?.message || error);
    // If it's a database connection error, provide a clear error message
    if (error?.message?.includes("Can't reach database server") || error?.code === "P1001") {
      return NextResponse.json(
        { error: "Database connection failed. Please check your cloud DATABASE_URL in Vercel settings." },
        { status: 503 }
      );
    }
    return safeErrorResponse(error, error?.message || "Failed to register user");
  }
}
