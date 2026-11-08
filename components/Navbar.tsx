"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  CalendarDays, 
  History, 
  BarChart3, 
  Settings, 
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
  
  // Synchronize user state cleanly without SSR/client hydration mismatch
  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(!initialUser);
  const [unreadEmails, setUnreadEmails] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!initialUser && typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("ipon_user");
        if (cached) {
          setCurrentUser(JSON.parse(cached));
          setIsAuthChecking(false);
        }
      } catch {}
    }
  }, [initialUser]);

  // Fetch current user if not passed directly
  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
      setIsAuthChecking(false);
      try { sessionStorage.setItem("ipon_user", JSON.stringify(initialUser)); } catch {}
      return;
    }

    const checkUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          try { sessionStorage.setItem("ipon_user", JSON.stringify(data.user)); } catch {}
        } else if (res.status === 401) {
          setCurrentUser(null);
          try { sessionStorage.removeItem("ipon_user"); } catch {}
        }
      } catch {
        // network error, retain current state
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkUser();
  }, [initialUser]);

  // Periodic check for unread notifications (only show dot for notifications newer than last read)
  useEffect(() => {
    if (!mounted) return;

    const fetchEmailCount = async () => {
      try {
        const res = await fetch("/api/email-preview");
        if (res.ok) {
          const data = await res.json();
          const emails = data.emails || [];

          // Compare against last-read timestamp stored in localStorage
          const lastRead = localStorage.getItem("ipon_inbox_last_read") || "0";
          const unread = emails.filter(
            (e: any) => new Date(e.timestamp).getTime() > Number(lastRead)
          );
          setUnreadEmails(unread.length);
        }
      } catch {
        // silent
      }
    };
    fetchEmailCount();
    const interval = setInterval(fetchEmailCount, 15000);
    return () => clearInterval(interval);
  }, [mounted]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      try { sessionStorage.removeItem("ipon_user"); } catch {}
      setCurrentUser(null);
      window.location.href = "/login";
    } catch (err) {
      try { sessionStorage.removeItem("ipon_user"); } catch {}
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
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-2xl border-b border-pink-100/60 shadow-[0_4px_30px_rgba(255,79,129,0.04)] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 group">
          <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-ipon-text group-hover:text-ipon-primary transition-colors">Ipon</span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-ipon-primary animate-pulse"></span>
        </Link>

        {/* Desktop & iPad Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-gray-100/70 backdrop-blur-md p-1 lg:p-1.5 rounded-full border border-gray-200/50 shadow-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-5 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-white text-ipon-primary shadow-sm font-extrabold border border-pink-100"
                    : "text-gray-500 hover:text-ipon-primary hover:bg-white/80 font-semibold"
                }`}
              >
                <Icon className={`w-4 h-4 lg:w-4.5 lg:h-4.5 ${isActive ? "text-ipon-primary stroke-[2.5]" : "text-gray-400 stroke-[2]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Auth Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
          {/* Email Preview Drawer / Link */}
          <Link
            href="/inbox"
            title="Notification Inbox"
            className="relative w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-2xl text-gray-500 hover:text-ipon-primary bg-white hover:bg-pink-50 border border-gray-100 hover:border-pink-100 flex items-center justify-center transition-all shadow-sm"
          >
            <Mail className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            {unreadEmails > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-ipon-primary animate-pulse ring-2 ring-white" />
            )}
          </Link>

          {/* Auth Display: User Info & Sign Out / Sign In */}
          {!mounted ? (
            /* Match server render cleanly with placeholder skeleton until mounted to prevent hydration mismatch */
            <div className="flex items-center gap-2 pl-2">
              <div className="w-20 sm:w-24 h-8 sm:h-9 rounded-2xl bg-gray-100/60" />
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-gray-200">
              <Link
                href="/settings"
                title={`Signed in as ${currentUser.name || currentUser.email}`}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-white hover:bg-pink-50/50 border border-gray-100 hover:border-pink-200 shadow-sm transition-all"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-ipon-primary to-pink-400 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name || "User Avatar"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (currentUser.name?.[0] || currentUser.email?.[0] || "U").toUpperCase()
                  )}
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm font-bold text-gray-800 max-w-[90px] lg:max-w-[130px] truncate">
                  {currentUser.name?.split(" ")[0] || "Account"}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-100 hover:border-red-100 flex items-center justify-center transition-all shadow-sm"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </div>
          ) : isAuthChecking ? (
            /* Smooth skeleton while checking session to prevent layout shift */
            <div className="flex items-center gap-2 pl-2">
              <div className="w-20 sm:w-24 h-8 sm:h-9 rounded-2xl bg-gray-100/80 animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-2">
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-ipon-primary hover:bg-pink-50 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="pink-gradient-btn hidden sm:inline-flex px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-soft"
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
