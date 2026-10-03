"use client";

import { PiggyBank } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingScreen({
  message = "Loading your savings...",
  subMessage = "Building your habit tracker",
}: LoadingScreenProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center">
        {/* Soft pink icon card */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-ipon-light border border-ipon-primary/15 flex items-center justify-center shadow-soft">
          <PiggyBank className="w-8 h-8 sm:w-10 sm:h-10 text-ipon-primary stroke-[2.2] animate-bounce" />
        </div>

        {/* Text */}
        <h3 className="font-bold text-sm sm:text-base text-ipon-text mt-4">
          {message}
        </h3>
        {subMessage && (
          <p className="text-xs text-ipon-muted mt-1 font-medium">
            {subMessage}
          </p>
        )}

        {/* Minimal loading bar */}
        <div className="w-36 h-1.5 bg-gray-200 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-ipon-primary to-pink-400 rounded-full animate-pulse w-full" />
        </div>
      </div>
    </div>
  );
}
