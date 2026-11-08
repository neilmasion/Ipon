"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { StatsSkeleton } from "@/components/skeletons/PageSkeletons";
import AddSavingsModal from "@/components/AddSavingsModal";
import { formatCurrency } from "@/lib/savings-calculations";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  Flame, 
  CalendarDays, 
  TrendingUp, 
  Award, 
  Coins, 
  Sparkles, 
  Target 
} from "lucide-react";

export default function StatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [meRes, res, cRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/stats"),
        fetch("/api/challenges"),
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

      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.challenges) setChallenges(cData.challenges);
      }
    } catch (err) {
      console.error("Stats load error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const currencySymbol = stats?.currencySymbol || user?.currencySymbol || "₱";

  // Calculate highest monthly amount for clean SVG bar chart scaling
  const monthlyTrend = stats?.monthlyTrend || [];
  const maxMonthly = monthlyTrend.reduce((m: number, curr: any) => Math.max(m, curr.amount), 0) || 1000;

  if (loading) {
    return <StatsSkeleton currencySymbol={currencySymbol} />;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <Navbar currencySymbol={currencySymbol} user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ipon-text">
            Statistics
          </h1>
        </div>

        {/* 6 Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {/* 1. Total Saved */}
          <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-3xl shadow-glass flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center text-ipon-primary border border-white shadow-glass-sm mb-3 shrink-0">
                <Coins className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-ipon-muted font-bold uppercase tracking-wider block">
                Total Saved
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-ipon-text mt-1 truncate">
              {formatCurrency(stats?.totalSaved || 0, currencySymbol)}
            </div>
          </div>

          {/* 2. Expected to Date */}
          <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-3xl shadow-glass flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center text-ipon-primary border border-white shadow-glass-sm mb-3 shrink-0">
                <Target className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-ipon-muted font-bold uppercase tracking-wider block">
                Expected
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-ipon-text mt-1 truncate">
              {formatCurrency(stats?.totalExpectedSavings || 0, currencySymbol)}
            </div>
          </div>

          {/* 3. Saving Days */}
          <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-3xl shadow-glass flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center text-ipon-primary border border-white shadow-glass-sm mb-3 shrink-0">
                <CalendarDays className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-ipon-muted font-bold uppercase tracking-wider block">
                Saving Days
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-ipon-text mt-1 truncate">
              {stats?.savingDays || 0}
            </div>
          </div>

          {/* 4. Average Daily Saving */}
          <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-3xl shadow-glass flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center text-ipon-primary border border-white shadow-glass-sm mb-3 shrink-0">
                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-ipon-muted font-bold uppercase tracking-wider block">
                Daily Average
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-ipon-text mt-1 truncate">
              {formatCurrency(stats?.averageDailySaving || 0, currencySymbol)}
            </div>
          </div>

          {/* 5. Current Streak */}
          <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-3xl shadow-glass flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center text-ipon-primary border border-white shadow-glass-sm mb-3 shrink-0">
                <Flame className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-ipon-muted font-bold uppercase tracking-wider block">
                Current Streak
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-ipon-primary mt-1 truncate">
              🔥 {stats?.currentStreak || 0}d
            </div>
          </div>

          {/* 6. Longest Streak */}
          <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-3xl shadow-glass flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center text-ipon-primary border border-white shadow-glass-sm mb-3 shrink-0">
                <Award className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-ipon-muted font-bold uppercase tracking-wider block">
                Longest Streak
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-ipon-text mt-1 truncate">
              🔥 {stats?.longestStreak || 0}d
            </div>
          </div>
        </div>

        {/* Clean Monthly Savings Chart */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-bold text-ipon-text">
              Monthly Savings Trend
            </h2>
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

      {/* Add Savings Modal */}
      <AddSavingsModal
        isOpen={isAddSavingsOpen}
        onClose={() => setIsAddSavingsOpen(false)}
        onSuccess={loadStats}
        challenges={challenges}
        currencySymbol={currencySymbol}
      />

      <BottomNav onOpenAddSavings={() => setIsAddSavingsOpen(true)} />
    </div>
  );
}
