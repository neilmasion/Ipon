"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";
import { 
  Settings as SettingsIcon, 
  Bell, 
  User, 
  Lock, 
  LogOut, 
  Check, 
  AlertCircle, 
  DollarSign, 
  ShieldCheck, 
  Mail,
  Send
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("PHP");
  const [currencySymbol, setCurrencySymbol] = useState("₱");

  // Reminders
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [notifyMissed, setNotifyMissed] = useState(true);
  const [notifyStreak, setNotifyStreak] = useState(true);
  const [notifyMilestone, setNotifyMilestone] = useState(true);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setName(data.user?.name || "");
          setCurrency(data.user?.currency || "PHP");
          setCurrencySymbol(data.user?.currencySymbol || "₱");

          if (data.reminder) {
            setRemindersEnabled(data.reminder.enabled);
            setReminderTime(data.reminder.reminderTime || "20:00");
            setNotifyMissed(data.reminder.notifyMissed);
            setNotifyStreak(data.reminder.notifyStreak);
            setNotifyMilestone(data.reminder.notifyMilestone);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [router]);

  const handleCurrencyChange = (val: string) => {
    setCurrency(val);
    const symbols: Record<string, string> = {
      PHP: "₱",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      SGD: "S$",
    };
    setCurrencySymbol(symbols[val] || "₱");
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          currency,
          currencySymbol,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
          reminderSettings: {
            enabled: remindersEnabled,
            reminderTime,
            notifyMissed,
            notifyStreak,
            notifyMilestone,
          },
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        throw new Error(data?.error || `Failed to update settings (Status ${res.status})`);
      }

      setStatusMessage("Settings updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestReminder = async () => {
    try {
      setStatusMessage("Sending test reminder...");
      const res = await fetch("/api/email-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyGoal: 50 }),
      });
      if (res.ok) {
        setStatusMessage("Test reminder sent to your inbox! Check the ✉️ inbox icon.");
      }
    } catch {
      setErrorMessage("Failed to send test reminder");
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 md:pb-12 bg-ipon-bg">
        <Navbar currencySymbol={currencySymbol} user={user} />
        <LoadingScreen message="Loading settings..." subMessage="Fetching preferences and notification rules" />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-ipon-bg">
      <Navbar currencySymbol={currencySymbol} user={user} />

      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-ipon-primary text-[11px] font-bold uppercase tracking-wider">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-ipon-text mt-0.5">
            Settings
          </h1>
        </div>

        {statusMessage && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-100">
            <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-4">
          {/* Profile Card */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-glass">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-xl bg-white/70 border border-white/80 shadow-sm flex items-center justify-center text-ipon-primary backdrop-blur-md">
                <User className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-ipon-text">Profile Information</h2>
                <p className="text-[11px] text-ipon-muted">Your personal details</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-ipon-text mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold text-ipon-text"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ipon-text mb-1">Email</label>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl glass-subtle text-xs text-ipon-muted border border-white/60">
                  <span className="font-medium text-ipon-text/80">{user?.email || "user@example.com"}</span>
                  {user?.isVerified ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Currency Preferences */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-glass">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-xl bg-white/70 border border-white/80 shadow-sm flex items-center justify-center text-ipon-primary backdrop-blur-md">
                <DollarSign className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-ipon-text">Currency & Display</h2>
                <p className="text-[11px] text-ipon-muted">Format for savings amounts</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ipon-text mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-ipon-text"
              >
                <option value="PHP">PHP — Philippine Peso (₱)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
                <option value="JPY">JPY — Japanese Yen (¥)</option>
                <option value="CAD">CAD — Canadian Dollar (C$)</option>
                <option value="AUD">AUD — Australian Dollar (A$)</option>
                <option value="SGD">SGD — Singapore Dollar (S$)</option>
              </select>
            </div>
          </div>

          {/* Reminders & Notifications */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-glass">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/70 border border-white/80 shadow-sm flex items-center justify-center text-ipon-primary backdrop-blur-md">
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-ipon-text">Saving Reminders</h2>
                  <p className="text-[11px] text-ipon-muted">Keep your habit and streak alive</p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={remindersEnabled}
                  onChange={(e) => setRemindersEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-ipon-primary shadow-inner"></div>
              </label>
            </div>

            {remindersEnabled && (
              <div className="space-y-3 pt-2.5 border-t border-white/60">
                <div>
                  <label className="block text-[11px] font-semibold text-ipon-text mb-1">
                    Daily Reminder Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-3 py-1.5 rounded-xl glass-input text-xs font-bold text-ipon-text"
                  />
                </div>

                <div className="space-y-2 pt-0.5">
                  <label className="flex items-center gap-2 text-xs text-ipon-text cursor-pointer p-1.5 rounded-lg hover:bg-white/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyMissed}
                      onChange={(e) => setNotifyMissed(e.target.checked)}
                      className="rounded accent-ipon-primary w-3.5 h-3.5"
                    />
                    <span>Notify for missed savings</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-ipon-text cursor-pointer p-1.5 rounded-lg hover:bg-white/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyStreak}
                      onChange={(e) => setNotifyStreak(e.target.checked)}
                      className="rounded accent-ipon-primary w-3.5 h-3.5"
                    />
                    <span>Celebrate streak milestones (🔥 7, 14, 30 days)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-ipon-text cursor-pointer p-1.5 rounded-lg hover:bg-white/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyMilestone}
                      onChange={(e) => setNotifyMilestone(e.target.checked)}
                      className="rounded accent-ipon-primary w-3.5 h-3.5"
                    />
                    <span>Goal milestone and completion alerts</span>
                  </label>
                </div>

                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={handleSendTestReminder}
                    className="glass-pill px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 hover:bg-pink-500/10 text-ipon-primary transition-all border border-pink-400/20"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Test Reminder Email</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-glass">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-xl bg-white/70 border border-white/80 shadow-sm flex items-center justify-center text-ipon-primary backdrop-blur-md">
                <Lock className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-ipon-text">Security</h2>
                <p className="text-[11px] text-ipon-muted">Update your password</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-ipon-text mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold text-ipon-text"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ipon-text mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold text-ipon-text"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-1.5">
            <button
              type="submit"
              disabled={saving}
              className="pink-gradient-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-soft flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-2 rounded-xl glass-pill hover:bg-rose-500/10 border border-rose-200/50 transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </form>

        {/* Minimal Footer with Privacy & Terms */}
        <footer className="mt-10 pt-6 border-t border-ipon-border/60 text-center text-xs text-ipon-muted flex flex-wrap items-center justify-center gap-3">
          <span>Ipon © {new Date().getFullYear()}</span>
          <span>•</span>
          <Link href="/privacy" className="hover:text-ipon-primary transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-ipon-primary transition-colors">
            Terms of Service
          </Link>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
