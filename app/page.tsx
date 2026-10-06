"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";
import AddSavingsModal from "@/components/AddSavingsModal";
import CreateChallengeModal from "@/components/CreateChallengeModal";
import InviteCollaboratorModal from "@/components/InviteCollaboratorModal";
import JoinChallengeModal from "@/components/JoinChallengeModal";
import ContributorsCard from "@/components/ContributorsCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Flame, 
  Target, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight, 
  Sparkles, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  ChevronRight,
  Award,
  Wallet,
  Clock,
  Users,
  UserPlus,
  History
} from "lucide-react";
import { formatCurrency, getTodayDateStr, calculateExpiringDate } from "@/lib/savings-calculations";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [modalDate, setModalDate] = useState(getTodayDateStr());
  const [modalAmount, setModalAmount] = useState<number | undefined>(undefined);
  const [modalDayRecords, setModalDayRecords] = useState<any[]>([]);

  const currencySymbol = user?.currencySymbol || "₱";

  const fetchData = useCallback(async () => {
    try {
      const uRes = await fetch("/api/auth/me");
      if (uRes.status === 401) {
        router.replace("/login");
        return;
      }
      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.user) setUser(uData.user);
      }

      const cRes = await fetch("/api/challenges");
      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.challenges) setChallenges(cData.challenges);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const activeChallenge = challenges[activeChallengeIndex] || challenges[0] || null;
  const stats = activeChallenge?.stats;
  const expiring = activeChallenge
    ? calculateExpiringDate(activeChallenge.startDate, activeChallenge.targetAmount, activeChallenge.dailyGoal)
    : null;

  const totalSavedAcross = challenges.reduce((acc, c) => acc + (c.stats?.totalSaved || 0), 0);
  const streak = stats?.currentStreak || 0;
  const dailyGoal = activeChallenge?.dailyGoal || 50;
  const savedToday = stats?.savedToday || 0;
  const isGoalReachedToday = savedToday >= dailyGoal;

  const handleOpenAddToday = () => {
    const today = getTodayDateStr();
    setModalDate(today);
    const todayRecords = activeChallenge?.savingsRecords?.filter((r: any) => r.date === today) || [];
    setModalDayRecords(todayRecords);
    const myTodayRecord = todayRecords.find((r: any) => r.userId === user?.id);
    setModalAmount(myTodayRecord ? myTodayRecord.amountSaved : undefined);
    setIsAddSavingsOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 md:pb-12 bg-ipon-bg">
        <Navbar currencySymbol={currencySymbol} user={user} />
        <LoadingScreen message="Loading dashboard..." subMessage="Fetching streaks and active challenges" />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-ipon-bg">
      <Navbar onOpenAddSavings={handleOpenAddToday} currencySymbol={currencySymbol} user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-ipon-muted text-xs font-semibold uppercase tracking-wider">
              <span>{getGreeting()}</span>
              <span>👋</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ipon-text mt-0.5">
              {user?.name ? `${user.name}` : "Welcome to Ipon"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsJoinOpen(true)}
              className="pink-soft-btn px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-ipon-primary/10"
              title="Join a shared challenge via invite code"
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Join Challenge</span>
            </button>

            <button
              onClick={handleOpenAddToday}
              className="pink-gradient-btn px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shadow-soft"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>Add Savings</span>
            </button>
          </div>
        </div>

        {/* If no challenge exists yet, show friendly starter banner */}
        {!loading && challenges.length === 0 && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-ipon-border text-center shadow-soft mb-8">
            <div className="w-16 h-16 rounded-3xl bg-ipon-light text-ipon-primary mx-auto flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 stroke-[2]" />
            </div>
            <h2 className="text-xl font-bold text-ipon-text mb-2">
              Start Your First Ipon Challenge
            </h2>
            <p className="text-xs sm:text-sm text-ipon-muted max-w-md mx-auto mb-6">
              Pick a small daily target like {currencySymbol}50. Build momentum, track streaks, and watch your money grow.
            </p>
            <button
              onClick={() => setIsCreateChallengeOpen(true)}
              className="pink-gradient-btn px-6 py-3 rounded-2xl text-sm font-bold shadow-soft inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Ipon Challenge</span>
            </button>
          </div>
        )}

        {/* Challenge Switcher if multiple challenges exist */}
        {challenges.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {challenges.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setActiveChallengeIndex(idx)}
                className={`px-4 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  idx === activeChallengeIndex
                    ? "bg-ipon-primary text-white shadow-soft"
                    : "bg-white text-ipon-muted border border-ipon-border hover:text-ipon-text"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Highlight Cards Grid */}
        {activeChallenge && (
          <div className="space-y-4 sm:space-y-6">
            {/* Primary Hero Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-ipon-border/80 relative overflow-hidden">
              {/* Soft pink decorative glow */}
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-ipon-light/80 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div>
                  <span className="text-xs text-ipon-muted font-semibold uppercase tracking-wider block mb-1">
                    Total Saved
                  </span>
                  <div className="text-3xl sm:text-5xl font-extrabold text-ipon-text tracking-tight truncate">
                    {formatCurrency(stats?.totalSaved || 0, currencySymbol)}
                  </div>

                  {/* Expected vs Actual status badge */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-ipon-muted">
                      Expected: {formatCurrency(stats?.expectedSavings || 0, currencySymbol)}
                    </span>
                    <span className="text-xs text-gray-300">•</span>
                    {stats?.aheadBehind >= 0 ? (
                      <span className="text-xs font-bold text-ipon-primary flex items-center gap-1 bg-ipon-light px-2.5 py-0.5 rounded-full">
                        🔥 +{formatCurrency(stats?.aheadBehind, currencySymbol)} ahead
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-full">
                        {formatCurrency(Math.abs(stats?.aheadBehind), currencySymbol)} behind
                      </span>
                    )}
                  </div>
                </div>

                {/* Streak Counter Box */}
                <div className="flex items-center gap-3 bg-ipon-light/80 border border-ipon-primary/15 rounded-3xl px-5 py-4 self-start sm:self-auto">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-ipon-primary">
                      {streak} {streak === 1 ? "Day" : "Days"}
                    </div>
                    <p className="text-[11px] font-semibold text-ipon-muted uppercase tracking-wider">
                      Saving Streak
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-grid: Today's Goal, Saved Today, Goal Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 pt-6 border-t border-ipon-border/60">
                {/* 1. Today's Goal */}
                <div className="p-4 rounded-2xl bg-ipon-bg/60 border border-ipon-border/40">
                  <span className="text-xs text-ipon-muted font-medium block mb-1">
                    Today&apos;s Goal
                  </span>
                  <div className="text-xl font-bold text-ipon-text">
                    {formatCurrency(dailyGoal, currencySymbol)}
                  </div>
                  <span className="text-[11px] text-ipon-muted mt-1 block">
                    Target to maintain streak
                  </span>
                </div>

                {/* 2. Saved Today */}
                <div className="p-4 rounded-2xl bg-ipon-bg/60 border border-ipon-border/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-ipon-muted font-medium block mb-1">
                      Saved Today
                    </span>
                    <div className="text-xl font-bold text-ipon-text flex items-center gap-1.5">
                      <span>{formatCurrency(savedToday, currencySymbol)}</span>
                      {isGoalReachedToday && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                      )}
                    </div>
                    <span className="text-[11px] text-ipon-muted mt-1 block">
                      {isGoalReachedToday ? "Target met ✅" : savedToday > 0 ? "Partially saved" : "Not yet logged"}
                    </span>
                  </div>
                  <button
                    onClick={handleOpenAddToday}
                    className="pink-soft-btn px-3 py-1.5 rounded-xl text-xs font-bold"
                  >
                    {savedToday > 0 ? "Edit" : "Log"}
                  </button>
                </div>

                {/* 3. Goal Progress */}
                <div className="p-4 rounded-2xl bg-ipon-bg/60 border border-ipon-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-ipon-muted font-medium">
                      Goal Progress
                    </span>
                    <span className="text-xs font-bold text-ipon-primary">
                      {stats?.goalProgressPercent || 0}%
                    </span>
                  </div>
                  <div className="text-sm font-bold text-ipon-text truncate">
                    {formatCurrency(stats?.totalSaved || 0, currencySymbol)} / {formatCurrency(activeChallenge.targetAmount, currencySymbol)}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-ipon-primary to-pink-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, stats?.goalProgressPercent || 0)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Expiring / Completion Date Bar */}
              <div className="mt-5 pt-4 border-t border-ipon-border/60 flex flex-wrap items-center justify-between text-xs text-ipon-muted gap-2.5">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-ipon-primary" />
                  <span>Started: <strong className="text-ipon-text">{activeChallenge.startDate}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-ipon-light/60 px-3 py-1 rounded-xl border border-ipon-primary/10">
                    <Clock className="w-3.5 h-3.5 text-ipon-primary" />
                    <span>
                      Expiring Date: <strong className="text-ipon-primary">{activeChallenge.endDate || expiring?.formattedDate}</strong>
                      {expiring && (
                        <span className="text-ipon-muted ml-1 font-medium">
                          ({expiring.daysNeeded.toLocaleString()} days total)
                        </span>
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(true)}
                    className="pink-soft-btn px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                    title="Invite partners or friends to save together"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{activeChallenge.isShared ? "Contributors" : "Invite"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contributors Card (Who Contributed) */}
            <ContributorsCard
              contributors={activeChallenge.contributors || []}
              totalSaved={stats?.totalSaved || 0}
              currencySymbol={currencySymbol}
              onOpenInvite={() => setIsInviteOpen(true)}
              isShared={activeChallenge.isShared}
            />

            {/* Quick Actions & Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Calendar Quick Entry Card */}
              <Link
                href="/calendar"
                className="bg-white rounded-3xl p-5 shadow-soft border border-ipon-border/80 hover:border-ipon-primary/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary group-hover:scale-105 transition-transform">
                    <CalendarIcon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ipon-text group-hover:text-ipon-primary transition-colors">
                      Monthly Calendar
                    </h3>
                    <p className="text-xs text-ipon-muted">
                      View all days, streak status & click to log
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-ipon-muted group-hover:text-ipon-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* History Quick Card */}
              <Link
                href="/history"
                className="bg-white rounded-3xl p-5 shadow-soft border border-ipon-border/80 hover:border-ipon-primary/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary group-hover:scale-105 transition-transform">
                    <History className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ipon-text group-hover:text-ipon-primary transition-colors">
                      Savings History
                    </h3>
                    <p className="text-xs text-ipon-muted">
                      Review previous logs & past activity
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-ipon-muted group-hover:text-ipon-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

            {/* Create Another Challenge Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setIsCreateChallengeOpen(true)}
                className="text-xs font-semibold text-ipon-muted hover:text-ipon-primary transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create another Ipon Challenge</span>
              </button>
            </div>
          </div>
        )}

        {/* Minimal Footer with Privacy & Terms */}
        <footer className="mt-10 pt-6 border-t border-ipon-border/60 text-center text-xs text-ipon-muted flex flex-wrap items-center justify-center gap-3">
          <span>Ipon © {new Date().getFullYear()}</span>
          <span>•</span>
          <Link href="/privacy" className="hover:text-ipon-primary transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-ipon-primary transition-colors">
            Terms of Service
          </Link>
        </footer>
      </main>

      {/* Modals */}
      <AddSavingsModal
        isOpen={isAddSavingsOpen}
        onClose={() => setIsAddSavingsOpen(false)}
        onSuccess={fetchData}
        challenges={challenges}
        defaultChallengeId={activeChallenge?.id}
        defaultDate={modalDate}
        defaultAmount={modalAmount}
        defaultNote=""
        currencySymbol={currencySymbol}
        dayRecords={modalDayRecords}
      />

      <CreateChallengeModal
        isOpen={isCreateChallengeOpen}
        onClose={() => setIsCreateChallengeOpen(false)}
        onSuccess={fetchData}
        currencySymbol={currencySymbol}
      />

      {/* Invite Collaborators Modal */}
      <InviteCollaboratorModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        challengeName={activeChallenge?.name || "Ipon Challenge"}
        inviteCode={activeChallenge?.inviteCode}
        contributors={activeChallenge?.contributors || []}
        currencySymbol={currencySymbol}
      />

      {/* Join Challenge Modal */}
      <JoinChallengeModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={() => fetchData()}
      />

      <BottomNav onOpenAddSavings={handleOpenAddToday} />
    </div>
  );
}
