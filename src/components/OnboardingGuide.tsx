"use client";

import { useOnboarding, STEPS } from "@/lib/onboarding";

export function OnboardingGuide() {
  const { show, step, next, dismiss } = useOnboarding();

  if (!show) return null;

  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div
      className="fixed bottom-20 right-4 z-50 w-72 sm:bottom-6 sm:right-6"
      role="dialog"
      aria-label="はじめてのご案内"
      aria-modal="false"
    >
      {/* Bubble */}
      <div className="relative rounded-2xl bg-white border border-kuroko/10 shadow-xl p-4"
           style={{ boxShadow: "0 8px 32px rgba(26,22,40,0.14)" }}>

        {/* Progress bar */}
        <div className="h-0.5 w-full rounded-full bg-kuroko/10 mb-3">
          <div
            className="h-0.5 rounded-full bg-kaki transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header row */}
        <div className="flex items-center gap-2.5 mb-2">
          {/* AI avatar */}
          <div className="w-8 h-8 rounded-full bg-kaki flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="6" r="3" fill="white" />
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-kaki">GUILD AI ガイド</p>
            <p className="text-[10px] text-[#9890A8]">ステップ {step + 1} / {STEPS.length}</p>
          </div>
          <button
            onClick={dismiss}
            aria-label="ガイドを閉じる"
            className="ml-auto text-[#9890A8] hover:text-kuroko transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-kuroko leading-relaxed mb-4">
          {STEPS[step]}
        </p>

        {/* Arrow highlight (CSS only) */}
        {step === 1 && (
          <div className="mb-3 flex items-center gap-1 text-xs text-kaki font-semibold">
            <span className="animate-bounce">↗</span>
            <span>画面右上「出品する」</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={dismiss}
            className="text-xs text-[#9890A8] hover:text-kuroko transition-colors"
          >
            あとで
          </button>
          <button
            onClick={next}
            className="ml-auto btn-primary text-xs px-4 py-2"
          >
            {isLast ? "はじめる →" : "次へ →"}
          </button>
        </div>
      </div>

      {/* Tail */}
      <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-kuroko/10 rotate-45 shadow-sm" aria-hidden />
    </div>
  );
}
