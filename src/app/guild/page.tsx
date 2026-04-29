"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Shimaenaga } from "@/components/Shimaenaga";
import { Confetti } from "@/components/Confetti";
import { RankBadge } from "@/components/RankBadge";
import { PassbookTable } from "@/components/PassbookTable";
import { getWeapons } from "@/lib/weapons";
import { getApplications } from "@/lib/jobs";
import { getPassbookSnapshot } from "@/lib/passbook";
import { getPassbookSnapshotAction } from "@/app/actions/passbook";
import { playPassbookChime, playSuccessChime } from "@/lib/sound";
import type { Weapon, PassbookTransaction } from "@/types";

// ─── Rank styling ─────────────────────────────────────────────────────────────

const RANK_BG: Record<string, string> = {
  S: "bg-kaki/10 border-kaki/30",
  A: "bg-zinc-100 border-zinc-300",
  B: "bg-amber-50 border-amber-200",
};

// ─── Weapon card ──────────────────────────────────────────────────────────────

function WeaponCard({ weapon, jobCount }: { weapon: Weapon; jobCount: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className={`section-card p-4 border ${RANK_BG[weapon.rank]} transition-all`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <RankBadge rank={weapon.rank} large />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-kuroko text-base leading-snug truncate">{weapon.title}</h2>
            {weapon.jobsCompleted.length > 0 && (
              <span className="shrink-0 rounded-full bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 text-[10px] font-bold text-accent-green">
                装備中
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {weapon.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-kaki/10 border border-kaki/20 px-2 py-0.5 text-[10px] font-semibold text-kaki">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-[#9890A8]">
            <span>スコア {weapon.score.toFixed(1)}</span>
            <span>案件完了 {weapon.jobsCompleted.length} 件</span>
            <span>収益 +¥{(jobCount * 8000).toLocaleString("ja-JP")}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-[#9890A8] hover:text-kaki shrink-0"
          aria-label="ノートを見る"
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>
      {expanded && (
        <pre className="mt-3 text-xs font-mono text-[#4A4464] bg-surface-inset rounded-lg p-3 whitespace-pre-wrap overflow-auto max-h-32 border border-kuroko/10">
          {weapon.noteContent}
        </pre>
      )}
    </li>
  );
}

// ─── Loop demo ────────────────────────────────────────────────────────────────

const DEMO_STEPS = [
  { label: "📝 ノートを銀行に預ける", duration: 800 },
  { label: "✨ AIが評価 → A ランク武器が誕生！", duration: 1000 },
  { label: "⚔️ 案件ボードで装備", duration: 800 },
  { label: "🎯 案件完了！", duration: 700 },
  { label: "💰 おだちん ¥25,000 を受け取り", duration: 700 },
  { label: "📖 ギルド通帳に記録", duration: 600 },
] as const;

function LoopDemo({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startDemo() {
    setRunning(true);
    setCurrentStep(0);

    let step = 0;
    function advance() {
      step++;
      if (step < DEMO_STEPS.length) {
        setCurrentStep(step);
        timerRef.current = setTimeout(advance, DEMO_STEPS[step].duration);
      } else {
        setRunning(false);
        playSuccessChime();
        onComplete();
      }
    }

    timerRef.current = setTimeout(advance, DEMO_STEPS[0].duration);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="section-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-kuroko">ループ実演</h2>
        <button
          type="button"
          onClick={startDemo}
          disabled={running}
          className="btn-primary text-sm !py-1.5 disabled:opacity-50"
          aria-label="ループ実演を開始"
        >
          {running ? "実演中…" : "▶ 実演開始"}
        </button>
      </div>
      <div className="space-y-2">
        {DEMO_STEPS.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-300 ${
              currentStep === i
                ? "bg-kaki/10 border border-kaki/30 text-kaki font-semibold scale-[1.01]"
                : currentStep > i
                ? "text-[#9890A8] line-through"
                : "text-[#4A4464]"
            }`}
          >
            <span className={`w-5 h-5 rounded-full border text-[10px] flex items-center justify-center shrink-0 ${
              currentStep > i
                ? "bg-accent-green border-accent-green text-white"
                : currentStep === i
                ? "bg-kaki border-kaki text-white animate-pulse"
                : "border-kuroko/20 text-[#9890A8]"
            }`}>
              {currentStep > i ? "✓" : i + 1}
            </span>
            {s.label}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#9890A8] text-right">
        合計所要時間: 約 {(DEMO_STEPS.reduce((s, d) => s + d.duration, 0) / 1000).toFixed(1)} 秒
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuildPage() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Mock for initial render; server action overrides with DB-enriched snapshot on mount.
  const [snap, setSnap] = useState(() => getPassbookSnapshot("demo-user"));

  useEffect(() => {
    setMounted(true);
    setWeapons(getWeapons());
    getPassbookSnapshotAction("demo-user").then(setSnap);
  }, []);

  function handleLoopComplete() {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2500);
  }

  const totalEarnings = weapons.reduce((sum, w) => sum + w.jobsCompleted.length * 8000, 0);
  const applications = mounted ? getApplications() : [];

  const guildTransactions: PassbookTransaction[] = [
    ...snap.recentTransactions,
    ...applications.map((app, i) => ({
      id: `app_tx_${i}`,
      type: "card" as const,
      amount: app.reward,
      assetTitle: `案件完了おだちん`,
      at: app.appliedAt,
    })),
  ].slice(0, 8);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      <Confetti active={confetti} duration={2500} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Shimaenaga variant="coin" size="md" mode="guardian" />
          <div>
            <h1 className="text-2xl font-bold text-kuroko">武器庫</h1>
            <p className="text-sm text-[#9890A8]">あなたの知恵と実績が集まる場所</p>
          </div>
        </div>
        <Link href="/bank" className="btn-primary shrink-0 text-sm">
          + ノートを預ける
        </Link>
      </div>

      {/* Stats */}
      {mounted && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="section-card p-4 text-center">
            <p className="text-xs text-[#9890A8]">武器</p>
            <p className="text-2xl font-black text-kuroko tabular-nums">{weapons.length}</p>
          </div>
          <div className="section-card p-4 text-center">
            <p className="text-xs text-[#9890A8]">案件完了</p>
            <p className="text-2xl font-black text-kaki tabular-nums">{applications.length}</p>
          </div>
          <div className="section-card p-4 text-center">
            <p className="text-xs text-[#9890A8]">累計おだちん</p>
            <p className="text-lg font-black text-accent-green tabular-nums">
              ¥{(totalEarnings + applications.reduce((s, a) => s + a.reward, 0)).toLocaleString("ja-JP")}
            </p>
          </div>
        </div>
      )}

      {/* Loop demo */}
      <LoopDemo onComplete={handleLoopComplete} />

      {/* Weapons */}
      <div className="mt-5">
        <h2 className="text-sm font-bold text-[#9890A8] uppercase tracking-widest mb-3">
          武器一覧
        </h2>
        {!mounted ? (
          <div className="section-card p-8 text-center">
            <p className="text-[#9890A8]">読み込み中…</p>
          </div>
        ) : weapons.length === 0 ? (
          <div className="section-card p-8 text-center border-2 border-dashed border-kaki/20">
            <Shimaenaga variant="wave" size="md" mode="seal" className="mx-auto" />
            <p className="mt-3 text-sm text-[#9890A8]">武器がまだありません。</p>
            <Link href="/bank" className="btn-primary mt-4 inline-block">
              シマエナガ銀行へ →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {weapons.map((w) => (
              <WeaponCard key={w.id} weapon={w} jobCount={w.jobsCompleted.length} />
            ))}
          </ul>
        )}
      </div>

      {/* Guild passbook */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#9890A8] uppercase tracking-widest">
            ギルド通帳
          </h2>
          <button
            type="button"
            onClick={playPassbookChime}
            className="text-[10px] text-kaki hover:underline"
            aria-label="通帳チャイムを鳴らす"
          >
            🔔 チャイム
          </button>
        </div>
        <PassbookTable transactions={guildTransactions} />
      </div>

      {/* Navigation links to inner pages */}
      <div className="mt-6 section-card p-4 flex flex-wrap gap-3 text-sm">
        <Link href="/wallet" className="text-[#9890A8] hover:text-kaki transition-colors">
          おさいふ詳細 →
        </Link>
        <Link href="/marketplace" className="text-[#9890A8] hover:text-kaki transition-colors">
          保管庫 →
        </Link>
        <Link href="/showcase" className="text-[#9890A8] hover:text-kaki transition-colors">
          つくったもの →
        </Link>
      </div>
    </main>
  );
}
