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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-ipon-primary text-xs font-bold uppercase tracking-wider">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ipon-text mt-0.5">
            Settings
          </h1>
        </div>

        {statusMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-100">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 text-red-600 text-xs flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-ipon-border/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary">
                <User className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ipon-text">Profile Information</h2>
                <p className="text-xs text-ipon-muted">Your personal details</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-ipon-text mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-ipon-border bg-ipon-bg/40 text-xs sm:text-sm font-medium focus:outline-none focus:border-ipon-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ipon-text mb-1">Email</label>
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-ipon-border bg-gray-50 text-xs sm:text-sm text-ipon-muted">
                  <span>{user?.email || "user@example.com"}</span>
                  {user?.isVerified ? (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Currency Preferences */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-ipon-border/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary">
                <DollarSign className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ipon-text">Currency & Display</h2>
                <p className="text-xs text-ipon-muted">Format for savings amounts</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ipon-text mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-ipon-border bg-ipon-bg/40 text-xs sm:text-sm font-semibold text-ipon-text focus:outline-none focus:border-ipon-primary"
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
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-ipon-border/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary">
                  <Bell className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-ipon-text">Saving Reminders</h2>
                  <p className="text-xs text-ipon-muted">Keep your habit and streak alive</p>
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ipon-primary"></div>
              </label>
            </div>

            {remindersEnabled && (
              <div className="space-y-4 pt-2 border-t border-ipon-border/50">
                <div>
                  <label className="block text-xs font-semibold text-ipon-text mb-1">
                    Daily Reminder Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-3.5 py-2 rounded-2xl border border-ipon-border bg-ipon-bg/40 text-xs sm:text-sm font-medium focus:outline-none focus:border-ipon-primary"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2.5 text-xs text-ipon-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyMissed}
                      onChange={(e) => setNotifyMissed(e.target.checked)}
                      className="rounded accent-ipon-primary w-4 h-4"
                    />
                    <span>Notify for missed savings</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-ipon-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyStreak}
                      onChange={(e) => setNotifyStreak(e.target.checked)}
                      className="rounded accent-ipon-primary w-4 h-4"
                    />
                    <span>Celebrate streak milestones (🔥 7, 14, 30 days)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-ipon-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyMilestone}
                      onChange={(e) => setNotifyMilestone(e.target.checked)}
                      className="rounded accent-ipon-primary w-4 h-4"
                    />
                    <span>Goal milestone and completion alerts</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSendTestReminder}
                    className="pink-soft-btn px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Test Reminder Email</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-ipon-border/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-ipon-light flex items-center justify-center text-ipon-primary">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ipon-text">Security</h2>
                <p className="text-xs text-ipon-muted">Update your password</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ipon-text mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-ipon-border bg-ipon-bg/40 text-xs sm:text-sm focus:outline-none focus:border-ipon-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ipon-text mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-ipon-border bg-ipon-bg/40 text-xs sm:text-sm focus:outline-none focus:border-ipon-primary"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={saving}
              className="pink-gradient-btn px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-soft flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-bold text-red-500 hover:text-red-600 px-4 py-2.5 rounded-2xl hover:bg-red-50 transition-colors flex items-center gap-1.5"
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
