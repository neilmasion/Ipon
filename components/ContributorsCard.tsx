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
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-ipon-border/80 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm sm:text-base text-ipon-text">
                Contributors ({contributors.length})
              </h3>
              {isShared && (
                <span className="text-[10px] font-bold text-ipon-primary bg-ipon-light px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 fill-ipon-primary" />
                  <span>Shared</span>
                </span>
              )}
            </div>
            <p className="text-xs text-ipon-muted">
              See who contributed to this savings challenge
            </p>
          </div>
        </div>

        <button
          onClick={onOpenInvite}
          className="pink-soft-btn px-3 py-1.5 rounded-2xl text-xs font-bold inline-flex items-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </div>

      {/* Progress Breakdown Bar if more than 1 contributor */}
      {contributors.length > 1 && totalSaved > 0 && (
        <div className="mb-4">
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
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
      <div className="space-y-2.5">
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
              className="flex items-center justify-between p-3 rounded-2xl bg-ipon-bg/40 border border-ipon-border/60 hover:border-ipon-primary/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs border ${badgeColor}`}>
                  {contrib.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-ipon-text">
                      {contrib.name}
                    </span>
                    {contrib.isOwner ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-ipon-primary text-white px-1.5 py-0.5 rounded-md">
                        Creator
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-ipon-muted bg-white border border-ipon-border px-1.5 py-0.5 rounded-md">
                        Contributor
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-ipon-muted">
                    {contrib.savingDays} {contrib.savingDays === 1 ? "day" : "days"} logged
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm sm:text-base font-extrabold text-ipon-text block">
                  {formatCurrency(contrib.totalSaved, currencySymbol)}
                </span>
                <span className="text-[10px] font-bold text-ipon-primary">
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
