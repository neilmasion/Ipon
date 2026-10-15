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

      let data: any = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        throw new Error(data?.error || `Failed to join challenge (Status ${res.status})`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[380px] max-h-[92vh] overflow-y-auto glass-modal rounded-2xl p-4 sm:p-5 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ipon-primary via-pink-400 to-ipon-primary" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center text-ipon-primary border border-white shadow-glass-sm">
              <UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-ipon-text">Join Shared Challenge</h3>
              <p className="text-[11px] text-ipon-muted">Save together with your partner or friend</p>
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

        {successMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50/80 backdrop-blur-md text-emerald-700 text-xs flex items-center gap-2 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-ipon-text mb-1">
              Enter Invite Code
            </label>
            <input
              type="text"
              placeholder="e.g. IPON-7K9X2B"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm font-black tracking-wider uppercase text-center"
              autoFocus
              required
            />
            <p className="text-[10px] text-ipon-muted mt-1 text-center">
              Ask the challenge creator for their 6-character code.
            </p>
          </div>

          <div className="pt-1.5">
            <button
              type="submit"
              disabled={loading}
              className="pink-gradient-btn w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-soft disabled:opacity-50"
            >
              <span>{loading ? "Joining..." : "Join Challenge"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
