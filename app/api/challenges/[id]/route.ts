import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateChallengeStats, getTodayDateStr } from "@/lib/savings-calculations";
import { sanitizeText, sanitizeDate, sanitizeAmount, safeErrorResponse } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challenge = await prisma.iponChallenge.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        connectedGoal: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        savingsRecords: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // Ensure challenge has an invite code
    let inviteCode = challenge.inviteCode;
    if (!inviteCode) {
      inviteCode = "IPON-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      await prisma.iponChallenge.update({
        where: { id: challenge.id },
        data: { inviteCode },
      });
    }

    // Calculate pooled stats across all members
    const dateMap = new Map<string, { date: string; dailyGoal: number; amountSaved: number }>();
    challenge.savingsRecords.forEach((r) => {
      const existing = dateMap.get(r.date);
      if (existing) {
        existing.amountSaved += r.amountSaved;
      } else {
        dateMap.set(r.date, {
          date: r.date,
          dailyGoal: r.dailyGoal,
          amountSaved: r.amountSaved,
        });
      }
    });

    const pooledRecords = Array.from(dateMap.values());

    const stats = calculateChallengeStats({
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      dailyGoal: challenge.dailyGoal,
      targetAmount: challenge.targetAmount,
      records: pooledRecords,
      todayDateStr: getTodayDateStr(),
    });

    // Contributor breakdown
    const contributorMap = new Map<string, {
      userId: string;
      name: string;
      email: string;
      totalSaved: number;
      savingDays: number;
      isOwner: boolean;
    }>();

    // Owner
    contributorMap.set(challenge.userId, {
      userId: challenge.userId,
      name: challenge.user?.name || "Owner",
      email: challenge.user?.email || "",
      totalSaved: 0,
      savingDays: 0,
      isOwner: true,
    });

    // Members
    challenge.members?.forEach((m) => {
      if (!contributorMap.has(m.userId)) {
        contributorMap.set(m.userId, {
          userId: m.userId,
          name: m.user?.name || "Member",
          email: m.user?.email || "",
          totalSaved: 0,
          savingDays: 0,
          isOwner: m.userId === challenge.userId,
        });
      }
    });

    // Sum contributions
    challenge.savingsRecords.forEach((r) => {
      const contrib = contributorMap.get(r.userId);
      if (contrib && r.amountSaved > 0) {
        contrib.totalSaved += r.amountSaved;
        contrib.savingDays++;
      }
    });

    const contributors = Array.from(contributorMap.values()).map((contrib) => ({
      ...contrib,
      percentOfTotal: stats.totalSaved > 0 ? Math.round((contrib.totalSaved / stats.totalSaved) * 100) : 0,
    }));

    return NextResponse.json({
      challenge: {
        ...challenge,
        inviteCode,
        stats,
        contributors,
        isUserOwner: challenge.userId === user.id,
      },
    });
  } catch (error) {
    console.error("Fetch challenge error:", error);
    return NextResponse.json({ error: "Failed to fetch challenge" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challenge = await prisma.iponChallenge.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found or not owner" }, { status: 404 });
    }

    const body = await req.json();
    const { name, startDate, endDate, dailyGoal, targetAmount, connectedGoalId, status, isShared } = body;

    const updateData: any = {};
    if (name) updateData.name = sanitizeText(name, 80);
    if (startDate) {
      const cleanStart = sanitizeDate(startDate);
      if (cleanStart) updateData.startDate = cleanStart;
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? sanitizeDate(endDate) : null;
    }
    if (dailyGoal !== undefined) {
      const cleanDaily = sanitizeAmount(dailyGoal, 1_000_000);
      if (cleanDaily !== null) updateData.dailyGoal = cleanDaily;
    }
    if (targetAmount !== undefined) {
      const cleanTarget = sanitizeAmount(targetAmount, 100_000_000);
      if (cleanTarget !== null) updateData.targetAmount = cleanTarget;
    }
    if (connectedGoalId !== undefined) updateData.connectedGoalId = connectedGoalId || null;
    if (status) updateData.status = sanitizeText(status, 20);
    if (isShared !== undefined) updateData.isShared = Boolean(isShared);

    const updated = await prisma.iponChallenge.update({
      where: { id: params.id },
      data: updateData,
      include: {
        connectedGoal: true,
        members: {
          include: { user: { select: { id: true, name: true } } },
        },
        savingsRecords: true,
      },
    });

    return NextResponse.json({ challenge: updated });
  } catch (error) {
    return safeErrorResponse(error, "Failed to update challenge");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challenge = await prisma.iponChallenge.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: { members: true },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // If owner, delete the entire challenge
    if (challenge.userId === user.id) {
      await prisma.iponChallenge.delete({
        where: { id: params.id },
      });
      return NextResponse.json({ message: "Challenge deleted successfully" });
    } else {
      // If member, leave the challenge
      await prisma.challengeMember.deleteMany({
        where: { challengeId: params.id, userId: user.id },
      });
      return NextResponse.json({ message: "Left collaborative challenge" });
    }
  } catch (error) {
    console.error("Delete challenge error:", error);
    return NextResponse.json({ error: "Failed to delete challenge" }, { status: 500 });
  }
}
