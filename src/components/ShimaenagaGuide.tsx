"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Shimaenaga } from "@/components/Shimaenaga";

// Context-specific guide copy
const GUIDE_COPY: Record<string, string> = {
  "/bank":  "ノートをここにおいてみよう！",
  "/guild": "ためしに ちえを のこしてみよう！",
  "/jobs":  "金マークの おねがいから やってみよう！",
  "/sell":  "GitHubを えらぶだけで できるよ！",
  "/":      "まずは ちえを のこすところから はじめよう！",
};

const ERROR_COPY = "ごめんね、ちょっと まちがえちゃった";

interface ShimaenagaGuideProps {
  errorMode?: boolean;
  proMode?: boolean;
}

export function ShimaenagaGuide({ errorMode = false, proMode = false }: ShimaenagaGuideProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const copy = errorMode
    ? ERROR_COPY
    : GUIDE_COPY[pathname] ?? GUIDE_COPY["/"];

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    // ちょこんと戻る after 5s
    setTimeout(() => {
      setDismissed(false);
      setVisible(true);
    }, 5000);
  }, []);

  // Re-show on route change
  useEffect(() => {
    setVisible(true);
    setDismissed(false);
  }, [pathname]);

  // Pro mode: only show icon, suppress bubble
  if (proMode) {
    return (
      <div className="fixed bottom-20 right-4 lg:bottom-4 z-40">
        <Shimaenaga variant="wave" size="xs" mode="avatar" aria-label="シマエナガ（ステルスモード）" />
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-20 right-4 lg:bottom-4 z-40 flex flex-col items-end gap-1"
      role="status"
      aria-live="polite"
      aria-label="シマエナガガイド"
    >
      {visible && !dismissed && (
        <div className="relative max-w-[180px] animate-fade-in">
          {/* Speech bubble */}
          <div className="rounded-2xl bg-white border-2 border-[#F2DFA0] shadow-lg px-3 py-2 text-xs font-medium text-[#1A1628] leading-snug">
            {copy}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D4A437] text-white text-[10px] flex items-center justify-center hover:bg-[#B8891F] transition-colors"
              aria-label="ガイドを閉じる"
            >
              ×
            </button>
          </div>
          {/* Bubble tail */}
          <div className="ml-auto mr-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#F2DFA0]" />
        </div>
      )}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="rounded-full bg-white border-2 border-[#F2DFA0] p-1 shadow-md hover:border-[#D4A437] transition-colors"
        aria-label={visible ? "ガイドを隠す" : "ガイドを表示する"}
      >
        <Shimaenaga variant="wave" size="sm" mode="avatar" />
      </button>
    </div>
  );
}
