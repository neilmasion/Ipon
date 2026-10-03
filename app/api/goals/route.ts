import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: {
        challenges: {
          select: { id: true, name: true, dailyGoal: true, status: true },
        },
        _count: {
          select: { savingsRecords: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = goals.map((g) => {
      const progressPercent = g.targetAmount > 0 
        ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
        : 0;
      const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);

      return {
        ...g,
        progressPercent,
        remainingAmount,
      };
    });

    return NextResponse.json({ goals: enriched });
  } catch (error) {
    console.error("Fetch goals error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, targetAmount, targetDate, icon, initialAmount } = body;

    if (!name || targetAmount === undefined) {
      return NextResponse.json(
        { error: "Goal name and target amount are required" },
        { status: 400 }
      );
    }

    const parsedTarget = parseFloat(targetAmount);
    const parsedInitial = initialAmount ? parseFloat(initialAmount) : 0;

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      return NextResponse.json({ error: "Target amount must be a positive number" }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        name: name.trim(),
        targetAmount: parsedTarget,
        currentAmount: isNaN(parsedInitial) ? 0 : parsedInitial,
        targetDate: targetDate || null,
        icon: icon || "🎯",
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
