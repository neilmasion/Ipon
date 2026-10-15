"use client";

import { useState } from "react";
import { X, Copy, Check, Users, Shield, UserPlus, Sparkles, Share2 } from "lucide-react";
import { formatCurrency } from "@/lib/savings-calculations";

interface MemberItem {
  id?: string;
  userId: string;
  name: string;
  email?: string;
  role?: string;
  isOwner?: boolean;
  totalSaved?: number;
  percentOfTotal?: number;
}

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeName: string;
  inviteCode?: string | null;
  contributors?: MemberItem[];
  currencySymbol?: string;
}

export default function InviteCollaboratorModal({
  isOpen,
  onClose,
  challengeName,
  inviteCode,
  contributors = [],
  currencySymbol = "₱",
}: InviteCollaboratorModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const code = inviteCode || "IPON-SHARED";
  const inviteUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/join?code=${code}` 
    : `http://localhost:3000/join?code=${code}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[400px] max-h-[92vh] overflow-y-auto glass-modal rounded-2xl p-4 sm:p-5 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ipon-primary via-pink-400 to-ipon-primary" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center text-ipon-primary border border-white shadow-glass-sm">
              <Users className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-ipon-text">Collaborate & Save Together</h3>
              <p className="text-[11px] text-ipon-muted">{challengeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-ipon-muted hover:text-ipon-text hover:bg-white/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Invite Code Card */}
          <div className="p-3.5 rounded-xl bg-white/70 backdrop-blur-md border border-white/90 shadow-glass-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ipon-primary block mb-0.5">
              Challenge Invite Code
            </span>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="font-mono text-lg sm:text-xl font-black text-ipon-text tracking-wider">
                {code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="pink-gradient-btn px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-soft"
              >
                {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
            <p className="text-[10px] text-ipon-muted mt-1.5">
              Share this code with your partner, friend, or roommate to save together.
            </p>
          </div>

          {/* Quick Share Link */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/70 bg-white/50 backdrop-blur-md">
            <div className="truncate pr-2">
              <span className="text-[9px] text-ipon-muted uppercase tracking-wider font-semibold block">
                Direct Invite Link
              </span>
              <span className="text-[11px] font-mono text-ipon-text truncate block">
                {inviteUrl}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="pink-soft-btn px-2.5 py-1 rounded-lg text-xs font-bold shrink-0"
            >
              {copiedLink ? "Copied" : "Copy Link"}
            </button>
          </div>

          {/* Current Participants List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-ipon-text">
                Current Contributors ({contributors.length || 1})
              </span>
              <span className="text-[10px] text-ipon-muted">Shared Pool</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {contributors.map((contrib, idx) => (
                <div
                  key={contrib.userId || idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/70 backdrop-blur-md border border-white/80 hover:border-ipon-primary/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-ipon-light flex items-center justify-center font-bold text-[11px] text-ipon-primary border border-ipon-primary/10">
                      {contrib.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-ipon-text">{contrib.name}</span>
                        {contrib.isOwner && (
                          <span className="text-[8px] font-extrabold uppercase tracking-wider bg-ipon-primary text-white px-1 py-0.2 rounded">
                            Owner
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-ipon-muted">
                        {contrib.totalSaved !== undefined 
                          ? `${formatCurrency(contrib.totalSaved, currencySymbol)} contributed` 
                          : "Participant"}
                      </span>
                    </div>
                  </div>

                  {contrib.percentOfTotal !== undefined && (
                    <div className="text-right">
                      <span className="text-xs font-black text-ipon-primary">
                        {contrib.percentOfTotal}%
                      </span>
                      <span className="block text-[8px] text-ipon-muted">of total</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Close */}
          <div className="pt-1.5">
            <button
              onClick={onClose}
              className="pink-soft-btn w-full py-2 rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
