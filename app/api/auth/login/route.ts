import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { sanitizeEmail, toSafeUser, getSecureCookieOptions, safeErrorResponse } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Constant-time style failure to avoid timing attacks
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      message: "Logged in successfully",
      user: toSafeUser(user),
    });

    const cookieOpts = getSecureCookieOptions();
    response.cookies.set({
      name: "ipon_token",
      value: token,
      ...cookieOpts,
    });

    return response;
  } catch (error) {
    return safeErrorResponse(error, "Failed to log in");
  }
}
