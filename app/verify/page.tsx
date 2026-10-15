"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  AlertCircle, 
  PiggyBank, 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  KeyRound,
  Inbox
} from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlToken = searchParams.get("token") || searchParams.get("code") || "";
  const initialEmail = searchParams.get("email") || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle URL token auto-verification
  useEffect(() => {
    if (urlToken && urlToken.trim().length === 6) {
      const parts = urlToken.trim().split("");
      setDigits(parts);
      submitVerification(urlToken.trim(), initialEmail, true);
    } else if (urlToken) {
      submitVerification(urlToken.trim(), initialEmail, true);
    }
  }, [urlToken]);

  // Auto-focus first input on mount if not auto-verifying
  useEffect(() => {
    if (!urlToken && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [urlToken]);

  const submitVerification = async (codeToVerify: string, targetEmail?: string, isAuto = false) => {
    if (isAuto) {
      setAutoVerifying(true);
    } else {
      setLoading(true);
    }
    setError("");
    setResendStatus("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToVerify,
          email: targetEmail || email || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Verification failed. Please check the 6-digit code.");
      }
    } catch {
      setError("An error occurred during verification. Please check your connection.");
    } finally {
      setLoading(false);
      setAutoVerifying(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    setError("");
    // Handle paste of multiple characters or single digit
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length > 1) {
      // Pasted a longer string
      const pastedDigits = cleaned.slice(0, 6).split("");
      const newDigits = [...digits];
      pastedDigits.forEach((char, i) => {
        newDigits[i] = char;
      });
      setDigits(newDigits);

      // Focus last filled digit or submit if all 6 filled
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (pastedDigits.length === 6) {
        submitVerification(pastedDigits.join(""), email);
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto-advance
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If 6th digit entered, auto-submit
    if (cleaned && index === 5) {
      const fullCode = newDigits.join("");
      if (fullCode.length === 6) {
        submitVerification(fullCode, email);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    submitVerification(fullCode, email);
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email address to resend the code.");
      return;
    }
    if (resendCooldown > 0) return;

    setError("");
    setResendStatus("Sending fresh 6-digit code...");

    try {
      const res = await fetch("/api/auth/verify/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus("New 6-digit code sent! Check your inbox.");
        setResendCooldown(60);
      } else {
        setError(data.error || "Failed to resend code.");
        setResendStatus("");
      }
    } catch {
      setError("Failed to resend verification code. Please try again.");
      setResendStatus("");
    }
  };

  return (
    <div className="glass-modal rounded-3xl p-6 sm:p-8 shadow-glass-lg relative overflow-hidden">
      {/* Header icon */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-3xl bg-white/80 backdrop-blur-md mx-auto flex items-center justify-center text-ipon-primary border border-white shadow-glass-sm mb-3">
          <KeyRound className="w-7 h-7 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-black text-ipon-text tracking-tight">Verify Your Account</h1>
        <p className="text-xs text-ipon-muted mt-1 max-w-xs mx-auto">
          {email ? (
            <>
              Enter the 6-digit code sent to <strong className="text-ipon-text font-bold">{email}</strong>
            </>
          ) : (
            "Enter the 6-digit verification code sent to your email."
          )}
        </p>
      </div>

      {autoVerifying ? (
        <div className="py-8 text-center">
          <div className="w-10 h-10 border-3 border-ipon-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-sm font-bold text-ipon-text">Verifying code automatically...</h2>
        </div>
      ) : success ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50/80 backdrop-blur-md text-emerald-500 mx-auto flex items-center justify-center mb-4 border border-emerald-100 shadow-glass-sm">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-black text-ipon-text mb-1">Account Verified! 🎉</h2>
          <p className="text-xs text-ipon-muted mb-6 max-w-xs mx-auto">
            Your email has been verified. You now have full access to daily savings, shared challenges, and progress trackers.
          </p>
          <Link
            href="/"
            className="pink-gradient-btn w-full py-3.5 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-2 shadow-soft"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div>
          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50/80 backdrop-blur-md border border-red-100 rounded-2xl flex items-start gap-2.5 text-red-600 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Resend Status Message */}
          {resendStatus && (
            <div className="mb-5 p-3.5 bg-emerald-50/80 backdrop-blur-md border border-emerald-100 rounded-2xl flex items-start gap-2.5 text-emerald-700 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resendStatus}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-5">
            {/* If email wasn't passed in query, provide input for it */}
            {!initialEmail && (
              <div>
                <label className="block text-xs font-bold text-ipon-text mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-ipon-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-2xl text-xs text-ipon-text font-medium"
                  />
                </div>
              </div>
            )}

            {/* 6-Digit Code Inputs */}
            <div>
              <label className="block text-xs font-bold text-ipon-text mb-2 text-center">
                6-Digit Verification Code
              </label>
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-2xl border-2 border-white/80 bg-white/60 backdrop-blur-md text-ipon-text focus:outline-none focus:border-ipon-primary focus:bg-white focus:ring-4 focus:ring-ipon-primary/10 transition-all font-mono shadow-glass-sm"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || digits.join("").length !== 6}
              className="pink-gradient-btn w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Code Section */}
          <div className="mt-6 pt-5 border-t border-ipon-border/60 text-center space-y-3">
            <p className="text-xs text-ipon-muted">
              Didn&apos;t receive the code? Check spam or resend:
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="pink-soft-btn px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
              <span>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend 6-Digit Code"}
              </span>
            </button>

            {/* In-app Dev Inbox Preview Link */}
            <div className="pt-2">
              <Link
                href="/inbox"
                className="text-[11px] text-ipon-muted hover:text-ipon-primary transition-colors inline-flex items-center gap-1"
                title="View simulated email inbox during local development"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Dev Email Inbox Preview</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer Back Link */}
      <div className="mt-6 text-center text-xs text-ipon-muted">
        <Link href="/" className="hover:text-ipon-text font-semibold transition-colors">
          Skip for now, go to Dashboard →
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ipon-bg">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="bg-white rounded-3xl p-8 text-center shadow-soft border border-ipon-border">
              <div className="w-8 h-8 border-2 border-ipon-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-ipon-muted">Loading verification...</p>
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
