"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  CalendarDays, 
  History, 
  BarChart3, 
  Settings, 
  PiggyBank,
  Plus,
  Mail,
  LogOut,
  User as UserIcon,
  LogIn
} from "lucide-react";
import { useState, useEffect } from "react";

interface NavbarProps {
  onOpenAddSavings?: () => void;
  currencySymbol?: string;
  user?: any;
}

export default function Navbar({ onOpenAddSavings, currencySymbol = "₱", user: initialUser }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);
  const [unreadEmails, setUnreadEmails] = useState(0);

  // Fetch current user if not passed directly
  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
      return;
    }
    // Only check if we don't have a user yet
    if (currentUser) return;

    const checkUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        } else if (res.status === 401) {
          setCurrentUser(null);
        }
      } catch {
        // network error, retain current state
      }
    };
    checkUser();
  }, [initialUser]);

  // Periodic check for email notifications in dev/preview
  useEffect(() => {
    const fetchEmailCount = async () => {
      try {
        const res = await fetch("/api/email-preview");
        if (res.ok) {
          const data = await res.json();
          setUnreadEmails(data.emails?.length || 0);
        }
      } catch {
        // silent
      }
    };
    fetchEmailCount();
    const interval = setInterval(fetchEmailCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Calendar", href: "/calendar", icon: CalendarDays },
    { label: "History", href: "/history", icon: History },
    { label: "Stats", href: "/stats", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/75 backdrop-blur-2xl border-b border-white/70 shadow-[0_4px_30px_rgba(255,79,129,0.05)] transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-13 sm:h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center text-ipon-primary border border-white/90 shadow-glass-sm group-hover:scale-105 transition-transform duration-200">
            <PiggyBank className="w-4 h-4 text-ipon-primary stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-ipon-text">Ipon</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-ipon-primary animate-pulse"></span>
            </div>
            <p className="text-[9px] text-ipon-muted uppercase tracking-wider font-semibold -mt-1 hidden sm:block">
              Daily Savings
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/50 backdrop-blur-md p-1 rounded-full border border-white/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-200 ${
                  isActive
                    ? "bg-white/95 text-ipon-primary shadow-sm font-bold border border-white/90"
                    : "text-ipon-muted hover:text-ipon-text hover:bg-white/60 font-medium"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-ipon-primary" : "text-ipon-muted"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Auth Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Email Preview Drawer / Link */}
          <Link
            href="/inbox"
            title="Notification Inbox"
            className="relative p-1.5 sm:p-2 rounded-xl text-ipon-muted hover:text-ipon-primary bg-white/40 hover:bg-white/80 border border-white/60 transition-all shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {unreadEmails > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-ipon-primary animate-pulse" />
            )}
          </Link>

          {/* Quick Add Savings Button */}
          {onOpenAddSavings && (
            <button
              onClick={onOpenAddSavings}
              className="pink-gradient-btn flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Savings</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}

          {/* Auth Display: User Info & Sign Out / Sign In */}
          {currentUser ? (
            <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-1.5 border-l border-white/80">
              <Link
                href="/settings"
                title={`Signed in as ${currentUser.name || currentUser.email}`}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-0.5 rounded-xl bg-white/60 hover:bg-white/90 border border-white/90 shadow-glass-sm transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-ipon-primary to-pink-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm">
                  {(currentUser.name?.[0] || currentUser.email?.[0] || "U").toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-ipon-text max-w-[85px] truncate">
                  {currentUser.name?.split(" ")[0] || "Account"}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-xl text-ipon-muted hover:text-red-600 bg-white/40 hover:bg-red-50/80 border border-white/60 transition-all"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-1">
              <Link
                href="/login"
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-ipon-primary hover:bg-ipon-light transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="pink-gradient-btn hidden sm:inline-flex px-3 py-1 rounded-xl text-xs font-bold shadow-soft"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
