"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consented = localStorage.getItem("ipon_cookie_consent");
      if (!consented) {
        // Small delay for clean entrance animation
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage not available or blocked
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("ipon_cookie_consent", "accepted");
    } catch {}
    setVisible(false);
  };

  const handleNecessaryOnly = () => {
    try {
      localStorage.setItem("ipon_cookie_consent", "necessary_only");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="glass-modal rounded-3xl p-5 sm:p-6 shadow-glass-lg relative">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3.5 right-3.5 text-ipon-muted hover:text-ipon-text p-1.5 rounded-full hover:bg-white/60 transition-colors"
          aria-label="Close cookie banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3 mb-3.5">
          <div className="w-9 h-9 rounded-2xl bg-white/70 border border-white/80 shadow-sm flex items-center justify-center text-ipon-primary shrink-0 mt-0.5 backdrop-blur-md">
            <Cookie className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-ipon-text">
              Cookie & Privacy Notice
            </h4>
            <p className="text-[11px] sm:text-xs text-ipon-muted mt-1 leading-relaxed">
              We use strictly necessary cookies (<code className="text-[10px] bg-pink-500/10 text-ipon-primary px-1.5 py-0.5 rounded font-bold">ipon_token</code>) to keep you securely signed in. No tracking or advertising cookies are used.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/60">
          <Link
            href="/privacy"
            className="text-[11px] font-semibold text-ipon-primary hover:underline"
          >
            Learn more
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNecessaryOnly}
              className="px-3.5 py-1.5 rounded-xl glass-pill text-[11px] font-bold text-ipon-muted hover:text-ipon-text transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={handleAccept}
              className="pink-gradient-btn px-4 py-1.5 rounded-xl text-[11px] font-bold shadow-soft flex items-center gap-1"
            >
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
