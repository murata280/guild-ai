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

// ─── Coin rain component ──────────────────────────────────────────────────────

function CoinRain({ active }: { active: boolean }) {
  if (!active) return null;
  const coins = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {coins.map((i) => (
        <span
          key={i}
          className="absolute text-lg coin-fall"
          style={{
            left: `${10 + i * 11}%`,
            top: "30%",
            animationDelay: `${i * 0.08}s`,
          }}
        >
          🪙
        </span>
      ))}
    </div>
  );
}

// ─── Friendly rank badge display ──────────────────────────────────────────────

function FriendlyRankSummary({ weapons }: { weapons: Weapon[] }) {
  const counts = { S: 0, A: 0, B: 0 };
  weapons.forEach((w) => { counts[w.rank]++; });
  const topRank = counts.S > 0 ? "S" : counts.A > 0 ? "A" : "B";

  return (
    <div className="flex flex-wrap gap-3 items-center mt-2">
      <div className="text-sm text-ink-muted">いまのあなたのランク：</div>
      {weapons.length > 0 ? (
        <RankBadge rank={topRank} large friendly />
      ) : (
        <span className="text-sm text-ink-muted">まだ ぶきがありません</span>
      )}
      {(["S", "A", "B"] as const).map((r) =>
        counts[r] > 0 ? (
          <span key={r} className="text-xs text-ink-muted">
            <RankBadge rank={r} friendly /> × {counts[r]}
          </span>
        ) : null
      )}
    </div>
  );
}

// ─── Weapon card ──────────────────────────────────────────────────────────────

