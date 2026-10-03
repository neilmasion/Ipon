"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [challenge, setChallenge] = useState<any>(null);

  useEffect(() => {
    async function join() {
      if (!code) {
        setErrorMsg("Missing invite code.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/challenges/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode: code }),
        });

        const data = await res.json();
        if (res.ok) {
          setSuccessMsg(data.message || "Successfully joined challenge!");
          setChallenge(data.challenge);
        } else {
          setErrorMsg(data.error || "Failed to join challenge.");
        }
      } catch {
        setErrorMsg("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    join();
  }, [code]);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-soft border border-ipon-border/80 text-center">
      {loading ? (
        <div className="py-6">
          <div className="w-10 h-10 border-3 border-ipon-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-base font-bold text-ipon-text">Joining challenge...</h2>
        </div>
      ) : successMsg ? (
        <div>
          <div className="w-14 h-14 rounded-3xl bg-ipon-light text-ipon-primary mx-auto flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-ipon-text mb-1">Joined Successfully!</h2>
          <p className="text-xs text-ipon-muted mb-6">
            You can now contribute daily to this collaborative Ipon challenge together.
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
          <h2 className="text-xl font-bold text-ipon-text mb-1">Could Not Join</h2>
          <p className="text-xs text-red-600 mb-6">{errorMsg}</p>
          <Link
            href="/"
            className="pink-soft-btn px-5 py-2.5 rounded-2xl text-xs font-bold inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ipon-bg">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <JoinContent />
        </Suspense>
      </div>
    </div>
  );
}
