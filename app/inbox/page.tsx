"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Mail, Trash2, ExternalLink, RefreshCw, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function InboxPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/email-preview");
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleClear = async () => {
    try {
      await fetch("/api/email-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      setEmails([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendSampleReminder = async () => {
    try {
      setMsg("Sending sample reminder...");
      const res = await fetch("/api/email-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyGoal: 50 }),
      });
      if (res.ok) {
        setMsg("Reminder email generated!");
        await fetchEmails();
      }
    } catch {
      setMsg("Error triggering reminder");
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-ipon-bg">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-ipon-primary text-xs font-bold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Notification Preview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ipon-text mt-0.5">
              Email Inbox
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendSampleReminder}
              className="pink-soft-btn px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Test Reminder</span>
            </button>
            <button
              onClick={fetchEmails}
              className="p-2 rounded-xl bg-white border border-ipon-border text-ipon-muted hover:text-ipon-text"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {emails.length > 0 && (
              <button
                onClick={handleClear}
                className="p-2 rounded-xl bg-white border border-ipon-border text-ipon-muted hover:text-red-500"
                title="Clear Inbox"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {msg && (
          <div className="mb-4 p-3 rounded-2xl bg-ipon-light text-ipon-primary text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{msg}</span>
          </div>
        )}

        {emails.length === 0 && !loading && (
          <div className="bg-white rounded-3xl p-8 text-center border border-ipon-border shadow-soft">
            <Mail className="w-10 h-10 text-ipon-muted/50 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-ipon-text">No emails in inbox</h3>
            <p className="text-xs text-ipon-muted mt-1 max-w-xs mx-auto">
              Verification links, password reset links, and daily reminder emails will appear right here!
            </p>
          </div>
        )}

        <div className="space-y-3">
          {emails.map((email) => (
            <div
              key={email.id}
              className="bg-white rounded-3xl p-5 shadow-soft border border-ipon-border/80 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ipon-primary bg-ipon-light px-2.5 py-0.5 rounded-full">
                    {email.type}
                  </span>
                  <h3 className="text-sm font-bold text-ipon-text mt-1.5">
                    {email.subject}
                  </h3>
                  <p className="text-[11px] text-ipon-muted">To: {email.to}</p>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="p-3 bg-ipon-bg/60 rounded-2xl text-xs text-ipon-text whitespace-pre-wrap font-sans border border-ipon-border/40">
                {email.content}
              </div>

              {email.actionUrl && (
                <div className="pt-1">
                  <Link
                    href={email.actionUrl}
                    className="pink-gradient-btn px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-soft"
                  >
                    <span>Open Verification / Reset Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
