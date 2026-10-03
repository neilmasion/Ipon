"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";
import AddSavingsModal from "@/components/AddSavingsModal";
import { formatCurrency, getTodayDateStr } from "@/lib/savings-calculations";
import { useRouter } from "next/navigation";
import { 
  History as HistoryIcon, 
  Trash2, 
  Edit3, 
  Filter, 
  Calendar as CalendarIcon, 
  ArrowUpRight,
  X,
  Plus
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "month" | "year" | "challenge">("all");
  const [selectedChallengeFilter, setSelectedChallengeFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Edit record modal
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editNote, setEditNote] = useState<string>("");

  const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);

  const currencySymbol = user?.currencySymbol || "₱";

  const loadData = useCallback(async () => {
    try {
      const today = new Date();
      const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      const currentYearStr = `${today.getFullYear()}`;

      let url = "/api/savings?";
      if (activeFilter === "month") url += `month=${currentMonthStr}`;
      else if (activeFilter === "year") url += `year=${currentYearStr}`;
      else if (activeFilter === "challenge" && selectedChallengeFilter) url += `challengeId=${selectedChallengeFilter}`;

      const [uRes, sRes, cRes] = await Promise.all([
        fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
        fetch(url).then((r) => (r.ok ? r.json() : null)),
        fetch("/api/challenges").then((r) => (r.ok ? r.json() : null)),
      ]);

      if (!uRes?.user) {
        router.replace("/login");
        return;
      }
      setUser(uRes.user);
      setRecords(sRes?.records || []);
      setChallenges(cRes?.challenges || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, selectedChallengeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string, date: string, amount: number) => {
    if (!confirm(`Delete record of ${currencySymbol}${amount} on ${date}?`)) return;
    try {
      const res = await fetch(`/api/savings/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (record: any) => {
    setEditingRecord(record);
    setEditAmount(String(record.amountSaved));
    setEditNote(record.note || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      const res = await fetch(`/api/savings/${editingRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountSaved: parseFloat(editAmount),
          note: editNote.trim() || null,
        }),
      });

      if (res.ok) {
        setEditingRecord(null);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 md:pb-12 bg-ipon-bg">
        <Navbar currencySymbol={currencySymbol} />
        <LoadingScreen message="Loading savings history..." subMessage="Retrieving your past contributions" />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-ipon-bg">
      <Navbar onOpenAddSavings={() => setIsAddSavingsOpen(true)} currencySymbol={currencySymbol} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-ipon-primary text-xs font-bold uppercase tracking-wider">
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>Activity Log</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ipon-text mt-0.5">
              Savings History
            </h1>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => setIsAddSavingsOpen(true)}
            className="pink-gradient-btn px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-soft self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Savings</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => {
              setActiveFilter("all");
              setSelectedChallengeFilter("");
            }}
            className={`px-4 py-1.5 rounded-2xl text-xs font-semibold transition-all ${
              activeFilter === "all"
                ? "bg-ipon-primary text-white shadow-soft"
                : "bg-white text-ipon-muted border border-ipon-border hover:text-ipon-text"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => {
              setActiveFilter("month");
              setSelectedChallengeFilter("");
            }}
            className={`px-4 py-1.5 rounded-2xl text-xs font-semibold transition-all ${
              activeFilter === "month"
                ? "bg-ipon-primary text-white shadow-soft"
                : "bg-white text-ipon-muted border border-ipon-border hover:text-ipon-text"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => {
              setActiveFilter("year");
              setSelectedChallengeFilter("");
            }}
            className={`px-4 py-1.5 rounded-2xl text-xs font-semibold transition-all ${
              activeFilter === "year"
                ? "bg-ipon-primary text-white shadow-soft"
                : "bg-white text-ipon-muted border border-ipon-border hover:text-ipon-text"
            }`}
          >
            This Year
          </button>

          {challenges.length > 0 && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto sm:ml-auto mt-1 sm:mt-0">
              <select
                value={selectedChallengeFilter}
                onChange={(e) => {
                  setSelectedChallengeFilter(e.target.value);
                  setActiveFilter(e.target.value ? "challenge" : "all");
                }}
                className="w-full sm:w-auto px-3 py-1.5 rounded-2xl bg-white border border-ipon-border text-xs font-medium text-ipon-muted focus:text-ipon-text focus:outline-none focus:border-ipon-primary"
              >
                <option value="">Filter by Challenge...</option>
                {challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isShared ? "(Collab)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* History Records List */}
        {!loading && records.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center border border-ipon-border shadow-soft">
            <p className="text-xs text-ipon-muted mb-2">No savings records found.</p>
            <button
              onClick={() => setIsAddSavingsOpen(true)}
              className="pink-soft-btn px-4 py-2 rounded-xl text-xs font-bold"
            >
              + Log savings now
            </button>
          </div>
        )}

        <div className="space-y-2.5">
          {records.map((rec) => {
            const isMissed = rec.amountSaved === 0;
            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-soft border border-ipon-border/80 flex items-center justify-between hover:border-ipon-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    isMissed 
                      ? "bg-red-50 text-red-500" 
                      : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {isMissed ? "🔴" : "🟢"}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-ipon-text">
                      {formatDateDisplay(rec.date)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-ipon-muted">
                      {rec.challenge && (
                        <span className="font-semibold text-ipon-primary truncate max-w-[140px] sm:max-w-none">
                          {rec.challenge.name}
                        </span>
                      )}
                      {rec.challenge?.isShared && rec.user && (
                        <span className="bg-pink-50 text-ipon-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                          by {rec.user.name || rec.user.email}
                        </span>
                      )}
                      {rec.note && (
                        <span className="italic text-gray-400 truncate max-w-[120px] sm:max-w-none">“{rec.note}”</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-sm sm:text-base font-extrabold ${
                      isMissed ? "text-gray-400" : "text-emerald-600"
                    }`}>
                      {rec.amountSaved > 0 ? `+${formatCurrency(rec.amountSaved, currencySymbol)}` : "Missed"}
                    </span>
                    {rec.dailyGoal > 0 && (
                      <span className="block text-[10px] text-ipon-muted">
                        Goal: {formatCurrency(rec.dailyGoal, currencySymbol)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(rec)}
                      className="p-1.5 rounded-xl text-ipon-muted hover:text-ipon-text hover:bg-ipon-bg"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id, rec.date, rec.amountSaved)}
                      className="p-1.5 rounded-xl text-ipon-muted hover:text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-ipon-border relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-ipon-text">Edit Record</h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-ipon-muted hover:bg-ipon-light"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-ipon-text mb-1">
                  Amount Saved ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-ipon-border text-sm font-bold focus:outline-none focus:border-ipon-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ipon-text mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-ipon-border text-xs focus:outline-none focus:border-ipon-primary"
                />
              </div>

              <button
                type="submit"
                className="pink-gradient-btn w-full py-2.5 rounded-2xl text-xs font-bold mt-2 shadow-soft"
              >
                Update Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Savings Modal */}
      <AddSavingsModal
        isOpen={isAddSavingsOpen}
        onClose={() => setIsAddSavingsOpen(false)}
        onSuccess={loadData}
        challenges={challenges}
        currencySymbol={currencySymbol}
      />

      <BottomNav onOpenAddSavings={() => setIsAddSavingsOpen(true)} />
    </div>
  );
}
