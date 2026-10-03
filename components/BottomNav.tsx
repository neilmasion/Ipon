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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-ipon-border/80 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-ipon-primary" : "text-ipon-muted hover:text-ipon-text"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className={`text-[10px] mt-0.5 ${isActive ? "font-semibold text-ipon-primary" : "font-normal"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center Prominent Add Button */}
        {onOpenAddSavings && (
          <button
            onClick={onOpenAddSavings}
            className="pink-gradient-btn -mt-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-ipon-primary/30 border-4 border-white transition-transform active:scale-95"
            aria-label="Add Savings"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-ipon-primary" : "text-ipon-muted hover:text-ipon-text"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className={`text-[10px] mt-0.5 ${isActive ? "font-semibold text-ipon-primary" : "font-normal"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
