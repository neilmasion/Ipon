"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle, Info, Calendar, Clock, Check } from "lucide-react";
import { formatCurrency, getTodayDateStr, calculateExpiringDate } from "@/lib/savings-calculations";

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currencySymbol?: string;
}

export default function CreateChallengeModal({
  isOpen,
  onClose,
  onSuccess,
  currencySymbol = "₱",
}: CreateChallengeModalProps) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(getTodayDateStr());
  const [endDate, setEndDate] = useState("");
  const [dailyGoalStr, setDailyGoalStr] = useState("60");
  const [targetAmountStr, setTargetAmountStr] = useState("100000");
  const [isShared, setIsShared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const numericDaily = parseFloat(dailyGoalStr) || 0;
  const numericTarget = parseFloat(targetAmountStr) || 0;

  // Auto-calculated expiring date
  const expiringInfo = calculateExpiringDate(startDate, numericTarget, numericDaily);

  // Auto-fill end date if empty or if user wants it aligned
  useEffect(() => {
    if (expiringInfo && !endDate) {
      setEndDate(expiringInfo.dateStr);
    }
  }, [expiringInfo?.dateStr]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please provide a challenge name.");
      return;
    }

    if (!startDate) {
      setError("Please choose a start date.");
      return;
    }

    const dailyGoal = parseFloat(dailyGoalStr);
    const targetAmount = parseFloat(targetAmountStr);

    if (isNaN(dailyGoal) || dailyGoal <= 0) {
      setError("Please enter a valid daily goal.");
      return;
    }

    if (isNaN(targetAmount) || targetAmount <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          startDate,
          endDate: endDate || null,
          dailyGoal,
          targetAmount,
          isShared,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Failed to create challenge (Status ${res.status})`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create challenge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[420px] max-h-[92vh] overflow-y-auto glass-modal rounded-2xl p-4 sm:p-5 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ipon-primary via-pink-400 to-ipon-primary" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center text-ipon-primary border border-white shadow-glass-sm">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-ipon-text">Create Ipon Challenge</h3>
              <p className="text-[11px] text-ipon-muted">Set your daily target and start date</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-ipon-muted hover:text-ipon-text hover:bg-white/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-50/80 backdrop-blur-md text-red-600 text-xs flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Challenge Name */}
          <div>
            <label className="block text-[11px] font-bold text-ipon-text mb-1">
              Challenge Name
            </label>
            <input
              type="text"
              placeholder="e.g., New Phone, ₱50 Daily Habit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
              required
            />
          </div>

          {/* Daily Goal & Target Amount side by side */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-ipon-text mb-1">
                Daily Goal
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ipon-muted">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="50"
                  value={dailyGoalStr}
                  onChange={(e) => setDailyGoalStr(e.target.value)}
                  className="w-full pl-6 pr-2.5 py-2 rounded-xl glass-input text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ipon-text mb-1">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ipon-muted">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="15000"
                  value={targetAmountStr}
                  onChange={(e) => setTargetAmountStr(e.target.value)}
                  className="w-full pl-6 pr-2.5 py-2 rounded-xl glass-input text-xs font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-ipon-text mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-ipon-primary" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ipon-text mb-1">
                Expiring / End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs font-semibold"
              />
            </div>
          </div>

          {/* Dynamic Expiring Date Calculation Banner */}
          {expiringInfo && (
            <div className="p-3 rounded-xl bg-white/70 backdrop-blur-md border border-white/90 shadow-glass-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] font-bold text-ipon-primary">
                  <Clock className="w-3 h-3" />
                  <span>Calculated Expiring Date</span>
                </div>
                {endDate !== expiringInfo.dateStr && (
                  <button
                    type="button"
                    onClick={() => setEndDate(expiringInfo.dateStr)}
                    className="text-[9px] font-bold text-ipon-primary hover:underline flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded border border-ipon-primary/20 shadow-xs"
                  >
                    <span>Auto-apply</span>
                  </button>
                )}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-ipon-text">
                {expiringInfo.formattedDate}
              </div>
              <p className="text-[10px] text-ipon-muted leading-tight">
                At <strong className="text-ipon-text">{currencySymbol}{numericDaily}/day</strong>, you will reach <strong className="text-ipon-text">{currencySymbol}{numericTarget.toLocaleString()}</strong> in <strong className="text-ipon-primary">{expiringInfo.daysNeeded.toLocaleString()} days</strong> ({expiringInfo.years >= 1 ? `~${expiringInfo.years} years` : `~${expiringInfo.months} months`}).
              </p>
            </div>
          )}

          {/* Backdate notification badge */}
          <div className="p-2.5 rounded-xl bg-ipon-light/60 border border-ipon-primary/10 flex items-start gap-1.5 text-[10px] text-ipon-text leading-relaxed">
            <Info className="w-3 h-3 text-ipon-primary shrink-0 mt-0.5" />
            <span>
              <strong>Backdated Friendly:</strong> You can pick a past start date. Past dates simply await your manual logs.
            </span>
          </div>

          {/* Collaborative / Shared Challenge Option */}
          <div className="p-3 rounded-xl border border-white/70 bg-white/50 backdrop-blur-md">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-ipon-text block">
                  Collaborative Challenge
                </span>
                <span className="text-[10px] text-ipon-muted">
                  Generate an invite code so partners or friends can contribute together
                </span>
              </div>
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-ipon-primary shrink-0 ml-2.5"
              />
            </label>
          </div>

          {/* Submit */}
          <div className="pt-1.5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="pink-gradient-btn w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-soft disabled:opacity-50"
            >
              <span>{isSubmitting ? "Creating..." : "Create Challenge"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
