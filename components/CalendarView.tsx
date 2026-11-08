"use client";

import { useState } from "react";
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  addMonths, 
  subMonths, 
  isSameDay, 
  isBefore, 
  isAfter, 
  startOfDay 
} from "date-fns";
import { ChevronLeft, ChevronRight, Check, Users, User } from "lucide-react";
import { formatCurrency, getTodayDateStr } from "@/lib/savings-calculations";

export interface CalendarSavingsRecord {
  id: string;
  userId?: string;
  user?: { id?: string; name: string };
  date: string;
  amountSaved: number;
  dailyGoal: number;
  note?: string | null;
  status: string;
}

interface CalendarViewProps {
  challengeStartDate: string; // YYYY-MM-DD
  challengeEndDate?: string | null;
  dailyGoal: number;
  records: CalendarSavingsRecord[];
  currentUserId?: string;
  onSelectDate: (dateStr: string, currentSaved: number, note?: string, dayRecords?: CalendarSavingsRecord[]) => void;
  currencySymbol?: string;
  isShared?: boolean;
}

export default function CalendarView({
  challengeStartDate,
  challengeEndDate,
  dailyGoal,
  records,
  currentUserId,
  onSelectDate,
  currencySymbol = "₱",
  isShared = false,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"individual" | "team">("individual");
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);
  const todayStr = getTodayDateStr();
  const todayDate = startOfDay(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Map records by YYYY-MM-DD as array of records (to support multiple contributors)
  const recordMap = new Map<string, CalendarSavingsRecord[]>();
  records.forEach((r) => {
    const list = recordMap.get(r.date) || [];
    list.push(r);
    recordMap.set(r.date, list);
  });

  const chalStart = parseISO(challengeStartDate);
  const chalEnd = challengeEndDate ? parseISO(challengeEndDate) : null;

  const startDayOfWeek = getDay(monthStart);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate monthly stats for the active calendar month (split by user vs team)
  let monthTotalSaved = 0;
  let monthMySaved = 0;
  let monthElapsedDays = 0;
  daysInMonth.forEach((day) => {
    const dStr = format(day, "yyyy-MM-dd");
    const recs = recordMap.get(dStr) || [];
    monthTotalSaved += recs.reduce((acc, r) => acc + r.amountSaved, 0);
    if (currentUserId) {
      monthMySaved += recs
        .filter((r) => r.userId === currentUserId)
        .reduce((acc, r) => acc + r.amountSaved, 0);
    }

    const isBeforeStart = isBefore(day, chalStart);
    const isAfterEnd = chalEnd ? isAfter(day, chalEnd) : false;
    const isPastOrToday = !isAfter(day, todayDate);
    if (!isBeforeStart && !isAfterEnd && isPastOrToday) {
      monthElapsedDays++;
    }
  });

  const monthExpected = monthElapsedDays * dailyGoal;

  // Determine if this is a multi-person challenge
  const hasMultipleContributors = isShared || records.some((r) => r.userId && r.userId !== currentUserId);

  // Get detail for selected day
  const selectedDayRecords = selectedDayDetail ? (recordMap.get(selectedDayDetail) || []) : [];
  const selectedDayTotal = selectedDayRecords.reduce((sum, r) => sum + r.amountSaved, 0);

  return (
    <div className="glass-card rounded-3xl p-3 sm:p-6 shadow-glass relative overflow-hidden">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-bold text-ipon-text">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            {monthExpected > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-glass-sm text-ipon-primary">
                Need: {currencySymbol}{monthExpected.toLocaleString()}
              </span>
            )}
          </div>
          {hasMultipleContributors ? (
            <div className="flex flex-col gap-0.5 mt-0.5">
              <p className="text-[11px] sm:text-xs text-ipon-muted flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-ipon-primary">You:</span>{" "}
                <span>{currencySymbol}{monthMySaved.toLocaleString()}</span>
                <span className="text-ipon-muted/60">•</span>
                <span className="font-semibold text-purple-600">Partner:</span>{" "}
                <span>{currencySymbol}{(Math.max(0, monthTotalSaved - monthMySaved)).toLocaleString()}</span>
                <span className="text-ipon-muted/60">•</span>
                <span className="font-semibold text-emerald-600">Team Total:</span>{" "}
                <span>{currencySymbol}{monthTotalSaved.toLocaleString()}</span>
                <span className="text-ipon-muted/60 font-normal">({currencySymbol}{monthExpected.toLocaleString()} expected)</span>
              </p>
            </div>
          ) : (
            <p className="text-[11px] sm:text-xs text-ipon-muted mt-0.5">
              Saved {currencySymbol}{monthTotalSaved.toLocaleString()} of {currencySymbol}{monthExpected.toLocaleString()} expected this month
            </p>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 self-end sm:self-auto">
          {/* Individual vs Team View Switcher for Shared Challenges */}
          {hasMultipleContributors && (
            <div className="flex items-center p-0.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-glass-sm text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode("individual")}
                className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                  viewMode === "individual"
                    ? "bg-ipon-primary text-white shadow-sm"
                    : "text-ipon-muted hover:text-ipon-text"
                }`}
              >
                <User className="w-3 h-3" />
                <span>My View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("team")}
                className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                  viewMode === "team"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-ipon-muted hover:text-ipon-text"
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Team View</span>
              </button>
            </div>
          )}

          {/* Month Navigation */}
          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/80 shadow-glass-sm">
            <button
              onClick={prevMonth}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-ipon-muted hover:text-ipon-text hover:bg-white/90 transition-all"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-bold text-ipon-primary hover:bg-white/90 rounded-xl transition-all"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-ipon-muted hover:text-ipon-text hover:bg-white/90 transition-all"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-1.5">
        {weekDayLabels.map((day, idx) => (
          <div
            key={idx}
            className="text-[10px] sm:text-[11px] font-semibold text-ipon-muted uppercase tracking-wider py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: startDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="h-14 sm:h-20 rounded-xl sm:rounded-2xl bg-transparent" />
        ))}

        {daysInMonth.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayRecords = recordMap.get(dateStr) || [];
          
          // Total pooled savings for this day across all members
          const totalAmountSaved = dayRecords.reduce((sum, r) => sum + r.amountSaved, 0);
          const dayDailyGoal = dayRecords[0]?.dailyGoal || dailyGoal;

          // Find current user's specific record (never fallback to other users!)
          const userRecord = currentUserId 
            ? dayRecords.find((r) => r.userId === currentUserId) 
            : undefined;
          const userSaved = userRecord ? userRecord.amountSaved : 0;
          const userNote = userRecord?.note || "";

          const isDayToday = isSameDay(day, todayDate);
          const isBeforeStart = isBefore(day, chalStart);
          const isAfterEnd = chalEnd ? isAfter(day, chalEnd) : false;
          const isPast = isBefore(day, todayDate);
          const isSelected = selectedDayDetail === dateStr;

          // Status calculation based on active view mode
          const amountForStatus = viewMode === "individual" ? userSaved : totalAmountSaved;
          let status: "saved" | "partial" | "missed" | "planned" = "planned";

          if (amountForStatus >= dayDailyGoal && amountForStatus > 0) {
            status = "saved";
          } else if (amountForStatus > 0) {
            status = "partial";
          } else if (isPast && !isBeforeStart && !isAfterEnd && amountForStatus === 0) {
            status = "missed";
          } else {
            status = "planned";
          }

          const statusDot = {
            saved: "bg-emerald-500 text-white",
            partial: "bg-amber-400 text-white",
            missed: "bg-red-400 text-white",
            planned: "bg-gray-200 text-gray-400",
          }[status];

          const cardBorder = isDayToday
            ? "border-2 border-ipon-primary shadow-glass-sm bg-white/90"
            : isSelected
            ? "border-2 border-pink-300 shadow-glass-sm bg-white/90"
            : status === "saved"
            ? "border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50/70 hover:border-emerald-300"
            : status === "partial"
            ? "border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/70 hover:border-amber-300"
            : status === "missed"
            ? "border-red-200/60 bg-red-50/30 hover:bg-red-50/60 hover:border-red-300"
            : "border-white/80 bg-white/50 hover:bg-white/85 hover:border-ipon-primary/40";

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => {
                // Toggle detail panel for shared challenges
                if (hasMultipleContributors && dayRecords.length > 0) {
                  setSelectedDayDetail(isSelected ? null : dateStr);
                }
                onSelectDate(dateStr, userSaved, userNote, dayRecords);
              }}
              className={`group relative min-h-[3.5rem] h-14 sm:h-20 p-1 sm:p-2 rounded-xl sm:rounded-2xl border text-left flex flex-col justify-between backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glass-sm ${cardBorder}`}
            >
              {/* Top row: day number + contributor avatars + status dot */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[10px] sm:text-xs font-bold ${
                    isDayToday
                      ? "w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-ipon-primary text-white flex items-center justify-center -ml-0.5 text-[9px] sm:text-[11px]"
                      : isBeforeStart || isAfterEnd
                      ? "text-gray-300"
                      : "text-ipon-text"
                  }`}
                >
                  {format(day, "d")}
                </span>

                <div className="flex items-center gap-0.5 sm:gap-1">
                  {/* If multiple contributors saved on this date, show avatar count */}
                  {dayRecords.length > 1 && (
                    <span className="flex items-center text-[8px] sm:text-[9px] font-bold text-ipon-primary bg-ipon-light px-0.5 sm:px-1 rounded" title={`${dayRecords.length} contributors`}>
                      <Users className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
                      {dayRecords.length}
                    </span>
                  )}
                  <span
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${statusDot} shrink-0`}
                    title={`${status} (${viewMode === "individual" ? "My savings" : "Team total"})`}
                  />
                </div>
              </div>

              {/* Bottom row: Amount display according to active View Mode */}
              <div className="w-full truncate text-[9px] sm:text-xs">
                {viewMode === "individual" ? (
                  /* INDIVIDUAL VIEW: shows what THIS user saved */
                  userSaved > 0 ? (
                    <div className="font-bold text-ipon-text truncate">
                      <div className="flex items-center gap-0.5 text-ipon-primary truncate">
                        <span>{currencySymbol}{userSaved.toLocaleString()}</span>
                        {userSaved >= dayDailyGoal && (
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0 stroke-[3]" />
                        )}
                      </div>
                      {totalAmountSaved > userSaved && (
                        <div className="text-[8px] sm:text-[9px] font-semibold text-purple-700 truncate">
                          Partner: +{currencySymbol}{(totalAmountSaved - userSaved).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : totalAmountSaved > 0 ? (
                    /* User hasn't saved, but team has */
                    <div className="truncate">
                      <span className="text-gray-400 text-[8px] sm:text-[9px] block">
                        {currencySymbol}0
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-semibold text-purple-700 truncate block">
                        Partner: +{currencySymbol}{totalAmountSaved.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    /* Nobody saved */
                    <div className="text-ipon-muted/80 text-[8px] sm:text-[10px] font-medium truncate">
                      {currencySymbol}{dayDailyGoal.toLocaleString()}
                    </div>
                  )
                ) : (
                  /* TEAM VIEW: shows total pooled saved */
                  totalAmountSaved > 0 ? (
                    <div className="font-bold text-ipon-text truncate">
                      <div className="flex items-center gap-0.5 text-emerald-600 truncate">
                        <span>{currencySymbol}{totalAmountSaved.toLocaleString()}</span>
                        {totalAmountSaved >= dayDailyGoal && (
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0 stroke-[3]" />
                        )}
                      </div>
                      {userSaved > 0 && (
                        <div className="text-[8px] sm:text-[9px] font-normal text-ipon-primary truncate">
                          You: {currencySymbol}{userSaved.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-ipon-muted/80 text-[8px] sm:text-[10px] font-medium truncate">
                      {currencySymbol}{dayDailyGoal.toLocaleString()}
                    </div>
                  )
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day Detail Breakdown Panel — shows when clicking a day in shared challenge */}
      {hasMultipleContributors && selectedDayDetail && selectedDayRecords.length > 0 && (
        <div className="mt-3 p-3 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-glass-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-ipon-light flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-ipon-primary stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-ipon-text">
                  {format(parseISO(selectedDayDetail), "MMMM d, yyyy")}
                </h4>
                <p className="text-[10px] text-ipon-muted">Individual breakdown</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-emerald-600">
                {currencySymbol}{selectedDayTotal.toLocaleString()}
              </span>
              <span className="text-[10px] text-ipon-muted block">Team Total</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {selectedDayRecords.map((rec, idx) => {
              const isMe = rec.userId === currentUserId;
              const name = isMe ? "You" : (rec.user?.name || "Member");
              const colors = [
                "text-ipon-primary bg-ipon-light border-ipon-primary/10",
                "text-purple-600 bg-purple-50 border-purple-100",
                "text-rose-600 bg-rose-50 border-rose-100",
                "text-amber-600 bg-amber-50 border-amber-100",
              ];
              const badgeColor = colors[idx % colors.length];
              const pct = selectedDayTotal > 0 ? Math.round((rec.amountSaved / selectedDayTotal) * 100) : 0;

              return (
                <div
                  key={rec.id}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                    isMe
                      ? "bg-ipon-light/50 border-ipon-primary/20"
                      : "bg-white/60 border-white/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] border ${badgeColor}`}>
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-ipon-text flex items-center gap-1">
                        {name}
                        {isMe && (
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-ipon-primary text-white px-1 py-px rounded">
                            You
                          </span>
                        )}
                      </span>
                      {rec.note && (
                        <span className="text-[9px] text-ipon-muted block truncate max-w-[120px]">
                          {rec.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-ipon-text">
                      {currencySymbol}{rec.amountSaved.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-ipon-primary block">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Minimal Legend */}
      <div className="mt-4 pt-3 sm:mt-5 sm:pt-4 border-t border-ipon-border/60 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[10px] sm:text-xs text-ipon-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500" />
          <span>Saved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gray-300" />
          <span>Planned</span>
        </div>
      </div>
    </div>
  );
}
