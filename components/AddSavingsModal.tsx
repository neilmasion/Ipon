"use client";

import { useState, useEffect } from "react";
import { X, Check, Sparkles, Calendar as CalendarIcon, Tag, AlertCircle } from "lucide-react";
import { formatCurrency, getTodayDateStr } from "@/lib/savings-calculations";

interface ChallengeOption {
  id: string;
  name: string;
  dailyGoal: number;
  connectedGoalId?: string | null;
}

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  challenges: ChallengeOption[];
  defaultChallengeId?: string;
  defaultDate?: string;
  defaultAmount?: number;
  defaultNote?: string;
  currencySymbol?: string;
  dayRecords?: Array<{ user?: { name: string }; amountSaved: number; note?: string | null }>;
}

export default function AddSavingsModal({
  isOpen,
  onClose,
  onSuccess,
  challenges,
  defaultChallengeId,
  defaultDate,
  defaultAmount,
  defaultNote,
  currencySymbol = "₱",
  dayRecords = [],
}: AddSavingsModalProps) {
  const [selectedChallengeId, setSelectedChallengeId] = useState(defaultChallengeId || "");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [date, setDate] = useState(defaultDate || getTodayDateStr());
  const [amountStr, setAmountStr] = useState(defaultAmount !== undefined ? String(defaultAmount) : "");
  const [note, setNote] = useState(defaultNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (defaultChallengeId) {
      setSelectedChallengeId(defaultChallengeId);
    } else if (challenges.length > 0 && !selectedChallengeId) {
      setSelectedChallengeId(challenges[0].id);
    }
  }, [defaultChallengeId, challenges]);

  useEffect(() => {
    if (defaultDate) setDate(defaultDate);
    if (defaultAmount !== undefined) setAmountStr(String(defaultAmount));
    if (defaultNote !== undefined) setNote(defaultNote);
  }, [defaultDate, defaultAmount, defaultNote]);

  const currentChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];
  const dailyGoal = currentChallenge ? currentChallenge.dailyGoal : 50;
  const numericAmount = parseFloat(amountStr) || 0;

  // Calculate status preview
  let statusText = "";
  let statusColor = "text-ipon-muted";
  if (numericAmount > 0) {
    if (numericAmount >= dailyGoal) {
      const excess = numericAmount - dailyGoal;
      if (excess > 0) {
        statusText = `${formatCurrency(numericAmount, currencySymbol)} / ${formatCurrency(dailyGoal, currencySymbol)} • 🔥 ${formatCurrency(excess, currencySymbol)} above goal!`;
        statusColor = "text-ipon-primary font-semibold";
      } else {
        statusText = `${formatCurrency(numericAmount, currencySymbol)} / ${formatCurrency(dailyGoal, currencySymbol)} • ✅ Goal reached`;
        statusColor = "text-emerald-600 font-semibold";
      }
    } else {
      const remaining = dailyGoal - numericAmount;
      statusText = `${formatCurrency(numericAmount, currencySymbol)} / ${formatCurrency(dailyGoal, currencySymbol)} • ${formatCurrency(remaining, currencySymbol)} remaining`;
      statusColor = "text-amber-600 font-medium";
    }
  }

  const quickPicks = [
    { label: "Goal", value: dailyGoal },
    { label: "+₱20", value: 20 },
    { label: "+₱50", value: 50 },
    { label: "+₱100", value: 100 },
    { label: "+₱500", value: 500 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!date) {
      setError("Please pick a date.");
      return;
    }

    if (isNaN(numericAmount) || numericAmount < 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: currentChallenge?.id || null,
          goalId: selectedGoalId || null,
          date,
          amountSaved: numericAmount,
          note: note.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record savings");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-ipon-border/80 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ipon-primary via-pink-400 to-ipon-primary" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-ipon-light flex items-center justify-center text-ipon-primary">
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-ipon-text">Record Savings</h3>
              <p className="text-xs text-ipon-muted">Log your actual daily saved money</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ipon-muted hover:text-ipon-text hover:bg-ipon-light/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-600 text-xs flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Challenge Selector */}
          {challenges.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-ipon-text mb-1.5">
                Ipon Challenge
              </label>
              <select
                value={selectedChallengeId}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-ipon-border bg-ipon-bg/50 text-sm focus:outline-none focus:border-ipon-primary focus:ring-2 focus:ring-ipon-primary/10 transition-all font-medium"
              >
                {challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Daily: {formatCurrency(c.dailyGoal, currencySymbol)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-ipon-text mb-1.5 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-ipon-primary" />
              <span>Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-ipon-border bg-ipon-bg/50 text-sm text-ipon-text focus:outline-none focus:border-ipon-primary focus:ring-2 focus:ring-ipon-primary/10 transition-all font-medium"
            />
          </div>

          {/* Contributor Activity on this Date */}
          {dayRecords && dayRecords.length > 0 && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-ipon-light/80 to-pink-50/50 border border-ipon-primary/15 text-xs space-y-1.5">
              <span className="font-bold text-[11px] text-ipon-primary flex items-center gap-1">
                👥 Logged by contributors on this date:
              </span>
              <div className="space-y-1">
                {dayRecords.map((r, i) => (
                  <div key={i} className="flex justify-between items-center text-ipon-text text-[11px] bg-white/70 px-2 py-1 rounded-lg">
                    <span className="font-medium">{r.user?.name || "Member"}:</span>
                    <span className="font-bold text-emerald-600">+{formatCurrency(r.amountSaved, currencySymbol)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amount Saved Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-ipon-text">
                Actual Saved
              </label>
              <span className="text-xs text-ipon-muted">
                Daily Goal: <strong className="text-ipon-text">{formatCurrency(dailyGoal, currencySymbol)}</strong>
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-ipon-primary">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-3 text-2xl font-bold rounded-2xl border border-ipon-border bg-ipon-bg/30 text-ipon-text placeholder:text-gray-300 focus:outline-none focus:border-ipon-primary focus:ring-3 focus:ring-ipon-primary/15 transition-all"
              />
            </div>

            {/* Quick Pick Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {quickPicks.map((pick, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAmountStr(String(pick.value))}
                  className="px-2.5 py-1 rounded-xl bg-ipon-light hover:bg-ipon-soft text-ipon-primary text-xs font-medium transition-colors"
                >
                  {pick.label === "Goal" ? `Exact Goal (${currencySymbol}${pick.value})` : pick.label}
                </button>
              ))}
            </div>

            {/* Dynamic Goal Feedback */}
            {statusText && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-ipon-light/60 text-xs border border-ipon-primary/10">
                <span className={statusColor}>{statusText}</span>
              </div>
            )}
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-ipon-text mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Skipped milk tea, spare coins"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl border border-ipon-border bg-ipon-bg/50 text-xs text-ipon-text focus:outline-none focus:border-ipon-primary transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="pink-gradient-btn w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-soft disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
