"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BarChart3, 
  Wallet, 
  CalendarDays,
  Plus
} from "lucide-react";

interface BottomNavProps {
  onOpenAddSavings?: () => void;
}

export default function BottomNav({ onOpenAddSavings }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none safe-area-pb">
      <div className="w-full max-w-md bg-white border-t border-gray-100/90 shadow-[0_-6px_25px_rgba(0,0,0,0.06)] px-7 py-3 flex items-center justify-between pointer-events-auto sm:rounded-t-3xl">
        {/* Home */}
        <Link
          href="/"
          className={`p-1.5 transition-colors ${
            pathname === "/" ? "text-ipon-primary" : "text-gray-400 hover:text-gray-600"
          }`}
          aria-label="Home"
        >
          <Home className={`w-6 h-6 ${pathname === "/" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        </Link>

        {/* Calendar */}
        <Link
          href="/calendar"
          className={`p-1.5 transition-colors ${
            pathname === "/calendar" ? "text-ipon-primary" : "text-gray-400 hover:text-gray-600"
          }`}
          aria-label="Calendar"
        >
          <CalendarDays className={`w-6 h-6 ${pathname === "/calendar" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        </Link>

        {/* Center Prominent Add Button */}
        <button
          onClick={onOpenAddSavings ? onOpenAddSavings : undefined}
          className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-tr from-[#E63E6F] to-[#FF4F81] text-white flex items-center justify-center shadow-lg shadow-pink-500/40 border-4 border-white transition-transform active:scale-90 hover:scale-105 shrink-0"
          aria-label="Add Savings"
        >
          <Plus className="w-6 h-6 stroke-[2.8]" />
        </button>

        {/* Wallet / History */}
        <Link
          href="/history"
          className={`p-1.5 transition-colors ${
            pathname === "/history" ? "text-ipon-primary" : "text-gray-400 hover:text-gray-600"
          }`}
          aria-label="History"
        >
          <Wallet className={`w-6 h-6 ${pathname === "/history" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        </Link>

        {/* Stats */}
        <Link
          href="/stats"
          className={`p-1.5 transition-colors ${
            pathname === "/stats" ? "text-ipon-primary" : "text-gray-400 hover:text-gray-600"
          }`}
          aria-label="Stats"
        >
          <BarChart3 className={`w-6 h-6 ${pathname === "/stats" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        </Link>
      </div>
    </div>
  );
}
