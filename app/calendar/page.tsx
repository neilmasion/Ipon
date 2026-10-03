"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";
import CalendarView from "@/components/CalendarView";
import AddSavingsModal from "@/components/AddSavingsModal";
import CreateChallengeModal from "@/components/CreateChallengeModal";
import InviteCollaboratorModal from "@/components/InviteCollaboratorModal";
import JoinChallengeModal from "@/components/JoinChallengeModal";
import ContributorsCard from "@/components/ContributorsCard";
import { formatCurrency, getTodayDateStr } from "@/lib/savings-calculations";
import { Calendar as CalendarIcon, Sparkles, Plus, TrendingUp, ShieldCheck, Users, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");
  const [challengeDetails, setChallengeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>(undefined);
  const [selectedNote, setSelectedNote] = useState<string>("");
  const [selectedDayRecords, setSelectedDayRecords] = useState<any[]>([]);

  const currencySymbol = user?.currencySymbol || "₱";

  const loadData = useCallback(async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/challenges").then((r) => (r.ok ? r.json() : null)),
      ]);

      if (!uRes?.user) {
        router.replace("/login");
        return;
      }
      setUser(uRes.user);
      const chals = cRes?.challenges || [];
      setChallenges(chals);

      if (chals.length > 0) {
        const targetId = selectedChallengeId || chals[0].id;
        setSelectedChallengeId(targetId);
        await loadChallengeDetails(targetId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedChallengeId, router]);

  async function loadChallengeDetails(id: string) {
    try {
      const res = await fetch(`/api/challenges/${id}`);
      if (res.ok) {
        const data = await res.json();
        setChallengeDetails(data.challenge);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChallengeChange = async (id: string) => {
    setSelectedChallengeId(id);
    await loadChallengeDetails(id);
  };

  const handleDateClick = (dateStr: string, currentSaved: number, note?: string, dayRecords?: any[]) => {
    setSelectedDate(dateStr);
    setSelectedAmount(currentSaved);
    setSelectedNote(note || "");
    setSelectedDayRecords(dayRecords || []);
    setIsAddSavingsOpen(true);
  };

  const handleAddSavingsSuccess = async () => {
    if (selectedChallengeId) {
      await loadChallengeDetails(selectedChallengeId);
    }
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 md:pb-12 bg-ipon-bg">
        <Navbar currencySymbol={currencySymbol} />
        <LoadingScreen message="Loading calendar tracker..." subMessage="Synchronizing your savings checkmarks" />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-ipon-bg">
      <Navbar onOpenAddSavings={() => handleDateClick(getTodayDateStr(), 0)} currencySymbol={currencySymbol} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Page Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-ipon-primary text-xs font-bold uppercase tracking-wider">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Savings Calendar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ipon-text mt-0.5">
              Daily Tracking
            </h1>
          </div>

          {/* Action buttons & Challenge Selector */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setIsJoinOpen(true)}
              className="pink-soft-btn px-3 py-2 rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 border border-ipon-primary/10"
              title="Join a shared challenge via code"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Join</span>
            </button>

            {challenges.length > 0 && (
              <>
                <select
                  value={selectedChallengeId}
                  onChange={(e) => handleChallengeChange(e.target.value)}
                  className="flex-1 sm:flex-initial max-w-[180px] sm:max-w-xs truncate px-3 sm:px-4 py-2 rounded-2xl bg-white border border-ipon-border font-semibold text-xs text-ipon-text shadow-sm focus:outline-none focus:border-ipon-primary transition-all"
                >
                  {challenges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({currencySymbol}{c.dailyGoal}/day) {c.isShared ? "👥" : ""}
                    </option>
                  ))}
                </select>

                {challengeDetails && (
                  <button
                    onClick={() => setIsInviteOpen(true)}
                    className="pink-soft-btn p-2 rounded-2xl"
                    title="Invite partners or friends"
                  >
                    <Users className="w-4 h-4 stroke-[2]" />
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setIsCreateChallengeOpen(true)}
              className="pink-gradient-btn p-2 rounded-2xl shadow-soft"
              title="Create new challenge"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* If no challenge */}
        {!loading && challenges.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center border border-ipon-border shadow-soft">
            <h2 className="text-lg font-bold text-ipon-text mb-2">No active challenge</h2>
            <p className="text-xs text-ipon-muted mb-4">
              Create an Ipon Challenge or join an existing shared one to start logging dates.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsCreateChallengeOpen(true)}
                className="pink-gradient-btn px-5 py-2.5 rounded-2xl text-xs font-bold shadow-soft"
              >
                + Create Ipon Challenge
              </button>
              <button
                onClick={() => setIsJoinOpen(true)}
                className="pink-soft-btn px-5 py-2.5 rounded-2xl text-xs font-bold"
              >
                Join with Code
              </button>
            </div>
          </div>
        )}

        {/* Challenge Stats Summary Bar */}
        {challengeDetails && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-ipon-border/80 shadow-soft">
              <span className="text-[11px] text-ipon-muted font-medium block">Daily Target</span>
              <span className="text-lg font-bold text-ipon-text">
                {formatCurrency(challengeDetails.dailyGoal, currencySymbol)}
              </span>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-ipon-border/80 shadow-soft">
              <span className="text-[11px] text-ipon-muted font-medium block">Total Saved</span>
              <span className="text-lg font-bold text-ipon-primary">
                {formatCurrency(challengeDetails.stats?.totalSaved || 0, currencySymbol)}
              </span>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-ipon-border/80 shadow-soft">
              <span className="text-[11px] text-ipon-muted font-medium block">Current Streak</span>
              <span className="text-lg font-bold text-ipon-text flex items-center gap-1">
                <span>🔥</span>
                <span>{challengeDetails.stats?.currentStreak || 0}d</span>
              </span>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-ipon-border/80 shadow-soft">
              <span className="text-[11px] text-ipon-muted font-medium block">Target Progress</span>
              <span className="text-lg font-bold text-ipon-text">
                {challengeDetails.stats?.goalProgressPercent || 0}%
              </span>
            </div>
          </div>
        )}

        {/* Calendar View Component */}
        {challengeDetails && (
          <CalendarView
            challengeStartDate={challengeDetails.startDate}
            challengeEndDate={challengeDetails.endDate}
            dailyGoal={challengeDetails.dailyGoal}
            records={challengeDetails.savingsRecords || []}
            currentUserId={user?.id}
            onSelectDate={handleDateClick}
            currencySymbol={currencySymbol}
          />
        )}

        {/* Contributors Card */}
        {challengeDetails && (
          <ContributorsCard
            contributors={challengeDetails.contributors || []}
            totalSaved={challengeDetails.stats?.totalSaved || 0}
            currencySymbol={currencySymbol}
            onOpenInvite={() => setIsInviteOpen(true)}
            isShared={challengeDetails.isShared}
          />
        )}
      </main>

      {/* Add / Edit Savings Modal */}
      <AddSavingsModal
        isOpen={isAddSavingsOpen}
        onClose={() => setIsAddSavingsOpen(false)}
        onSuccess={handleAddSavingsSuccess}
        challenges={challenges}
        defaultChallengeId={selectedChallengeId}
        defaultDate={selectedDate}
        defaultAmount={selectedAmount}
        defaultNote={selectedNote}
        currencySymbol={currencySymbol}
        dayRecords={selectedDayRecords}
      />

      <CreateChallengeModal
        isOpen={isCreateChallengeOpen}
        onClose={() => setIsCreateChallengeOpen(false)}
        onSuccess={loadData}
        currencySymbol={currencySymbol}
      />

      {/* Invite Collaborator Modal */}
      <InviteCollaboratorModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        challengeName={challengeDetails?.name || "Ipon Challenge"}
        inviteCode={challengeDetails?.inviteCode}
        contributors={challengeDetails?.contributors || []}
        currencySymbol={currencySymbol}
      />

      {/* Join Challenge Modal */}
      <JoinChallengeModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={(newId) => {
          if (newId) setSelectedChallengeId(newId);
          loadData();
        }}
      />

      <BottomNav onOpenAddSavings={() => handleDateClick(getTodayDateStr(), 0)} />
    </div>
  );
}
