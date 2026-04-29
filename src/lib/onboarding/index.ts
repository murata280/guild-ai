"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "guild_onboarded";

export function useOnboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setShow(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  }

  return { show, step, next, dismiss };
}

export const STEPS = [
  "ようこそ。30秒であなたの最初の登記をご案内します。",
  "右上の「出品する」を押してください。",
  "あなたの作品を選んだら、こだわりを声で教えてください。",
  "鑑定が終わったら「お店に並べる」。完了です。",
] as const;

export type OnboardingStep = (typeof STEPS)[number];
