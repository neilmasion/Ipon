import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email-service";
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
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user with default reminder settings
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        isVerified: false,
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

    // Send verification email (token is only sent in the email, never leaked in API response)
    await sendVerificationEmail(newUser.email, verificationToken, newUser.name);

    // Sign JWT and set secure cookie
    const token = signToken({ userId: newUser.id, email: newUser.email });

    const response = NextResponse.json(
      {
        message: "Registration successful. Please verify your email.",
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
  } catch (error) {
    return safeErrorResponse(error, "Failed to register user");
  }
}
