"use client";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

/**
 * Skeleton for History Page (matches app/history/page.tsx)
 */
export function HistorySkeleton({ currencySymbol = "₱" }: { currencySymbol?: string }) {
  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#FFF5F8] animate-in fade-in duration-200">
      <Navbar currencySymbol={currencySymbol} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="w-36 h-8 rounded-xl bg-pink-200/50 animate-pulse" />
          <div className="w-32 h-10 rounded-2xl bg-gradient-to-r from-pink-300/60 to-pink-400/60 animate-pulse" />
        </div>

        {/* 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 shadow-glass-sm animate-pulse space-y-2">
              <div className="w-24 h-3.5 rounded bg-gray-200/80" />
              <div className="w-32 h-6 rounded-lg bg-pink-200/70" />
            </div>
          ))}
        </div>

        {/* Filter Pills & Dropdown */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-20 h-8 rounded-full bg-white/80 border border-pink-100/60 animate-pulse" />
          ))}
          <div className="w-36 h-8 rounded-2xl bg-white/80 border border-pink-100/60 sm:ml-auto animate-pulse" />
        </div>

        {/* History Record Rows */}
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-3.5 sm:p-5 shadow-glass-sm flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-pink-100/80" />
                <div className="space-y-1.5">
                  <div className="w-32 sm:w-44 h-4 rounded bg-gray-200/80" />
                  <div className="w-24 h-3 rounded bg-gray-100" />
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="w-16 h-5 rounded-lg bg-pink-200/60 ml-auto" />
                <div className="w-12 h-3 rounded bg-gray-100 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

/**
 * Skeleton for Calendar Page (matches app/calendar/page.tsx)
 */
