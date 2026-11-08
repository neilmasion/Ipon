"use client";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#FFF5F8] animate-in fade-in duration-200">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Top greeting skeleton */}
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-2">
            <div className="w-32 h-4 rounded-lg bg-pink-100/70 animate-pulse" />
            <div className="w-48 h-7 rounded-xl bg-pink-200/50 animate-pulse" />
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/70 border border-white shadow-sm animate-pulse" />
        </div>

        {/* Hero Card Skeleton */}
        <div className="w-full h-48 sm:h-56 rounded-3xl bg-gradient-to-r from-pink-200/60 via-pink-100/40 to-pink-200/60 p-6 shadow-sm animate-pulse flex flex-col justify-between mb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="w-24 h-4 rounded bg-white/60" />
              <div className="w-40 h-8 rounded-lg bg-white/80" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/60" />
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-white/50" />
            <div className="flex justify-between">
              <div className="w-20 h-3 rounded bg-white/60" />
              <div className="w-20 h-3 rounded bg-white/60" />
            </div>
          </div>
        </div>

        {/* Quick action buttons skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/80 border border-pink-100/60 p-3 flex flex-col justify-between animate-pulse">
              <div className="w-7 h-7 rounded-xl bg-pink-100" />
              <div className="w-16 h-3 rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Recent Transactions List Skeleton */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <div className="w-36 h-5 rounded-lg bg-gray-200/80 animate-pulse" />
            <div className="w-16 h-4 rounded bg-gray-100 animate-pulse" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/80 border border-white p-3.5 flex items-center justify-between shadow-sm animate-pulse">
              <div className="space-y-1.5">
                <div className="w-28 h-4 rounded bg-gray-200" />
                <div className="w-20 h-3 rounded bg-gray-100" />
              </div>
              <div className="w-16 h-5 rounded-lg bg-pink-100/70" />
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
