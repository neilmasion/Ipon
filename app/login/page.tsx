"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiggyBank, Lock, Mail, ArrowRight, AlertCircle, Sparkles, UserCheck, LogOut, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check if already authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch {
        // silent
      }
    }
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
    } catch {
      setCurrentUser(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // response was not JSON
      }

      if (!res.ok) {
        throw new Error(data?.error || `Unable to sign in (Status ${res.status}). Please check your connection or credentials.`);
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click Demo Account handler
  const handleQuickDemo = async () => {
    setError("");
    setLoading(true);
    try {
      // First try to login demo
      let res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@ipon.app", password: "password123" }),
      });

      if (!res.ok) {
        // If not exists, register demo
        res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Ipon Saver",
            email: "demo@ipon.app",
            password: "password123",
          }),
        });

        // Seed initial challenge for the demo user
        if (res.ok) {
          await fetch("/api/challenges", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "New Phone Challenge",
              startDate: "2026-10-01",
              dailyGoal: 50,
              targetAmount: 15000,
            }),
          });
        }
      }

      let data: any = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        throw new Error(data?.error || `Failed to load demo (Status ${res.status})`);
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to load demo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ipon-bg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-ipon-light mx-auto flex items-center justify-center text-ipon-primary border border-ipon-primary/10 shadow-soft mb-3">
            <PiggyBank className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-ipon-text tracking-tight">
            Ipon
          </h1>
          <p className="text-xs text-ipon-muted mt-1">
            Build your daily saving habit, one day at a time
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-7 shadow-soft border border-ipon-border/80">
          {/* Sign In / Sign Up Switcher Tabs */}
          <div className="flex rounded-2xl bg-ipon-bg p-1 border border-ipon-border/60 mb-6">
            <button
              type="button"
              className="flex-1 py-2 text-xs font-bold rounded-xl bg-white text-ipon-primary shadow-sm"
            >
              Sign In
            </button>
            <Link
              href="/register"
              className="flex-1 py-2 text-xs font-semibold rounded-xl text-ipon-muted hover:text-ipon-text text-center transition-colors"
            >
              Create Account
            </Link>
          </div>

          <h2 className="text-lg font-bold text-ipon-text mb-1">Welcome back</h2>
          <p className="text-xs text-ipon-muted mb-5">Sign in to access your savings dashboard</p>

          {currentUser && (
            <div className="mb-5 p-3.5 rounded-2xl bg-ipon-light border border-ipon-primary/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-ipon-text">
                <UserCheck className="w-4 h-4 text-ipon-primary shrink-0" />
                <span>Currently signed in as <strong className="text-ipon-primary">{currentUser.name || currentUser.email}</strong></span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/"
                  className="pink-gradient-btn px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-soft"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-ipon-muted hover:text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-600 text-xs flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ipon-text mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-ipon-primary" />
                <span>Email address</span>
              </label>
              <input
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-ipon-border bg-ipon-bg/50 text-sm focus:outline-none focus:border-ipon-primary focus:ring-2 focus:ring-ipon-primary/10 transition-all"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-ipon-text flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-ipon-primary" />
                  <span>Password</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-ipon-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-2xl border border-ipon-border bg-ipon-bg/50 text-sm focus:outline-none focus:border-ipon-primary focus:ring-2 focus:ring-ipon-primary/10 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ipon-muted hover:text-ipon-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pink-gradient-btn w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-soft disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-5 pt-5 border-t border-ipon-border/60 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={loading}
              className="pink-soft-btn w-full py-2.5 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-ipon-primary" />
              <span>Explore Instant Demo Account</span>
            </button>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-ipon-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-ipon-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
