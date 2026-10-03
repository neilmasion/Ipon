"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError("Missing verification token.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok) {
          setSuccess(true);
        } else {
          setError(data.error || "Verification failed");
        }
      } catch (err: any) {
        setError("An error occurred during verification.");
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-soft border border-ipon-border/80 text-center">
      {loading ? (
        <div className="py-6">
          <div className="w-10 h-10 border-3 border-ipon-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-base font-bold text-ipon-text">Verifying your email...</h2>
        </div>
      ) : success ? (
        <div>
          <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-ipon-text mb-1">Email Verified!</h2>
          <p className="text-xs text-ipon-muted mb-6">
            Your account is verified. You can now track your daily ipon with full features enabled.
          </p>
          <Link
            href="/"
            className="pink-gradient-btn px-6 py-3 rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-soft"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div>
          <div className="w-14 h-14 rounded-3xl bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-ipon-text mb-1">Verification Failed</h2>
          <p className="text-xs text-red-600 mb-6">{error}</p>
          <Link
            href="/"
            className="pink-soft-btn px-5 py-2.5 rounded-2xl text-xs font-bold inline-block"
          >
            Back to Home
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ipon-bg">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
