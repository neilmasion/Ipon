import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateChallengeStats, getTodayDateStr } from "@/lib/savings-calculations";
import { sanitizeText, sanitizeDate, sanitizeAmount, safeErrorResponse } from "@/lib/security";
import { serverCache, getApiCacheHeaders } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `user:${user.id}:challenges`;

    const enriched = await serverCache.getOrSet(
      cacheKey,
      async () => {
        const challenges = await prisma.iponChallenge.findMany({
          where: {
            OR: [
              { userId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            connectedGoal: true,
            members: {
              include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
              },
            },
            savingsRecords: {
              include: {
                user: { select: { id: true, name: true } },
              },
              orderBy: { date: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        const todayStr = getTodayDateStr();

        return challenges.map((c) => {
          const dateMap = new Map<string, { date: string; dailyGoal: number; amountSaved: number }>();
          c.savingsRecords.forEach((r) => {
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
            startDate: c.startDate,
            endDate: c.endDate,
            dailyGoal: c.dailyGoal,
            targetAmount: c.targetAmount,
            records: pooledRecords,
            todayDateStr: todayStr,
          });

          // Current user's individual stats
          const myUserRecords = c.savingsRecords
            .filter((r) => r.userId === user.id)
            .map((r) => ({
              date: r.date,
              dailyGoal: r.dailyGoal,
              amountSaved: r.amountSaved,
            }));

          const myStats = calculateChallengeStats({
            startDate: c.startDate,
            endDate: c.endDate,
            dailyGoal: c.dailyGoal,
            targetAmount: c.targetAmount,
            records: myUserRecords,
            todayDateStr: todayStr,
          });

          // Contributor breakdown
          const contributorMap = new Map<string, {
            userId: string;
            name: string;
            email: string;
            avatarUrl: string | null;
            totalSaved: number;
            savingDays: number;
            isOwner: boolean;
          }>();

          // Ensure challenge owner is in contributorMap
          contributorMap.set(c.userId, {
            userId: c.userId,
            name: c.user?.name || "Owner",
            email: c.user?.email || "",
            avatarUrl: c.user?.avatarUrl || null,
            totalSaved: 0,
            savingDays: 0,
            isOwner: true,
          });

          // Ensure all joined members are in contributorMap
          c.members?.forEach((m) => {
            if (!contributorMap.has(m.userId)) {
              contributorMap.set(m.userId, {
                userId: m.userId,
                name: m.user?.name || "Member",
                email: m.user?.email || "",
                avatarUrl: m.user?.avatarUrl || null,
                totalSaved: 0,
                savingDays: 0,
                isOwner: m.userId === c.userId,
              });
            }
          });

          // Sum each contributor's savings
          c.savingsRecords.forEach((r) => {
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

          return {
            ...c,
            stats,
            myStats,
            contributors,
            isUserOwner: c.userId === user.id,
          };
        });
      },
      20_000 // 20s TTL
    );

    return NextResponse.json({ challenges: enriched }, { headers: getApiCacheHeaders(10, 60) });
  } catch (error) {
    console.error("Fetch challenges error:", error);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      startDate,
      endDate,
      dailyGoal,
      targetAmount,
      connectedGoalId,
      isShared = false,
    } = body;

    const cleanName = sanitizeText(name, 80);
    const cleanStartDate = sanitizeDate(startDate);
    const cleanEndDate = endDate ? sanitizeDate(endDate) : null;
    const parsedDailyGoal = sanitizeAmount(dailyGoal, 1_000_000);
    const parsedTargetAmount = sanitizeAmount(targetAmount, 100_000_000);

    if (!cleanName || !cleanStartDate || !parsedDailyGoal || !parsedTargetAmount) {
      return NextResponse.json(
        { error: "Valid challenge name, start date, daily goal, and target amount are required." },
        { status: 400 }
      );
    }

    // Verify connected goal if provided
    let validGoalId = null;
    if (connectedGoalId) {
      const goal = await prisma.goal.findFirst({
        where: { id: connectedGoalId, userId: user.id },
      });
      if (goal) validGoalId = goal.id;
    }

    // Generate unique 6-character alphanumeric invite code
    const inviteCode = "IPON-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create challenge and add the creator as OWNER member
    const newChallenge = await prisma.iponChallenge.create({
      data: {
        userId: user.id,
        name: cleanName,
        startDate: cleanStartDate,
        endDate: cleanEndDate,
        dailyGoal: parsedDailyGoal,
        targetAmount: parsedTargetAmount,
        connectedGoalId: validGoalId,
        status: "ACTIVE",
        inviteCode,
        isShared: Boolean(isShared),
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        connectedGoal: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    // Invalidate cached challenges and stats for the user
    serverCache.invalidateUser(user.id);

    return NextResponse.json({ challenge: newChallenge }, { status: 201 });
  } catch (error) {
    return safeErrorResponse(error, "Failed to create challenge");
  }
}
