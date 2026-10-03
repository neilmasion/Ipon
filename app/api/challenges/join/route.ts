import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeText, safeErrorResponse } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inviteCode } = await req.json();
    if (!inviteCode || typeof inviteCode !== "string") {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const cleanCode = sanitizeText(inviteCode, 20).toUpperCase();

    const challenge = await prisma.iponChallenge.findUnique({
      where: { inviteCode: cleanCode },
      include: {
        user: { select: { id: true, name: true } },
        members: {
          select: { userId: true, role: true },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "No Ipon Challenge found with this invite code. Please verify the code." },
        { status: 404 }
      );
    }

    // Check if user is already the owner or a member
    const isOwner = challenge.userId === user.id;
    const isMember = challenge.members.some((m) => m.userId === user.id);

    if (isOwner || isMember) {
      return NextResponse.json({
        message: "You are already a participant of this challenge!",
        challenge: {
          id: challenge.id,
          name: challenge.name,
        },
      });
    }

    // Add user as member and ensure isShared is true
    await prisma.$transaction([
      prisma.challengeMember.create({
        data: {
          challengeId: challenge.id,
          userId: user.id,
          role: "MEMBER",
        },
      }),
      prisma.iponChallenge.update({
        where: { id: challenge.id },
        data: { isShared: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully joined "${challenge.name}"!`,
      challenge: {
        id: challenge.id,
        name: challenge.name,
      },
    });
  } catch (error) {
    return safeErrorResponse(error, "Failed to join challenge");
  }
}
