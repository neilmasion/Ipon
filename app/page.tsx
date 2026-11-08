"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import DashboardSkeleton from "@/components/DashboardSkeleton";

// Items 2 & 3: Code splitting & lazy loading modals on demand
const AddSavingsModal = dynamic(() => import("@/components/AddSavingsModal"), { ssr: false });
const CreateChallengeModal = dynamic(() => import("@/components/CreateChallengeModal"), { ssr: false });
const InviteCollaboratorModal = dynamic(() => import("@/components/InviteCollaboratorModal"), { ssr: false });
const JoinChallengeModal = dynamic(() => import("@/components/JoinChallengeModal"), { ssr: false });
const OnboardingTutorialModal = dynamic(() => import("@/components/OnboardingTutorialModal"), { ssr: false });

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  ArrowDown, 
  ArrowUp, 
  Plus, 
  ChevronLeft, 
  Check, 
  CreditCard, 
  Wallet, 
  Sparkles, 
  UserPlus, 
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  History
} from "lucide-react";
import { formatCurrency, getTodayDateStr } from "@/lib/savings-calculations";
import { format, parseISO } from "date-fns";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
  const [recentSavings, setRecentSavings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dropdown switcher & menu states
  const [isChallengeDropdownOpen, setIsChallengeDropdownOpen] = useState(false);
  const [isCardMenuOpen, setIsCardMenuOpen] = useState(false);

  // Selected Transaction for Bill Details modal (matching reference Screen 3)
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("debit");

  // Modals
  const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
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

      let fetchedChallenges: any[] = [];
      let fetchedSavings: any[] = [];
      let currentUser: any = null;

      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.user) {
          currentUser = uData.user;
          setUser(uData.user);
        }
      }

      const [cRes, sRes] = await Promise.all([
        fetch("/api/challenges"),
        fetch("/api/savings")
      ]);

      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.challenges) {
          fetchedChallenges = cData.challenges;
          setChallenges(cData.challenges);
        }
      }

      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.records) {
          fetchedSavings = sData.records;
          setRecentSavings(sData.records);
        }
      }

      // Check if new account for onboarding tutorial (only appears in new account only just once)
      if (currentUser?.id && typeof window !== "undefined") {
        const tutorialKey = `ipon_tutorial_seen_${currentUser.id}`;
        const hasSeen = localStorage.getItem(tutorialKey);
        const isNewAccount = localStorage.getItem(`ipon_new_account_${currentUser.id}`);

        if (!hasSeen) {
          // Trigger ONLY for brand new accounts (flagged upon registration or 0 challenges & 0 savings)
          const isBrandNew = isNewAccount === "true" || (fetchedChallenges.length === 0 && fetchedSavings.length === 0);
          if (isBrandNew) {
            setIsTutorialOpen(true);
          } else {
            // Existing user with prior challenges/history, mark as seen so they are never interrupted
            localStorage.setItem(tutorialKey, "true");
          }
        }
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleCloseTutorial = () => {
    if (user?.id && typeof window !== "undefined") {
      localStorage.setItem(`ipon_tutorial_seen_${user.id}`, "true");
      localStorage.removeItem(`ipon_new_account_${user.id}`);
    }
    setIsTutorialOpen(false);
  };

  const handleStartChallengeFromTutorial = () => {
    handleCloseTutorial();
    setIsCreateChallengeOpen(true);
  };

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

  // Item 8: Memoize calculations to prevent re-renders on minor state updates
  const activeChallenge = useMemo(() => {
    return challenges[activeChallengeIndex] || challenges[0] || null;
  }, [challenges, activeChallengeIndex]);

  const stats = useMemo(() => activeChallenge?.stats, [activeChallenge]);

  // Total balance: sum of what THIS user saved across all challenges
  const totalBalance = useMemo(() => {
    return challenges.length > 0 
      ? challenges.reduce((acc, c) => acc + (c.myStats?.totalSaved ?? (c.isShared ? 0 : c.stats?.totalSaved || 0)), 0)
      : 0;
  }, [challenges]);

  // Income / Saved amount
  const incomeAmount = useMemo(() => {
    if (activeChallenge?.myStats?.totalSaved !== undefined) {
      return activeChallenge.myStats.totalSaved;
    }
    return activeChallenge?.isShared ? 0 : (stats?.totalSaved ?? totalBalance);
  }, [activeChallenge, stats?.totalSaved, totalBalance]);

  // Expenses / Target
  const targetExpenseAmount = useMemo(() => {
    return activeChallenge?.dailyGoal || 50;
  }, [activeChallenge?.dailyGoal]);

  const handleOpenAddToday = () => {
    const today = getTodayDateStr();
    setModalDate(today);
    const todayRecords = activeChallenge?.savingsRecords?.filter((r: any) => r.date === today) || [];
    setModalDayRecords(todayRecords);
    const myTodayRecord = todayRecords.find((r: any) => r.userId === user?.id);
    setModalAmount(myTodayRecord ? myTodayRecord.amountSaved : undefined);
    setIsAddSavingsOpen(true);
  };

  // Format relative or standard date for transaction items
  const formatTxDate = (dateStr: string) => {
    try {
      const today = getTodayDateStr();
      if (dateStr === today) return "Today";
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = format(yesterday, "yyyy-MM-dd");
      if (dateStr === yesterdayStr) return "Yesterday";
      return format(parseISO(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  // Map real records for display
  const transactionsToDisplay = recentSavings.slice(0, 5).map((r: any, idx: number) => ({
    id: r.id,
    title: r.note || r.challenge?.name || "Savings Deposit",
    dateStr: formatTxDate(r.date),
    amount: r.amountSaved,
    isPositive: true,
    category: "savings",
    iconBg: idx % 2 === 0 ? "bg-emerald-50 text-emerald-600" : "bg-pink-50 text-[#FF4F81]",
    fee: 0,
    rawRecord: r
  }));

  const contributorsToDisplay = activeChallenge?.contributors || [];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#FFF5F8] text-ipon-text selection:bg-pink-100 selection:text-ipon-primary">
      {/* Full Website Navigation Bar */}
      <Navbar onOpenAddSavings={handleOpenAddToday} currencySymbol={currencySymbol} user={user} />

      {/* Main Website Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        
        {/* Top Header / Greeting Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-ipon-muted text-xs font-semibold uppercase tracking-wider">
              <span>{getGreeting()}</span>
              <span>👋</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-0.5">
              {user?.name || user?.email?.split("@")[0] || "Saver"}
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsJoinOpen(true)}
              className="pink-soft-btn px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-ipon-primary/15"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Join Challenge</span>
            </button>

            <button
              onClick={() => setIsCreateChallengeOpen(true)}
              className="pink-soft-btn px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-ipon-primary/15"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Challenge</span>
            </button>

            <button
              onClick={handleOpenAddToday}
              className="pink-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-soft"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Savings</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Web Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-start">
          
          {/* ============================================================ */}
          {/* LEFT COLUMN: Hero Balance Card + Transactions History        */}
          {/* ============================================================ */}
          <div className="md:col-span-7 space-y-5 lg:space-y-6">
            
            {/* HERO CARD: Styled exactly like reference card with rich pink */}
            <div className="bg-gradient-to-br from-[#D83266] to-[#C2185B] rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-pink-900/15 border border-white/15 relative overflow-hidden">
              {/* Subtle decorative curved rings from reference design */}
              <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full border-[22px] border-white/10 pointer-events-none" />
              <div className="absolute top-16 -left-20 w-80 h-80 rounded-full border-[28px] border-white/5 pointer-events-none" />

              {/* Card Header: Total Balance with Caret & Options */}
              <div className="flex items-center justify-between relative z-10">
                <button
                  type="button"
                  onClick={() => setIsChallengeDropdownOpen(!isChallengeDropdownOpen)}
                  className="flex items-center gap-1.5 text-white/90 text-xs sm:text-sm font-semibold hover:text-white transition-colors"
                >
                  <span>Total Balance</span>
                  {isChallengeDropdownOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </button>
              </div>

              {/* Switch Challenge Dropdown */}
              {isChallengeDropdownOpen && challenges.length > 0 && (
                <div className="absolute top-16 left-6 z-30 bg-white text-ipon-text rounded-2xl p-2 shadow-2xl border border-pink-100 min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-150">
                  <p className="text-[10px] uppercase font-bold text-gray-400 px-3 py-1">
                    Select Challenge
                  </p>
                  {challenges.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveChallengeIndex(idx);
                        setIsChallengeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        idx === activeChallengeIndex
                          ? "bg-pink-50 text-ipon-primary"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      {idx === activeChallengeIndex && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Big Main Balance */}
              <div className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-5 mb-2 relative z-10">
                {formatCurrency(totalBalance, currencySymbol)}
              </div>

              {/* Shared challenge pool indicator */}
              {activeChallenge?.isShared && activeChallenge?.stats?.totalSaved !== undefined && (
                <div className="text-white/90 text-xs font-semibold mb-4 relative z-10 flex flex-wrap items-center gap-1.5">
                  <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold">
                    👥 Team Pool: {formatCurrency(activeChallenge.stats.totalSaved, currencySymbol)}
                  </span>
                  <span className="text-white/60">•</span>
                  <span className="font-bold">You: {formatCurrency(incomeAmount, currencySymbol)}</span>
                  {activeChallenge.contributors
                    ?.filter((c: any) => c.userId !== user?.id)
                    .map((c: any) => (
                      <span key={c.userId} className="flex items-center gap-1">
                        <span className="text-white/60">•</span>
                        <span>{c.name.split(" ")[0]}: {formatCurrency(c.totalSaved || 0, currencySymbol)}</span>
                      </span>
                    ))}
                </div>
              )}

              {/* Bottom Row inside card: Income vs Expenses */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 relative z-10">
                {/* Income / Total Saved */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
                    <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-white/75 text-xs font-medium block leading-tight">
                      Income
                    </span>
                    <span className="text-white text-base sm:text-lg font-bold block leading-tight mt-0.5">
                      {formatCurrency(incomeAmount, currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Expenses / Target Goal */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-white/75 text-xs font-medium block leading-tight">
                      Expenses
                    </span>
                    <span className="text-white text-base sm:text-lg font-bold block leading-tight mt-0.5">
                      {formatCurrency(targetExpenseAmount, currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TRANSACTIONS HISTORY CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100/60">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Transactions History
                </h2>
                <Link 
                  href="/history" 
                  className="text-xs font-semibold text-gray-400 hover:text-ipon-primary transition-colors"
                >
                  See all
                </Link>
              </div>

              {/* List of Transactions or Clean Empty State */}
              {transactionsToDisplay.length > 0 ? (
                <div className="space-y-3">
                  {transactionsToDisplay.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer border border-transparent hover:border-gray-100"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">
                          {tx.title}
                        </h3>
                        <p className="text-xs text-gray-400 leading-tight mt-0.5">
                          {tx.dateStr}
                        </p>
                      </div>

                      {/* Amount display */}
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-bold text-emerald-500">
                          + {formatCurrency(tx.amount, currencySymbol)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <p className="text-sm font-medium text-gray-500">No transactions yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click{" "}
                    <button
                      onClick={handleOpenAddToday}
                      className="text-ipon-primary font-bold hover:underline"
                    >
                      Add Savings
                    </button>{" "}
                    to record your first deposit!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Send Again + Quick Links & Overview            */}
          {/* ============================================================ */}
          <div className="md:col-span-5 space-y-5 lg:space-y-6">
            
            {/* SEND AGAIN / CONTRIBUTORS CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100/60">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Send Again
                </h2>
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="text-xs font-semibold text-gray-400 hover:text-ipon-primary transition-colors"
                >
                  See all
                </button>
              </div>

              {/* Horizontal Avatars Row with Pink Plus Button */}
              <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
                {/* Floating Plus Button */}
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="w-12 h-12 rounded-full bg-[#E63E6F] text-white flex items-center justify-center shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-transform shrink-0"
                  title="Invite Partner"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </button>

                {/* Contributor Avatars or Empty Helper */}
                {contributorsToDisplay.length > 0 ? (
                  contributorsToDisplay.map((item: any, i: number) => {
                    const name = item.name || "Friend";
                    const firstName = name.split(" ")[0];
                    const initial = firstName[0]?.toUpperCase() || "U";
                    const bgClass = item.bg || "bg-pink-100 text-ipon-primary";

                    return (
                      <div
                        key={item.userId || i}
                        onClick={() => setIsInviteOpen(true)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-transparent group-hover:ring-ipon-primary transition-all ${bgClass}`}>
                          {initial}
                        </div>
                        <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[65px]">
                          {item.userId === user?.id ? "You" : firstName}
                        </span>
                        <span className="text-[10px] font-bold text-ipon-primary">
                          {formatCurrency(item.totalSaved || 0, currencySymbol)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-gray-400 py-2">
                    <span>Invite partners or friends to save together</span>
                  </div>
                )}
              </div>
            </div>

            {/* QUICK ACTIONS & SUMMARY CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100/60 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Quick Access
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {/* Monthly Calendar Quick Entry */}
                <Link
                  href="/calendar"
                  className="p-4 rounded-2xl bg-pink-50/50 hover:bg-pink-50 border border-pink-100/60 transition-all flex flex-col items-start gap-2 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-ipon-primary shadow-sm group-hover:scale-105 transition-transform">
                    <CalendarIcon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-gray-900 group-hover:text-ipon-primary transition-colors">
                      Calendar
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      Streak tracking
                    </p>
                  </div>
                </Link>

                {/* Analytics / Stats Quick Entry */}
                <Link
                  href="/stats"
                  className="p-4 rounded-2xl bg-pink-50/50 hover:bg-pink-50 border border-pink-100/60 transition-all flex flex-col items-start gap-2 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-ipon-primary shadow-sm group-hover:scale-105 transition-transform">
                    <BarChart3 className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-gray-900 group-hover:text-ipon-primary transition-colors">
                      Analytics
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      Savings charts
                    </p>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================ */}
        {/* SCREEN 3 MODAL: Bill Details / Transaction Details           */}
        {/* ============================================================ */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
            <div 
              className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Navigation Row: Back Arrow, Title, More options */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <h3 className="text-base font-bold text-gray-900">
                  Bill Details
                </h3>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Elevated Receipt Card */}
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                {/* Title & Date */}
                <div className="mb-4">
                  <h4 className="font-bold text-base text-gray-900">
                    {selectedTx.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedTx.dateStr}
                  </p>
                </div>

                <div className="border-t border-gray-200/60 my-3" />

                {/* Price, Fee, Total Rows */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Price</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(selectedTx.amount, currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Fee</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(selectedTx.fee || 0, currencySymbol)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200/60 pt-2 flex justify-between font-bold text-sm text-gray-900">
                    <span>Total</span>
                    <span>
                      {formatCurrency(selectedTx.amount + (selectedTx.fee || 0), currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-gray-900 mb-3">
                  Select payment method
                </h4>

                <div className="space-y-2">
                  {/* Debit Card */}
                  <div
                    onClick={() => setSelectedPaymentMethod("debit")}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedPaymentMethod === "debit"
                        ? "border-[#FF4F81] bg-pink-50/50"
                        : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-5 h-5 ${selectedPaymentMethod === "debit" ? "text-ipon-primary" : "text-gray-400"}`} />
                      <span className="text-xs font-bold text-gray-800">Debit Card</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPaymentMethod === "debit"
                        ? "border-ipon-primary"
                        : "border-gray-300"
                    }`}>
                      {selectedPaymentMethod === "debit" && (
                        <div className="w-2 h-2 rounded-full bg-ipon-primary" />
                      )}
                    </div>
                  </div>

                  {/* Paypal */}
                  <div
                    onClick={() => setSelectedPaymentMethod("paypal")}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedPaymentMethod === "paypal"
                        ? "border-[#FF4F81] bg-pink-50/50"
                        : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className={`w-5 h-5 ${selectedPaymentMethod === "paypal" ? "text-ipon-primary" : "text-gray-400"}`} />
                      <span className="text-xs font-bold text-gray-800">Paypal</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPaymentMethod === "paypal"
                        ? "border-ipon-primary"
                        : "border-gray-300"
                    }`}>
                      {selectedPaymentMethod === "paypal" && (
                        <div className="w-2 h-2 rounded-full bg-ipon-primary" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full mt-6 py-3.5 rounded-full bg-[#E63E6F] hover:bg-[#D6336C] text-white font-bold text-sm shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all"
              >
                Pay Now
              </button>
            </div>
          </div>
        )}

        {/* Existing Functional Modals */}
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

        <InviteCollaboratorModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          challengeName={activeChallenge?.name || "Ipon Challenge"}
          inviteCode={activeChallenge?.inviteCode}
          contributors={activeChallenge?.contributors || []}
          currencySymbol={currencySymbol}
        />

        <JoinChallengeModal
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
          onSuccess={() => fetchData()}
        />

        <OnboardingTutorialModal
          isOpen={isTutorialOpen}
          onClose={handleCloseTutorial}
          onStartChallenge={handleStartChallengeFromTutorial}
          userName={user?.name}
          currencySymbol={currencySymbol}
        />

      </main>

      {/* BottomNav shown only on mobile */}
      <BottomNav onOpenAddSavings={handleOpenAddToday} />
    </div>
  );
}
