"use client";

import { useState, useEffect, useRef, TouchEvent } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Calendar, 
  Check, 
  ArrowRight,
  PiggyBank,
  Target
} from "lucide-react";

interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChallenge: () => void;
  userName?: string;
  currencySymbol?: string;
}

export default function OnboardingTutorialModal({
  isOpen,
  onClose,
  onStartChallenge,
  userName = "there",
  currencySymbol = "₱"
}: OnboardingTutorialModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const slides = [
    {
      badge: "Welcome 👋",
      title: "Save money every day",
      description: "Ipon helps you set aside a small amount of money each day to reach what you're saving for.",
      visual: (
        <div className="w-full h-36 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-pink-100 flex items-center justify-center text-ipon-primary border border-pink-200 shadow-sm">
            <PiggyBank className="w-10 h-10 stroke-[2.2]" />
          </div>
          <span className="mt-2 text-xs font-bold text-gray-500">Small daily savings add up fast</span>
        </div>
      ),
    },
    {
      badge: "Step 1 🎯",
      title: "Pick a goal and daily amount",
      description: "Choose what you want to save for (like a new phone or emergency fund) and how much to save each day.",
      visual: (
        <div className="w-full h-36 flex items-center justify-center px-4">
          <div className="w-full max-w-[240px] bg-white rounded-2xl p-3.5 border border-pink-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-pink-100 flex items-center justify-center text-ipon-primary">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-gray-800">New Phone</span>
            </div>
            <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">Daily target:</span>
              <span className="text-sm font-extrabold text-ipon-primary">{currencySymbol}50 / day</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: "Step 2 ➕",
      title: "Tap + when you save",
      description: "Every day you put money into your savings, open the app and tap the pink + button to log it.",
      visual: (
        <div className="w-full h-36 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-ipon-primary to-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 border-2 border-white">
            <Plus className="w-7 h-7 stroke-[3]" />
          </div>
          <div className="mt-2.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>+{currencySymbol}50 saved today</span>
          </div>
        </div>
      ),
    },
    {
      badge: "Step 3 📅",
      title: "See your daily progress",
      description: "Check your calendar to see your daily streaks and how close you are to completing your goal.",
      visual: (
        <div className="w-full h-36 flex items-center justify-center px-4">
          <div className="w-full max-w-[240px] bg-white rounded-2xl p-3 border border-pink-100 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2">
              <Calendar className="w-3.5 h-3.5 text-ipon-primary" />
              <span>This Week</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400 font-semibold">{day}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i < 4 ? "bg-ipon-primary text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {i < 4 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "5"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const totalSlides = slides.length;
  const isLastSlide = currentSlide === totalSlides - 1;

  // Swipe gestures
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!touchStartX.current || !touchStartY.current) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0 && currentSlide < totalSlides - 1) {
        setCurrentSlide((prev) => prev + 1);
      } else if (diffX < 0 && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && currentSlide < totalSlides - 1) {
        setCurrentSlide((prev) => prev + 1);
      } else if (e.key === "ArrowLeft" && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentSlide, totalSlides, onClose]);

  if (!isOpen) return null;

  const current = slides[currentSlide];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="max-w-sm w-full rounded-3xl p-6 bg-white shadow-2xl border border-pink-100 relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top: Badge & Skip */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-ipon-primary bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded-full">
            {current.badge}
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
          >
            Skip
          </button>
        </div>

        {/* Visual Box */}
        <div className="bg-pink-50/40 rounded-2xl border border-pink-100/70 overflow-hidden mb-4">
          {current.visual}
        </div>

        {/* Text Section: Short, clean, zero jargon */}
        <div className="text-center min-h-[90px] flex flex-col justify-center px-1">
          <h3 className="text-lg font-black text-gray-800 tracking-tight">
            {current.title}
          </h3>
          <p className="text-xs text-gray-500 font-normal mt-1.5 leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 my-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentSlide ? "w-6 bg-ipon-primary" : "w-1.5 bg-gray-200 hover:bg-gray-300"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide((prev) => prev - 1)}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {isLastSlide ? (
            <button
              onClick={() => {
                onClose();
                onStartChallenge();
              }}
              className="flex-1 py-3 px-4 rounded-xl pink-gradient-btn font-bold text-xs sm:text-sm text-white shadow-soft inline-flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Start Saving</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentSlide((prev) => prev + 1)}
              className="flex-1 py-3 px-4 rounded-xl pink-gradient-btn font-bold text-xs sm:text-sm text-white shadow-soft inline-flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
