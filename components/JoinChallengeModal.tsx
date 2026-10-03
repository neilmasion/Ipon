"use client";

import { useState } from "react";
import { X, UserPlus, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

interface JoinChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (challengeId?: string) => void;
}

export default function JoinChallengeModal({
  isOpen,
  onClose,
  onSuccess,
}: JoinChallengeModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!inviteCode.trim()) {
      setError("Please enter an invite code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/challenges/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join challenge");
      }

      setSuccessMsg(data.message || "Successfully joined challenge!");
      setTimeout(() => {
        onSuccess(data.challenge?.id);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to join challenge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-ipon-border/80 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ipon-primary via-pink-400 to-ipon-primary" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-ipon-light flex items-center justify-center text-ipon-primary">
              <UserPlus className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-ipon-text">Join Shared Challenge</h3>
              <p className="text-xs text-ipon-muted">Save together with your partner or friend</p>
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

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ipon-text mb-1.5">
              Enter Invite Code
            </label>
            <input
              type="text"
              placeholder="e.g. IPON-7K9X2B"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-3 rounded-2xl border border-ipon-border bg-ipon-bg/50 text-base font-mono font-bold tracking-wider text-ipon-text uppercase focus:outline-none focus:border-ipon-primary focus:ring-2 focus:ring-ipon-primary/10 transition-all text-center"
              autoFocus
              required
            />
            <p className="text-[11px] text-ipon-muted mt-1.5 text-center">
              Ask the challenge creator for their 6-character code.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="pink-gradient-btn w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-soft disabled:opacity-50"
            >
              <span>{loading ? "Joining..." : "Join Challenge"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
