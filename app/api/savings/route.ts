import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeText, sanitizeDate, sanitizeAmount, safeErrorResponse } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");
    const goalId = searchParams.get("goalId");
    const month = searchParams.get("month"); // Format: YYYY-MM
    const year = searchParams.get("year");   // Format: YYYY

    let where: any = {};

    if (challengeId) {
      // In a shared challenge, fetch all members' savings records
      where.challengeId = challengeId;
      if (month) where.date = { startsWith: month };
      else if (year) where.date = { startsWith: year };
    } else {
      where.userId = user.id;
      if (goalId) where.goalId = goalId;
      if (month) where.date = { startsWith: month };
      else if (year) where.date = { startsWith: year };
    }

    const records = await prisma.savingsRecord.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        challenge: {
          select: { id: true, name: true, dailyGoal: true, isShared: true },
        },
        goal: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Fetch savings records error:", error);
    return NextResponse.json({ error: "Failed to fetch savings records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { date, amountSaved, challengeId, goalId, note } = body;

    const cleanDate = sanitizeDate(date);
    if (!cleanDate) {
      return NextResponse.json({ error: "A valid date (YYYY-MM-DD) is required" }, { status: 400 });
    }

    const parsedAmount = sanitizeAmount(amountSaved ?? 0, 10_000_000);
    if (parsedAmount === null) {
      return NextResponse.json({ error: "Amount saved must be a valid non-negative number" }, { status: 400 });
    }

    const cleanNote = note ? sanitizeText(note, 200) : null;

    // Determine challenge daily goal and connected goal
    let dailyGoal = 0;
    let targetGoalId = goalId || null;

    if (challengeId) {
      // Check if user is owner or member of this challenge
      const challenge = await prisma.iponChallenge.findFirst({
        where: {
          id: challengeId,
          OR: [
            { userId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      });

      if (!challenge) {
        return NextResponse.json({ error: "Challenge not found or not a member" }, { status: 404 });
      }

      dailyGoal = challenge.dailyGoal;
      if (!targetGoalId && challenge.connectedGoalId) {
        targetGoalId = challenge.connectedGoalId;
      }
    }

    // Calculate status
    let status = "SAVED";
    if (parsedAmount === 0) {
      status = "MISSED";
    } else if (parsedAmount < dailyGoal) {
      status = "PARTIAL";
    }

    // Check if record already exists for this user, date and challenge
    const existing = await prisma.savingsRecord.findFirst({
      where: {
        userId: user.id,
        challengeId: challengeId || null,
        date,
      },
    });

    let diff = parsedAmount;
    let record;

    if (existing) {
      diff = parsedAmount - existing.amountSaved;
      record = await prisma.savingsRecord.update({
        where: { id: existing.id },
        data: {
          amountSaved: parsedAmount,
          dailyGoal: dailyGoal || existing.dailyGoal,
          goalId: targetGoalId || existing.goalId,
          note: cleanNote !== undefined ? cleanNote : existing.note,
          status,
        },
        include: {
          user: { select: { id: true, name: true } },
          challenge: true,
          goal: true,
        },
      });
    } else {
      record = await prisma.savingsRecord.create({
        data: {
          userId: user.id,
          challengeId: challengeId || null,
          goalId: targetGoalId,
          date: cleanDate,
          dailyGoal,
          amountSaved: parsedAmount,
          note: cleanNote,
          status,
        },
        include: {
          user: { select: { id: true, name: true } },
          challenge: true,
          goal: true,
        },
      });
    }

    // Automatically update connected goal's current amount if connected
    if (targetGoalId && diff !== 0) {
      await prisma.goal.update({
        where: { id: targetGoalId },
        data: {
          currentAmount: {
            increment: diff,
          },
        },
      });
    }

    return NextResponse.json({ record }, { status: 200 });
  } catch (error) {
    return safeErrorResponse(error, "Failed to save record");
  }
}
