import { PiggyBank } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-ipon-bg flex flex-col items-center justify-center p-4">
      <div className="relative flex flex-col items-center">
        {/* Soft pink glowing circle */}
        <div className="w-20 h-20 rounded-3xl bg-ipon-light border border-ipon-primary/15 flex items-center justify-center shadow-soft animate-pulse">
          <PiggyBank className="w-10 h-10 text-ipon-primary stroke-[2.2] animate-bounce" />
        </div>

        {/* Brand Text */}
        <div className="mt-4 flex items-center gap-1.5">
          <span className="font-extrabold text-xl tracking-tight text-ipon-text">Ipon</span>
          <span className="w-2 h-2 rounded-full bg-ipon-primary animate-ping" />
        </div>

        <p className="text-xs font-semibold text-ipon-muted mt-1 uppercase tracking-wider">
          Loading your savings...
        </p>

        {/* Minimal bouncing loading dots */}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="w-2 h-2 rounded-full bg-ipon-primary/80 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-ipon-primary/80 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-ipon-primary/80 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
