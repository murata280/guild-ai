"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Rank } from "@/types";
import { Confetti } from "@/components/Confetti";
import { messages } from "@/lib/microcopy";

interface WillSignalTriggerProps {
  currentRank: Rank;
  onPromoted?: (newFloorPrice: number) => void;
  floorPrice: number;
}

type TriggerState = "idle" | "recording" | "promoting" | "done";

export function WillSignalTrigger({ currentRank, onPromoted, floorPrice }: WillSignalTriggerProps) {
  const [state, setState] = useState<TriggerState>("idle");
  const [transcript, setTranscript] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [hasSpeechApi, setHasSpeechApi] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const recogRef = useRef<unknown>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setHasSpeechApi(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);

  const startRecording = useCallback(() => {
    setState("recording");
    setSeconds(0);
    setTranscript("");
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    if (hasSpeechApi) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recog = new SR();
      recog.lang = "ja-JP";
      recog.continuous = true;
      recog.interimResults = true;
      recog.onresult = (event: Event & { results: SpeechRecognitionResultList }) => {
        const text = Array.from(event.results)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((r: any) => r[0].transcript)
          .join("");
        setTranscript(text);
      };
      recog.onerror = () => stopRecording();
      recog.start();
      recogRef.current = recog;
    }
  }, [hasSpeechApi]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recogRef.current as any)?.stop();
    setState("promoting");

    setTimeout(() => {
      setState("done");
      setShowToast(true);
      setShowConfetti(true);
      // Haptic feedback on supported devices
      navigator.vibrate?.([20, 40, 20]);
      const newPrice = Math.round(floorPrice * 1.5);
      onPromoted?.(newPrice);
      setTimeout(() => { setShowToast(false); setShowConfetti(false); }, 4000);
    }, 1200);
  }, [floorPrice, onPromoted]);

  if (currentRank !== "A" || state === "done") return null;

  const canPromote = state === "recording" && seconds >= 3;

  return (
    <>
      <Confetti active={showConfetti} duration={1400} />
      {/* Toast */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-kuroko px-6 py-3 text-white font-bold shadow-2xl animate-bounce"
        >
          🎉 {messages.rankUpToS}
        </div>
      )}

      <div className="mt-4">
        {state === "idle" && (
          <button
            type="button"
            onClick={startRecording}
            aria-label="意思を吹き込んでSランクへ昇格"
            className="w-full rounded-xl px-4 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #9B6BB5 0%, #1A6BB5 100%)" }}
          >
            ✨ 意思を吹き込んでSへ昇格 (+50% 価格)
          </button>
        )}

        {state === "recording" && (
          <div className="rounded-xl border-2 border-kaki bg-kaki/5 p-5 text-center space-y-3">
            <div
              className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl cursor-pointer"
              style={{ background: "linear-gradient(135deg, #9B6BB5 0%, #1A6BB5 100%)" }}
              onClick={canPromote ? stopRecording : undefined}
              aria-label="録音中"
            >
              <span className="animate-pulse">🎙️</span>
            </div>
            <p className="text-base font-bold text-kuroko">録音中… {seconds}秒</p>
            {transcript && <p className="text-sm text-[#3A3664] italic">「{transcript.slice(0, 80)}」</p>}
            <p className="text-xs text-[#9890A8]">
              {canPromote ? "3秒以上録音されました。ボタンを押して昇格させる" : `あと${3 - seconds}秒以上話してください`}
            </p>
            {canPromote && (
              <button
                type="button"
                onClick={stopRecording}
                aria-label="録音を完了してSランクへ昇格"
                className="btn-primary w-full !py-3"
              >
                録音完了 → Sランクへ昇格
              </button>
            )}
            <button
              type="button"
              onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setState("idle"); }}
              className="text-xs text-[#9890A8] underline"
            >
              キャンセル
            </button>
          </div>
        )}

        {state === "promoting" && (
          <div className="rounded-xl border-2 border-kaki bg-kaki/5 p-5 text-center">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl animate-spin"
              style={{ background: "linear-gradient(135deg, #9B6BB5 0%, #0FA968 100%)" }}>
              ⭐
            </div>
            <p className="mt-3 text-base font-bold text-kaki animate-pulse">Sランクへ昇格中…</p>
          </div>
        )}
      </div>
    </>
  );
}
