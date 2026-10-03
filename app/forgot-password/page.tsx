"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process");
      }

      setSuccessMsg(
        "A reset link has been generated! You can check your email inbox to proceed."
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ipon-bg">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-7 shadow-soft border border-ipon-border/80">
          <Link
            href="/login"
            className="text-xs font-semibold text-ipon-muted hover:text-ipon-text inline-flex items-center gap-1.5 mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>

          <h2 className="text-xl font-bold text-ipon-text mb-1">Reset Password</h2>
          <p className="text-xs text-ipon-muted mb-5">
            Enter your email to receive a password recovery link
          </p>

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-600 text-xs flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
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
                className="w-full px-3.5 py-2.5 rounded-2xl border border-ipon-border bg-ipon-bg/50 text-sm focus:outline-none focus:border-ipon-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pink-gradient-btn w-full py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-soft disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
