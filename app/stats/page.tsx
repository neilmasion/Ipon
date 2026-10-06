"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";
import { formatCurrency } from "@/lib/savings-calculations";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  Flame, 
  CalendarDays, 
  TrendingUp, 
  Award, 
  Coins, 
  Sparkles 
} from "lucide-react";

export default function StatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [meRes, res] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/stats"),
        ]);

        if (meRes.status === 401 || res.status === 401) {
          router.replace("/login");
          return;
        }

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) setUser(meData.user);
        }

        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Stats load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [router]);

  const currencySymbol = stats?.currencySymbol || user?.currencySymbol || "₱";

  // Calculate highest monthly amount for clean SVG bar chart scaling
  const monthlyTrend = stats?.monthlyTrend || [];
  const maxMonthly = monthlyTrend.reduce((m: number, curr: any) => Math.max(m, curr.amount), 0) || 1000;

  if (loading) {
    return (
      <div className="min-h-screen pb-24 md:pb-12 bg-ipon-bg">
        <Navbar currencySymbol={currencySymbol} user={user} />
        <LoadingScreen message="Loading savings statistics..." subMessage="Calculating completion rates and projection dates" />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-ipon-bg">
      <Navbar currencySymbol={currencySymbol} user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-ipon-primary text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Savings Insights</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ipon-text mt-0.5">
            Statistics & Habits
          </h1>
        </div>

        {/* 5 Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {/* 1. Total Saved */}
          <div className="col-span-2 sm:col-span-1 bg-white p-4 sm:p-5 rounded-3xl shadow-soft border border-ipon-border/80 relative overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary mb-2 sm:mb-3">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs text-ipon-muted font-semibold uppercase tracking-wider block">
              Total Saved
            </span>
            <div className="text-2xl sm:text-3xl font-black text-ipon-text mt-0.5 truncate">
              {formatCurrency(stats?.totalSaved || 0, currencySymbol)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-ipon-muted mt-0.5 sm:mt-1">
              All time lifetime savings
            </p>
          </div>

          {/* 2. Saving Days */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-soft border border-ipon-border/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary mb-2 sm:mb-3">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs text-ipon-muted font-semibold uppercase tracking-wider block">
              Saving Days
            </span>
            <div className="text-xl sm:text-3xl font-black text-ipon-text mt-0.5 truncate">
              {stats?.savingDays || 0}
            </div>
            <p className="text-[10px] sm:text-[11px] text-ipon-muted mt-0.5 sm:mt-1">
              Days with savings logged
            </p>
          </div>

          {/* 3. Average Daily Saving */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-soft border border-ipon-border/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary mb-2 sm:mb-3">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs text-ipon-muted font-semibold uppercase tracking-wider block">
              Daily Average
            </span>
            <div className="text-xl sm:text-3xl font-black text-ipon-text mt-0.5 truncate">
              {formatCurrency(stats?.averageDailySaving || 0, currencySymbol)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-ipon-muted mt-0.5 sm:mt-1">
              Per active saving day
            </p>
          </div>

          {/* 4. Current Streak */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-soft border border-ipon-border/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary mb-2 sm:mb-3">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs text-ipon-muted font-semibold uppercase tracking-wider block">
              Current Streak
            </span>
            <div className="text-xl sm:text-3xl font-black text-ipon-primary mt-0.5 truncate">
              🔥 {stats?.currentStreak || 0}
            </div>
            <p className="text-[10px] sm:text-[11px] text-ipon-muted mt-0.5 sm:mt-1">
              Consecutive days
            </p>
          </div>

          {/* 5. Longest Streak */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-soft border border-ipon-border/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary mb-2 sm:mb-3">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] sm:text-xs text-ipon-muted font-semibold uppercase tracking-wider block">
              Longest Streak
            </span>
            <div className="text-xl sm:text-3xl font-black text-ipon-text mt-0.5 truncate">
              🔥 {stats?.longestStreak || 0}
            </div>
            <p className="text-[10px] sm:text-[11px] text-ipon-muted mt-0.5 sm:mt-1">
              Personal record streak
            </p>
          </div>
        </div>

        {/* Clean Monthly Savings Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-ipon-border/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ipon-text">
                Monthly Savings Trend
              </h2>
              <p className="text-xs text-ipon-muted">
                Track your discipline over time
              </p>
            </div>
            <span className="text-xs font-semibold text-ipon-primary bg-ipon-light px-3 py-1 rounded-full">
              Recent Months
            </span>
          </div>

          {monthlyTrend.length === 0 ? (
            <div className="py-12 text-center text-xs text-ipon-muted">
              No monthly activity recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-3 h-44 pt-6 px-2">
                {monthlyTrend.map((m: any, idx: number) => {
                  const heightPercent = Math.max(12, Math.round((m.amount / maxMonthly) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      {/* Hover / tooltip label */}
                      <span className="text-[10px] sm:text-xs font-bold text-ipon-text mb-1.5 opacity-80 group-hover:text-ipon-primary group-hover:scale-105 transition-all">
                        {currencySymbol}{m.amount >= 1000 ? `${(m.amount / 1000).toFixed(1)}k` : m.amount}
                      </span>
                      {/* Bar */}
                      <div
                        className="w-full max-w-[48px] bg-gradient-to-t from-ipon-primary to-pink-300 rounded-2xl group-hover:brightness-110 transition-all duration-300 shadow-sm"
                        style={{ height: `${heightPercent}%` }}
                      />
                      {/* Month label */}
                      <span className="text-[11px] font-semibold text-ipon-muted mt-2">
                        {m.month.slice(5)}/{m.month.slice(2, 4)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
