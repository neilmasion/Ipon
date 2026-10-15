"use client";

import { Users, UserPlus, Award, Shield, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/savings-calculations";

export interface ContributorItem {
  userId: string;
  name: string;
  email?: string;
  totalSaved: number;
  savingDays: number;
  isOwner?: boolean;
  percentOfTotal: number;
}

interface ContributorsCardProps {
  contributors: ContributorItem[];
  totalSaved: number;
  currencySymbol?: string;
  onOpenInvite: () => void;
  isShared?: boolean;
}

export default function ContributorsCard({
  contributors = [],
  totalSaved = 0,
  currencySymbol = "₱",
  onOpenInvite,
  isShared = false,
}: ContributorsCardProps) {
  if (contributors.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-glass relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center text-ipon-primary border border-white shadow-glass-sm">
            <Users className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs sm:text-sm text-ipon-text">
                Contributors ({contributors.length})
              </h3>
              {isShared && (
                <span className="text-[9px] font-bold text-ipon-primary bg-ipon-light px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Heart className="w-2 h-2 fill-ipon-primary" />
                  <span>Shared</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-ipon-muted">
              See who contributed to this savings challenge
            </p>
          </div>
        </div>

        <button
          onClick={onOpenInvite}
          className="pink-soft-btn px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1"
        >
          <UserPlus className="w-3 h-3" />
          <span>Invite</span>
        </button>
      </div>

      {/* Progress Breakdown Bar if more than 1 contributor */}
      {contributors.length > 1 && totalSaved > 0 && (
        <div className="mb-3">
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
            {contributors.map((c, i) => {
              const colors = [
                "bg-ipon-primary",
                "bg-pink-400",
                "bg-purple-400",
                "bg-rose-400",
                "bg-amber-400",
              ];
              const color = colors[i % colors.length];
              return (
                <div
                  key={c.userId}
                  className={`h-full ${color} transition-all duration-500`}
                  style={{ width: `${c.percentOfTotal}%` }}
                  title={`${c.name}: ${c.percentOfTotal}%`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Contributors List */}
      <div className="space-y-2">
        {contributors.map((contrib, idx) => {
          const colors = [
            "text-ipon-primary bg-ipon-light border-ipon-primary/10",
            "text-purple-600 bg-purple-50 border-purple-100",
            "text-rose-600 bg-rose-50 border-rose-100",
            "text-amber-600 bg-amber-50 border-amber-100",
          ];
          const badgeColor = colors[idx % colors.length];

          return (
            <div
              key={contrib.userId}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 shadow-glass-sm hover:bg-white/85 hover:border-white transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[11px] border ${badgeColor}`}>
                  {contrib.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-ipon-text">
                      {contrib.name}
                    </span>
                    {contrib.isOwner ? (
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-ipon-primary text-white px-1.5 py-0.2 rounded">
                        Creator
                      </span>
                    ) : (
                      <span className="text-[8px] font-semibold text-ipon-muted bg-white border border-ipon-border px-1.5 py-0.2 rounded">
                        Contributor
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-ipon-muted">
                    {contrib.savingDays} {contrib.savingDays === 1 ? "day" : "days"} logged
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs sm:text-sm font-extrabold text-ipon-text block">
                  {formatCurrency(contrib.totalSaved, currencySymbol)}
                </span>
                <span className="text-[9px] font-bold text-ipon-primary">
                  {contrib.percentOfTotal}% of total
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
