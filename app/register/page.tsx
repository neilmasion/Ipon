"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

    if (password.length < 8) {
      setError("Password must be at least 8 characters long for security.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your confirm password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // non-JSON response
      }

      if (!res.ok) {
        throw new Error(data?.error || `Unable to create account (Status ${res.status}). Please check your connection.`);
      }

      setSuccessInfo(
        "Account created! We've sent a 6-digit verification code to your email. Redirecting to verification..."
      );

      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass-modal rounded-3xl p-7 shadow-glass-lg relative overflow-hidden">
          {/* Sign In / Sign Up Switcher Tabs */}
          <div className="flex rounded-2xl bg-white/50 backdrop-blur-md p-1 border border-white/80 mb-6 shadow-inner">
            <Link
              href="/login"
              className="flex-1 py-2 text-xs font-semibold rounded-xl text-ipon-muted hover:text-ipon-text text-center transition-colors"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="flex-1 py-2 text-xs font-bold rounded-xl bg-white text-ipon-primary shadow-sm border border-white"
            >
              Create Account
            </button>
          </div>

          <h2 className="text-lg font-bold text-ipon-text mb-1">Create an account</h2>
          <p className="text-xs text-ipon-muted mb-5">Your savings data remains private to you</p>

          {currentUser && (
            <div className="mb-5 p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 shadow-glass-sm flex flex-col gap-2">
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
            <div className="mb-4 p-3 rounded-2xl bg-red-50/80 backdrop-blur-md text-red-600 text-xs flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successInfo && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50/80 backdrop-blur-md text-emerald-700 text-xs flex items-center gap-2 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successInfo}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ipon-text mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-ipon-primary" />
                <span>Username</span>
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ipon-text mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-ipon-primary" />
                <span>Email address</span>
              </label>
              <input
                type="email"
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ipon-text mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-ipon-primary" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-2xl glass-input text-sm font-medium"
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

            <div>
              <label className="block text-xs font-bold text-ipon-text mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-ipon-primary" />
                <span>Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  className={`w-full pl-3.5 pr-11 py-2.5 rounded-2xl glass-input text-sm font-medium ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ipon-muted hover:text-ipon-primary transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] text-red-500 font-medium mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pink-gradient-btn w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-soft disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Creating account..." : "Sign Up"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ipon-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-ipon-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
