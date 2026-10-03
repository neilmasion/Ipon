import { format, parseISO, differenceInCalendarDays, isAfter, isBefore, startOfDay, addDays } from "date-fns";

export interface CalculationRecord {
  date: string; // YYYY-MM-DD
  dailyGoal: number;
  amountSaved: number;
}

export function calculateExpiringDate(
  startDateStr: string,
  targetAmount: number,
  dailyGoal: number
) {
  if (!startDateStr || !targetAmount || !dailyGoal || dailyGoal <= 0 || targetAmount <= 0) {
    return null;
  }

  try {
    const daysNeeded = Math.ceil(targetAmount / dailyGoal);
    const start = parseISO(startDateStr);
    const completionDate = addDays(start, Math.max(0, daysNeeded - 1));
    const dateStr = format(completionDate, "yyyy-MM-dd");
    const formattedDate = format(completionDate, "MMMM d, yyyy");

    const years = (daysNeeded / 365.25).toFixed(1);
    const months = Math.round(daysNeeded / 30.4);

    return {
      daysNeeded,
      dateStr,
      formattedDate,
      years: parseFloat(years),
      months,
    };
  } catch {
    return null;
  }
}

export interface ChallengeCalculationOptions {
  startDate: string; // YYYY-MM-DD
  endDate?: string | null;
  dailyGoal: number;
  targetAmount: number;
  records: CalculationRecord[];
  todayDateStr?: string; // YYYY-MM-DD, defaults to local today
}

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatCurrency(amount: number, symbol = "₱"): string {
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateChallengeStats(options: ChallengeCalculationOptions) {
  const {
    startDate,
    endDate,
    dailyGoal,
    targetAmount,
    records,
    todayDateStr = getTodayDateStr(),
  } = options;

  // Map records by date for fast lookup
  const recordMap = new Map<string, CalculationRecord>();
  records.forEach((r) => {
    recordMap.set(r.date, r);
  });

  // 1. Total saved
  let totalSaved = 0;
  let savingDaysCount = 0;
  records.forEach((r) => {
    if (r.amountSaved > 0) {
      totalSaved += r.amountSaved;
      savingDaysCount++;
    }
  });

  // 2. Saved today
  const todayRecord = recordMap.get(todayDateStr);
  const savedToday = todayRecord ? todayRecord.amountSaved : 0;
  const remainingDailyGoal = Math.max(0, dailyGoal - savedToday);
  const todayGoalStatus =
    savedToday >= dailyGoal
      ? "reached"
      : savedToday > 0
      ? "partial"
      : "pending";

  // 3. Expected savings calculation based on elapsed days from startDate up to today
  // Rule: Backdated challenge does not assume past days were saved!
  // Expected savings = (number of days from startDate up to today) * dailyGoal
  const start = parseISO(startDate);
  const today = parseISO(todayDateStr);

  let elapsedDays = 0;
  if (!isBefore(today, start)) {
    // start is on or before today
    let effectiveEnd = today;
    if (endDate) {
      const end = parseISO(endDate);
      if (isBefore(end, effectiveEnd)) {
        effectiveEnd = end;
      }
    }
    elapsedDays = differenceInCalendarDays(effectiveEnd, start) + 1;
    if (elapsedDays < 0) elapsedDays = 0;
  }

  const expectedSavings = elapsedDays * dailyGoal;
  const aheadBehind = totalSaved - expectedSavings;

  // 4. Goal progress
  const goalProgressPercent = targetAmount > 0 
    ? Math.min(100, Math.round((totalSaved / targetAmount) * 100))
    : 0;
  const remainingTargetAmount = Math.max(0, targetAmount - totalSaved);

  // 5. Streaks calculation
  const { currentStreak, longestStreak } = calculateStreak(recordMap, todayDateStr, startDate);

  // 6. Average daily savings (based on saving days or elapsed days)
  const averageDailySaving = savingDaysCount > 0 ? totalSaved / savingDaysCount : 0;

  return {
    totalSaved,
    savedToday,
    remainingDailyGoal,
    todayGoalStatus,
    expectedSavings,
    aheadBehind,
    goalProgressPercent,
    remainingTargetAmount,
    currentStreak,
    longestStreak,
    savingDaysCount,
    elapsedDays,
    averageDailySaving,
  };
}

export function calculateStreak(
  recordMap: Map<string, CalculationRecord>,
  todayStr: string,
  startDateStr?: string
) {
  // Sort all recorded dates where user saved > 0
  const savedDates = Array.from(recordMap.entries())
    .filter(([_, rec]) => rec.amountSaved > 0)
    .map(([date]) => date)
    .sort();

  if (savedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const savedSet = new Set(savedDates);

  // Longest streak calculation
  let longestStreak = 0;
  let running = 0;

  // Find min date and max date to scan
  const firstDate = parseISO(savedDates[0]);
  const lastDate = parseISO(savedDates[savedDates.length - 1]);
  const totalDays = differenceInCalendarDays(lastDate, firstDate) + 1;

  for (let i = 0; i < totalDays; i++) {
    const checkDate = addDays(firstDate, i);
    const dateStr = format(checkDate, "yyyy-MM-dd");
    if (savedSet.has(dateStr)) {
      running++;
      if (running > longestStreak) {
        longestStreak = running;
      }
    } else {
      running = 0;
    }
  }

  // Current streak calculation
  // Check if today was saved. If not, check if yesterday was saved (streak is alive today until end of day)
  const today = parseISO(todayStr);
  const yesterdayStr = format(addDays(today, -1), "yyyy-MM-dd");

  let currentStreak = 0;
  let checkPointer = today;

  if (!savedSet.has(todayStr)) {
    // If today is not yet saved, check if yesterday was saved to continue streak
    if (savedSet.has(yesterdayStr)) {
      checkPointer = addDays(today, -1);
    } else {
      // Streak broken
      return { currentStreak: 0, longestStreak };
    }
  }

  // Count backwards from checkPointer
  while (true) {
    const curStr = format(checkPointer, "yyyy-MM-dd");
    if (savedSet.has(curStr)) {
      currentStreak++;
      checkPointer = addDays(checkPointer, -1);
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}
