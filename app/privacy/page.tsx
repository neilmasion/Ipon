"use client";

import Link from "next/link";
import { PiggyBank, ArrowLeft, ShieldCheck, Lock, EyeOff, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-ipon-bg py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header / Brand */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-ipon-border/80">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary border border-ipon-primary/10 group-hover:scale-105 transition-transform">
              <PiggyBank className="w-5 h-5 text-ipon-primary stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-ipon-text">Ipon</span>
              <span className="inline-block w-2 h-2 rounded-full bg-ipon-primary ml-1"></span>
            </div>
          </Link>

          <Link
            href="/"
            className="pink-soft-btn px-4 py-2 rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to App</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-ipon-border/80 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-ipon-light text-ipon-primary flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ipon-text mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-ipon-muted">
            Last updated: October 2026 • Your financial habit data is strictly private and secure.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm text-ipon-text/90 leading-relaxed">
          {/* Section 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-ipon-border/80">
            <h2 className="text-base sm:text-lg font-bold text-ipon-text mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-ipon-primary" />
              1. Information We Collect
            </h2>
            <p className="text-xs sm:text-sm text-ipon-muted mb-3">
              We collect minimal information necessary to deliver a simple, private daily saving tracker:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-ipon-muted pl-2">
              <li><strong className="text-ipon-text">Account Information:</strong> Your name, email address, and encrypted password hash (via bcrypt). We never store raw passwords.</li>
              <li><strong className="text-ipon-text">Savings Activity:</strong> Your chosen Ipon Challenges, target amounts, daily goals, and individual date entries you log.</li>
              <li><strong className="text-ipon-text">Preferences:</strong> Display currency (PHP, USD, etc.) and optional reminder settings.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-ipon-border/80">
            <h2 className="text-base sm:text-lg font-bold text-ipon-text mb-3 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-ipon-primary" />
              2. Privacy & Data Separation
            </h2>
            <p className="text-xs sm:text-sm text-ipon-muted mb-3">
              Each user's savings data is strictly isolated in our database:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-ipon-muted pl-2">
              <li><strong className="text-ipon-text">Personal Challenges:</strong> Visible only to your authenticated account.</li>
              <li><strong className="text-ipon-text">Collaborative Challenges:</strong> If you intentionally create or join a shared challenge via invite code, only members of that specific challenge can see collective progress and contributor breakdowns.</li>
              <li><strong className="text-ipon-text">No Data Selling:</strong> We do not sell, rent, monetize, or share your personal savings information with advertisers or data brokers.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-ipon-border/80">
            <h2 className="text-base sm:text-lg font-bold text-ipon-text mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-ipon-primary" />
              3. Cookies and Storage
            </h2>
            <p className="text-xs sm:text-sm text-ipon-muted mb-2">
              We use strictly necessary authentication cookies (<code className="bg-ipon-light text-ipon-primary px-1.5 py-0.5 rounded text-xs">ipon_token</code>) secured with <code className="text-xs">HttpOnly</code>, <code className="text-xs">SameSite=Lax</code>, and <code className="text-xs">Secure</code> flags.
            </p>
            <p className="text-xs sm:text-sm text-ipon-muted">
              These cookies enable secure session persistence and safeguard against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-ipon-border/80">
            <h2 className="text-base sm:text-lg font-bold text-ipon-text mb-3">
              4. Data Deletion & Rights
            </h2>
            <p className="text-xs sm:text-sm text-ipon-muted">
              You maintain full ownership of your data. You may edit or delete individual savings logs, challenges, or update your profile at any time through the app interface.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-ipon-muted flex items-center justify-center gap-4">
          <Link href="/terms" className="hover:text-ipon-primary transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-ipon-primary transition-colors">
            Ipon Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
