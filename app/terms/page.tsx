"use client";

import Link from "next/link";
import { PiggyBank, ArrowLeft, FileCheck, AlertTriangle, Shield, CheckCircle2 } from "lucide-react";

export default function TermsOfServicePage() {
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
            <FileCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ipon-text mb-2">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-ipon-muted">
            Last updated: October 2026 • Please read these terms carefully before using the Ipon application.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm text-ipon-text/90 leading-relaxed">
          {/* Section 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-ipon-border/80">
            <h2 className="text-base sm:text-lg font-bold text-ipon-text mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-ipon-primary" />
              1. Acceptance of Terms
            </h2>
            <p className="text-xs sm:text-sm text-ipon-muted">
              By registering an account, logging in, or using Ipon, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the service.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-ipon-border/80">
            <h2 className="text-base sm:text-lg font-bold text-ipon-text mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              2. Financial Disclaimer & Habit Tracking
            </h2>
            <p className="text-xs sm:text-sm text-ipon-muted mb-2">
              <strong className="text-ipon-text">Ipon is a personal habit and record tracker, NOT a bank, financial custodian, or investment advisor.</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-ipon-muted pl-2">
              <li>Ipon does not custody, hold, invest, or transfer real money.</li>
              <li>Amounts logged represent user-entered tracking targets and habit milestones.</li>
              <li>You are solely responsible for managing your real-world financial accounts.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-ipon-border/80">
            <h2 className="text-base sm:text-lg font-bold text-ipon-text mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-ipon-primary" />
              3. Account Security & Responsibilities
            </h2>
            <p className="text-xs sm:text-sm text-ipon-muted mb-2">
              You agree to provide accurate registration information and keep your password confidential. You are responsible for all activities occurring under your credentials.
            </p>
            <p className="text-xs sm:text-sm text-ipon-muted">
              When sharing an Ipon Challenge invite code with others, you understand that authorized members will be able to see the savings progress logged toward that collaborative challenge.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-ipon-border/80">
            <h2 className="text-base sm:text-lg font-bold text-ipon-text mb-3">
              4. Prohibited Conduct
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-ipon-muted pl-2">
              <li>Attempting to probe, scan, or breach system vulnerabilities or rate limits.</li>
              <li>Attempting to access another user's private data or records without authorization.</li>
              <li>Using automated bots, scrapers, or excessive requests to cause denial of service.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-ipon-muted flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-ipon-primary transition-colors">
            Privacy Policy
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
