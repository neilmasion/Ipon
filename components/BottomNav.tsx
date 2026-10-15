"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  CalendarDays, 
  History, 
  Settings,
  Plus
} from "lucide-react";

interface BottomNavProps {
  onOpenAddSavings?: () => void;
}

export default function BottomNav({ onOpenAddSavings }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Calendar", href: "/calendar", icon: CalendarDays },
    { label: "History", href: "/history", icon: History },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-t border-white/80 shadow-[0_-8px_32px_rgba(255,79,129,0.08)] px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-0.5 px-2.5 rounded-xl transition-all ${
                isActive ? "text-ipon-primary font-bold" : "text-ipon-muted hover:text-ipon-text"
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className={`text-[9px] mt-0.5 ${isActive ? "font-bold text-ipon-primary" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center Prominent Add Button */}
        {onOpenAddSavings && (
          <button
            onClick={onOpenAddSavings}
            className="pink-gradient-btn -mt-5 w-11 h-11 rounded-full flex items-center justify-center shadow-lg shadow-ipon-primary/35 border-3 border-white/90 backdrop-blur-md transition-transform active:scale-95"
            aria-label="Add Savings"
          >
            <Plus className="w-5 h-5 stroke-[2.8]" />
          </button>
        )}

        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-0.5 px-2.5 rounded-xl transition-all ${
                isActive ? "text-ipon-primary" : "text-ipon-muted hover:text-ipon-text"
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className={`text-[9px] mt-0.5 ${isActive ? "font-semibold text-ipon-primary" : "font-normal"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