export function CalendarSkeleton({ currencySymbol = "₱" }: { currencySymbol?: string }) {
  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#FFF5F8] animate-in fade-in duration-200">
      <Navbar currencySymbol={currencySymbol} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 space-y-4">
        {/* Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-32 h-8 rounded-xl bg-pink-200/50 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="w-36 h-9 rounded-2xl bg-white/80 border border-pink-100/60 animate-pulse" />
            <div className="w-28 h-9 rounded-2xl bg-gradient-to-r from-pink-300/60 to-pink-400/60 animate-pulse" />
          </div>
        </div>

        {/* Main Calendar Card */}
        <div className="glass-card rounded-3xl p-4 sm:p-6 shadow-glass space-y-4 animate-pulse">
          {/* Month Selector Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-pink-100/60">
            <div className="w-36 h-6 rounded-lg bg-gray-200/80" />
            <div className="flex items-center gap-2">
              <div className="w-14 h-7 rounded-xl bg-pink-100/70" />
              <div className="w-7 h-7 rounded-xl bg-gray-100" />
              <div className="w-7 h-7 rounded-xl bg-gray-100" />
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="h-4 rounded bg-pink-100/60 w-6 mx-auto" />
            ))}
          </div>

          {/* 35 Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="h-14 sm:h-20 rounded-2xl bg-white/60 border border-pink-50 p-1.5 flex flex-col justify-between"
              >
                <div className="w-4 h-3 rounded bg-gray-200/70" />
                <div className="w-8 h-4 rounded-md bg-pink-100/50 mx-auto" />
              </div>
            ))}
          </div>

          {/* Footer Stats Bar */}
          <div className="pt-3 border-t border-pink-100/60 flex justify-between items-center">
            <div className="w-28 h-4 rounded bg-gray-200" />
            <div className="w-24 h-4 rounded bg-pink-200/70" />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

/**
 * Skeleton for Stats Page (matches app/stats/page.tsx)
 */
export function StatsSkeleton({ currencySymbol = "₱" }: { currencySymbol?: string }) {
  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#FFF5F8] animate-in fade-in duration-200">
      <Navbar currencySymbol={currencySymbol} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <div className="w-36 h-8 rounded-xl bg-pink-200/50 animate-pulse" />
          <div className="w-48 h-4 rounded-lg bg-gray-200/60 animate-pulse" />
        </div>

        {/* 6 Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 sm:p-5 shadow-glass-sm animate-pulse space-y-2">
              <div className="w-8 h-8 rounded-xl bg-pink-100/80 mb-1" />
              <div className="w-20 h-3 rounded bg-gray-200/70" />
              <div className="w-28 h-6 rounded-lg bg-pink-200/70" />
            </div>
          ))}
        </div>

        {/* Monthly Trend Chart Card */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-glass animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="w-32 h-5 rounded-lg bg-gray-200/80" />
            <div className="w-20 h-4 rounded bg-pink-100/70" />
          </div>
          {/* Chart Bars Placeholder */}
          <div className="h-44 sm:h-52 flex items-end justify-between gap-3 pt-6 px-4">
            {[40, 65, 85, 55, 95, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-pink-200/50 to-pink-300/70"
                  style={{ height: `${h}%` }}
                />
                <div className="w-10 h-3 rounded bg-gray-200/60" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

/**
 * Skeleton for Settings Page (matches app/settings/page.tsx)
 */
export function SettingsSkeleton({ currencySymbol = "₱" }: { currencySymbol?: string }) {
  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#FFF5F8] animate-in fade-in duration-200">
      <Navbar currencySymbol={currencySymbol} />

      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 space-y-4">
        {/* Header */}
        <div className="mb-5 space-y-1.5">
          <div className="w-24 h-3.5 rounded-full bg-pink-100 animate-pulse" />
          <div className="w-32 h-7 rounded-xl bg-pink-200/60 animate-pulse" />
        </div>

        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-glass space-y-3.5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-200 to-pink-300" />
            <div className="space-y-1.5">
              <div className="w-28 h-4 rounded bg-gray-200" />
              <div className="w-36 h-3 rounded bg-gray-100" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="w-full h-9 rounded-xl bg-white/80 border border-pink-50" />
            <div className="w-full h-9 rounded-xl bg-white/80 border border-pink-50" />
          </div>
        </div>

        {/* Currency Preference Card */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-glass space-y-3 animate-pulse">
          <div className="w-36 h-4 rounded bg-gray-200" />
          <div className="w-full h-9 rounded-xl bg-white/80 border border-pink-50" />
        </div>

        {/* Notification Settings Card */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-glass space-y-3 animate-pulse">
          <div className="w-32 h-4 rounded bg-gray-200" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <div className="w-28 h-3.5 rounded bg-gray-200/80" />
                <div className="w-9 h-5 rounded-full bg-pink-200/60" />
              </div>
            ))}
          </div>
        </div>

        {/* Security Card */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-glass space-y-3 animate-pulse">
          <div className="w-28 h-4 rounded bg-gray-200" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-9 rounded-xl bg-white/80 border border-pink-50" />
            <div className="h-9 rounded-xl bg-white/80 border border-pink-50" />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

/**
 * Skeleton for Notification Inbox (matches app/inbox/page.tsx)
 */
export function InboxSkeleton() {
  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#FFF5F8] animate-in fade-in duration-200">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1.5">
            <div className="w-28 h-3.5 rounded-full bg-pink-100 animate-pulse" />
            <div className="w-36 h-7 rounded-xl bg-pink-200/60 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-8 rounded-xl bg-gradient-to-r from-pink-300/50 to-pink-400/50 animate-pulse" />
            <div className="w-8 h-8 rounded-xl bg-white/80 border border-pink-100 animate-pulse" />
          </div>
        </div>

        {/* Notification Cards */}
        <div className="space-y-3.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-5 sm:p-6 shadow-glass space-y-3 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="w-16 h-4 rounded-full bg-pink-100" />
                  <div className="w-48 sm:w-64 h-5 rounded-lg bg-gray-200/80" />
                </div>
                <div className="w-14 h-4 rounded-full bg-gray-100" />
              </div>
              <div className="w-full h-16 rounded-2xl bg-white/60 border border-pink-50" />
              <div className="w-36 h-8 rounded-xl bg-pink-200/60" />
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
