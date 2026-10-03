import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateStreak, getTodayDateStr } from "@/lib/savings-calculations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStr = getTodayDateStr();

    // Fetch all savings records for user
    const records = await prisma.savingsRecord.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    });

    let totalSaved = 0;
    const savingDaysSet = new Set<string>();
    const dateMap = new Map<string, { date: string; dailyGoal: number; amountSaved: number }>();
    const monthlyMap: Record<string, number> = {};

    records.forEach((r) => {
      if (r.amountSaved > 0) {
        totalSaved += r.amountSaved;
        savingDaysSet.add(r.date);

        // Group by month YYYY-MM
        const monthKey = r.date.substring(0, 7);
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + r.amountSaved;
      }

      // Keep latest or sum for that date
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

    const savingDays = savingDaysSet.size;
    const { currentStreak, longestStreak } = calculateStreak(dateMap, todayStr);
    const averageDailySaving = savingDays > 0 ? Math.round(totalSaved / savingDays) : 0;

    // Check today's saved amount
    const todaySavedRecord = dateMap.get(todayStr);
    const savedToday = todaySavedRecord ? todaySavedRecord.amountSaved : 0;

    // Convert monthlyMap to sorted array for charts
    const monthlyTrend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // last 6 months
      .map(([month, amount]) => ({
        month,
        amount,
      }));

    return NextResponse.json({
      stats: {
        totalSaved,
        savedToday,
        savingDays,
        currentStreak,
        longestStreak,
        averageDailySaving,
        monthlyTrend,
        currencySymbol: user.currencySymbol || "₱",
      },
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
