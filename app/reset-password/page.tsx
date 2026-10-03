"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-7 shadow-soft border border-ipon-border/80">
      <h2 className="text-xl font-bold text-ipon-text mb-1">Set New Password</h2>
      <p className="text-xs text-ipon-muted mb-5">Choose a secure password for your account</p>

      {success && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Password changed successfully! Redirecting to login...</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-600 text-xs flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ipon-text mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-ipon-primary" />
              <span>New Password</span>
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-ipon-border bg-ipon-bg/50 text-sm focus:outline-none focus:border-ipon-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ipon-text mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-ipon-primary" />
              <span>Confirm Password</span>
            </label>
            <input
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-ipon-border bg-ipon-bg/50 text-sm focus:outline-none focus:border-ipon-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pink-gradient-btn w-full py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-soft disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ipon-bg">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