function WeaponCard({ weapon }: { weapon: Weapon }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="section-card p-4 border border-gold-soft transition-all hover:border-gold">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <RankBadge rank={weapon.rank} friendly />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-ink text-base leading-snug truncate">{weapon.title}</h2>
            {weapon.jobsCompleted.length > 0 && (
              <span className="shrink-0 rounded-full bg-gold/10 border border-gold/30 px-2 py-0.5 text-[10px] font-bold text-gold">
                そうびちゅう
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {weapon.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gold-light border border-gold-soft px-2 py-0.5 text-[10px] font-semibold text-[#7A5000]">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
            <span>スコア {weapon.score.toFixed(1)}</span>
            <span>クエスト {weapon.jobsCompleted.length} かいクリア</span>
          </div>
        </div>
        <button type="button" onClick={() => setExpanded((v) => !v)} className="text-xs text-ink-muted hover:text-gold shrink-0" aria-label="ノートをみる">
          {expanded ? "▲" : "▼"}
        </button>
      </div>
      {expanded && (
        <pre className="mt-3 text-xs font-mono text-ink-muted bg-snow-soft rounded-2xl p-3 whitespace-pre-wrap overflow-auto max-h-32 border border-gold-soft">
          {weapon.noteContent}
        </pre>
      )}
    </li>
  );
}

// ─── Loop demo ────────────────────────────────────────────────────────────────

const DEMO_STEPS = [
  { label: "📝 ノートをシマエナガ銀行においた", duration: 800 },
  { label: "✨ AIがしらべた → Aランクのぶきが できた！", duration: 1000 },
  { label: "⚔️ クエストボードでそうびした", duration: 800 },
  { label: "🎯 クエストクリア！", duration: 700 },
  { label: "💰 おだちん ¥25,000 うけとった", duration: 700 },
  { label: "📖 ギルド通帳にきろくされた", duration: 600 },
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

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="section-card p-5 border border-gold-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-ink">ためしに ちえを のこしてみる</h2>
        <button
          type="button"
          onClick={startDemo}
          disabled={running}
          className="rounded-2xl bg-gradient-to-r from-gold to-timee-yellow text-[#7A5000] font-bold px-4 py-1.5 text-sm disabled:opacity-50"
          aria-label="ループ実演を開始"
        >
          {running ? "じっこんちゅう…" : "▶ はじめる"}
        </button>
      </div>
      <div className="space-y-2">
        {DEMO_STEPS.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm transition-all duration-300 ${
              currentStep === i
                ? "bg-gold-light border border-gold text-[#7A5000] font-semibold scale-[1.01]"
                : currentStep > i
                ? "text-ink-muted line-through"
                : "text-ink"
            }`}
          >
            <span className={`w-5 h-5 rounded-full border text-[10px] flex items-center justify-center shrink-0 ${
              currentStep > i
                ? "bg-accent-green border-accent-green text-white"
                : currentStep === i
                ? "bg-gold border-gold text-white animate-pulse"
                : "border-ink-muted text-ink-muted"
            }`}>
              {currentStep > i ? "✓" : i + 1}
            </span>
            {s.label}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-muted text-right">
        ぜんぶで {(DEMO_STEPS.reduce((s, d) => s + d.duration, 0) / 1000).toFixed(1)} びょう
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuildPage() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [coinRain, setCoinRain] = useState(false);
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
    setCoinRain(true);
    setTimeout(() => { setConfetti(false); setCoinRain(false); }, 2500);
  }

  const applications = mounted ? getApplications() : [];
  const totalOdachin = applications.reduce((s, a) => s + a.reward, 0);

  const guildTransactions: PassbookTransaction[] = [
    ...snap.recentTransactions,
    ...applications.map((app, i) => ({
      id: `app_tx_${i}`,
      type: "card" as const,
      amount: app.reward,
      assetTitle: `クエストおだちん`,
      at: app.appliedAt,
    })),
  ].slice(0, 8);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      <Confetti active={confetti} duration={2500} />

      {/* Header with coin rain */}
      <div className="relative flex items-start justify-between gap-4 mb-6 overflow-visible">
        <CoinRain active={coinRain} />
        <div className="flex items-center gap-3">
          <Shimaenaga variant="coin" size="md" mode="guardian" />
          <div>
            <h1 className="text-2xl font-bold text-ink">おたから をかくにんする</h1>
            <p className="text-sm text-ink-muted">キミの知恵と じっせきがあつまる場所</p>
          </div>
        </div>
        <Link href="/bank" className="rounded-2xl bg-gradient-to-r from-gold to-timee-yellow text-[#7A5000] font-bold px-4 py-2 text-sm shrink-0">
          + ちえをのこす
        </Link>
      </div>

      {/* Friendly rank display */}
      {mounted && <FriendlyRankSummary weapons={weapons} />}

      {/* Stats */}
      {mounted && (
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="section-card p-4 text-center border border-gold-soft">
            <p className="text-xs text-ink-muted">ぶき</p>
            <p className="text-2xl font-black text-ink tabular-nums">{weapons.length}</p>
          </div>
          <div className="section-card p-4 text-center border border-gold-soft">
            <p className="text-xs text-ink-muted">クエストクリア</p>
            <p className="text-2xl font-black text-gold tabular-nums">{applications.length}</p>
          </div>
          <div className="section-card p-4 text-center border border-gold-soft">
            <p className="text-xs text-ink-muted">こんしゅう ふえた金貨</p>
            <p className="text-lg font-black text-accent-green tabular-nums">
              ¥{totalOdachin.toLocaleString("ja-JP")}
            </p>
          </div>
        </div>
      )}

      {/* Loop demo */}
      <LoopDemo onComplete={handleLoopComplete} />

      {/* Weapons */}
      <div className="mt-5">
        <h2 className="text-sm font-bold text-ink-muted uppercase tracking-widest mb-3">ぶきいちらん</h2>
        {!mounted ? (
          <div className="section-card p-8 text-center"><p className="text-ink-muted">よみこみちゅう…</p></div>
        ) : weapons.length === 0 ? (
          <div className="section-card p-8 text-center border-2 border-dashed border-gold/30">
            <Shimaenaga variant="wave" size="md" mode="seal" className="mx-auto" />
            <p className="mt-3 text-sm text-ink-muted">まだ ぶきがありません。</p>
            <Link href="/bank" className="rounded-2xl bg-gradient-to-r from-gold to-timee-yellow text-[#7A5000] font-bold px-5 py-2.5 text-sm mt-4 inline-block">
              シマエナガ銀行へ →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {weapons.map((w) => <WeaponCard key={w.id} weapon={w} />)}
          </ul>
        )}
      </div>

      {/* Guild passbook */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-ink-muted uppercase tracking-widest">
            いまのおたから（ギルド通帳）
          </h2>
          <button type="button" onClick={playPassbookChime} className="text-[10px] text-gold hover:underline" aria-label="通帳チャイムをならす">
            🔔 チャリン
          </button>
        </div>
        <PassbookTable transactions={guildTransactions} />
      </div>

      <div className="mt-6 section-card p-4 flex flex-wrap gap-3 text-sm border border-gold-soft">
        <Link href="/wallet" className="text-ink-muted hover:text-gold transition-colors">おさいふ詳細 →</Link>
        <Link href="/marketplace" className="text-ink-muted hover:text-gold transition-colors">保管庫 →</Link>
        <Link href="/showcase" className="text-ink-muted hover:text-gold transition-colors">つくったもの →</Link>
      </div>
    </main>
  );
}
