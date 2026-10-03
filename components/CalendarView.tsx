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
import { ChevronLeft, ChevronRight, Check, Users } from "lucide-react";
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
}

export default function CalendarView({
  challengeStartDate,
  challengeEndDate,
  dailyGoal,
  records,
  currentUserId,
  onSelectDate,
  currencySymbol = "₱",
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
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

  return (
    <div className="bg-white rounded-3xl p-3 sm:p-6 shadow-soft border border-ipon-border/80">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-ipon-text">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <p className="text-[11px] sm:text-xs text-ipon-muted mt-0.5">
            Click any day to record your savings
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-ipon-bg p-1 rounded-2xl border border-ipon-border/50 self-end sm:self-auto">
          <button
            onClick={prevMonth}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-ipon-muted hover:text-ipon-text hover:bg-white transition-all"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-semibold text-ipon-primary hover:bg-white rounded-xl transition-all"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-ipon-muted hover:text-ipon-text hover:bg-white transition-all"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
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

          // Find current user's specific record for editing
          const userRecord = currentUserId 
            ? dayRecords.find((r) => r.userId === currentUserId) 
            : dayRecords[0];
          const userSaved = userRecord ? userRecord.amountSaved : 0;
          const userNote = userRecord?.note || "";

          const isDayToday = isSameDay(day, todayDate);
          const isBeforeStart = isBefore(day, chalStart);
          const isAfterEnd = chalEnd ? isAfter(day, chalEnd) : false;
          const isPast = isBefore(day, todayDate);

          // Status calculation based on pooled savings vs daily goal
          let status: "saved" | "partial" | "missed" | "planned" = "planned";

          if (totalAmountSaved >= dayDailyGoal && totalAmountSaved > 0) {
            status = "saved";
          } else if (totalAmountSaved > 0) {
            status = "partial";
          } else if (isPast && !isBeforeStart && !isAfterEnd && totalAmountSaved === 0) {
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
            ? "border-2 border-ipon-primary shadow-sm bg-ipon-light/30"
            : status === "saved"
            ? "border-emerald-100 bg-emerald-50/20 hover:border-emerald-300"
            : status === "partial"
            ? "border-amber-100 bg-amber-50/20 hover:border-amber-300"
            : status === "missed"
            ? "border-red-100/70 bg-red-50/10 hover:border-red-200"
            : "border-ipon-border/60 bg-white hover:border-ipon-primary/40";

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr, userSaved, userNote, dayRecords)}
              className={`group relative min-h-[3.5rem] h-14 sm:h-20 p-1 sm:p-2 rounded-xl sm:rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${cardBorder}`}
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
                    <span className="flex items-center text-[8px] sm:text-[9px] font-bold text-ipon-primary bg-ipon-light px-0.5 sm:px-1 rounded">
                      <Users className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
                      {dayRecords.length}
                    </span>
                  )}
                  <span
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${statusDot} shrink-0`}
                    title={status}
                  />
                </div>
              </div>

              {/* Bottom row: Amount display */}
              <div className="w-full truncate text-[9px] sm:text-xs">
                {totalAmountSaved > 0 ? (
                  <div className="font-bold text-ipon-text flex items-center gap-0.5 truncate">
                    <span className="text-emerald-600 truncate">
                      {currencySymbol}{totalAmountSaved.toLocaleString()}
                    </span>
                    {totalAmountSaved >= dayDailyGoal && (
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0 stroke-[3]" />
                    )}
                  </div>
                ) : (
                  <div className="text-ipon-muted/80 text-[8px] sm:text-[10px] font-medium truncate">
                    {currencySymbol}{dayDailyGoal.toLocaleString()}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

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
