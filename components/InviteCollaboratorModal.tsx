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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-ipon-border/80 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ipon-primary via-pink-400 to-ipon-primary" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-ipon-light flex items-center justify-center text-ipon-primary">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-ipon-text">Collaborate & Save Together</h3>
              <p className="text-xs text-ipon-muted">{challengeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ipon-muted hover:text-ipon-text hover:bg-ipon-light/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Invite Code Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-ipon-light via-pink-50 to-white border border-ipon-primary/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ipon-primary block mb-1">
              Challenge Invite Code
            </span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-black text-ipon-text tracking-wider">
                {code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="pink-gradient-btn px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-soft"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
            <p className="text-[11px] text-ipon-muted mt-2">
              Share this code with your partner, friend, or roommate to save together and track who contributes.
            </p>
          </div>

          {/* Quick Share Link */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-ipon-border bg-ipon-bg/40">
            <div className="truncate pr-2">
              <span className="text-[10px] text-ipon-muted uppercase tracking-wider font-semibold block">
                Direct Invite Link
              </span>
              <span className="text-xs font-mono text-ipon-text truncate block">
                {inviteUrl}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="pink-soft-btn px-3 py-1.5 rounded-xl text-xs font-bold shrink-0"
            >
              {copiedLink ? "Copied Link" : "Copy Link"}
            </button>
          </div>

          {/* Current Participants List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ipon-text">
                Current Contributors ({contributors.length || 1})
              </span>
              <span className="text-[11px] text-ipon-muted">Shared Pool</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {contributors.map((contrib, idx) => (
                <div
                  key={contrib.userId || idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-ipon-border/70 hover:border-ipon-primary/20 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-ipon-light flex items-center justify-center font-bold text-xs text-ipon-primary border border-ipon-primary/10">
                      {contrib.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-ipon-text">{contrib.name}</span>
                        {contrib.isOwner && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider bg-ipon-primary text-white px-1.5 py-0.2 rounded-md">
                            Owner
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-ipon-muted">
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
                      <span className="block text-[9px] text-ipon-muted">of total</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Close */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="pink-soft-btn w-full py-2.5 rounded-2xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
