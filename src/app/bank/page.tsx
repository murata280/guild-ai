"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shimaenaga } from "@/components/Shimaenaga";
import { Confetti } from "@/components/Confetti";
import { RankBadge } from "@/components/RankBadge";
import { audit } from "@/lib/ai-auditor";
import { mintWeapon, extractTags, deriveTitle } from "@/lib/weapons";
import { playPassbookChime, playSuccessChime, playStampChime } from "@/lib/sound";
import { useTactile } from "@/hooks/useTactile";
import type { AuditResult } from "@/types";

// ─── Step machine ─────────────────────────────────────────────────────────────

type Step = "input" | "scoring" | "result" | "minting" | "done";

const FRIENDLY_RANK_LABELS = {
  S: { title: "すごい！ 金バッジ！", desc: "あなたのちえは「でんせつのぶき」になります。", color: "text-[#7A5000]" },
  A: { title: "いいかんじ！ 銀バッジ！", desc: "「せいえいのぶき」としてぶきこに入ります。", color: "text-[#3A3A3A]" },
  B: { title: "できたよ！ 銅バッジ！", desc: "つづけることでランクがあがります！", color: "text-[#5A2D00]" },
};

// ─── Gold stamp SVG ───────────────────────────────────────────────────────────

function GoldStamp({ rank, stamped }: { rank: "S" | "A" | "B"; stamped: boolean }) {
  const colors = {
    S: { bg: "#D4A437", text: "#7A5000", ring: "#F2DFA0" },
    A: { bg: "#ABABAB", text: "#3A3A3A", ring: "#E8E8E8" },
    B: { bg: "#B87333", text: "#5A2D00", ring: "#F0C890" },
  }[rank];

  return (
    <div
      className={`mx-auto ${stamped ? "stamp-pon" : "opacity-0"}`}
      style={{ width: 80, height: 80 }}
      aria-hidden
    >
      <svg width="80" height="80" viewBox="0 0 80 80">
        {/* Outer serrated ring */}
        {Array.from({ length: 18 }, (_, i) => {
          const angle = (i / 18) * Math.PI * 2 - Math.PI / 2;
          const r1 = 36, r2 = 38;
          const x1 = 40 + Math.cos(angle) * r1;
          const y1 = 40 + Math.sin(angle) * r1;
          const x2 = 40 + Math.cos(angle) * r2;
          const y2 = 40 + Math.sin(angle) * r2;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.ring} strokeWidth="3" strokeLinecap="round" />;
        })}
        <circle cx="40" cy="40" r="32" fill={colors.bg} stroke={colors.ring} strokeWidth="2" />
        <text x="40" y="44" textAnchor="middle" fontSize="22" fontWeight="900" fill={colors.text}>
          {rank}
        </text>
        <text x="40" y="56" textAnchor="middle" fontSize="6" fontWeight="700" fill={colors.text} opacity="0.7">
          CERTIFIED
        </text>
      </svg>
    </div>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="mt-3 h-3 w-full rounded-full bg-ink/10 overflow-hidden">
      <div
        className="h-3 rounded-full bg-gradient-to-r from-gold to-timee-yellow transition-all duration-1000"
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BankPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [noteContent, setNoteContent] = useState("");
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [weaponTitle, setWeaponTitle] = useState("");
  const [stamped, setStamped] = useState(false);

  const triggerStamp = useTactile("stamp");
  const triggerPoyon = useTactile("poyon");

  const handleScore = useCallback(() => {
    if (!noteContent.trim()) return;
    setStep("scoring");

    setTimeout(() => {
      const lines = noteContent.split("\n").length;
      const wordCount = noteContent.replace(/\s/g, "").length;
      const thoughtDensity = Math.min(100, Math.round((wordCount / 5) + (lines * 2)));
      const iterations = Math.max(1, Math.floor(wordCount / 30));
      const hasIntent = noteContent.length > 50;

      const result = audit({
        ccaf: {
          intentSignals: hasIntent ? ["author-statement"] : [],
          thoughtDensity,
          iterations,
          authorId: "demo-user",
          createdAt: new Date().toISOString(),
        },
        vercelUptimeDays: 30,
      });

      setAuditResult(result);
      setWeaponTitle(deriveTitle(noteContent));

      // Stamp animation: 0.6s delay then pon
      setTimeout(() => {
        setStamped(true);
        triggerStamp();
        setTimeout(() => setStep("result"), 800);
      }, 600);
    }, 1400);
  }, [noteContent, triggerStamp]);

  const handleMint = useCallback(() => {
    if (!auditResult) return;
    setStep("minting");
    triggerPoyon();

    setTimeout(() => {
      const tags = extractTags(noteContent);
      mintWeapon({
        title: weaponTitle,
        noteContent,
        rank: auditResult.rank,
        score: auditResult.score,
        tags,
      });

      playPassbookChime();
      setConfetti(true);
      setStep("done");
      setTimeout(() => setConfetti(false), 2000);
    }, 1500);
  }, [auditResult, noteContent, weaponTitle, triggerPoyon]);

  const handleReset = useCallback(() => {
    setStep("input");
    setNoteContent("");
    setAuditResult(null);
    setWeaponTitle("");
    setStamped(false);
  }, []);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
      <Confetti active={confetti} duration={2000} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shimaenaga variant="trust" size="md" mode="seal" />
        <div>
          <h1 className="text-2xl font-bold text-ink">シマエナガ銀行</h1>
          <p className="text-sm text-ink-muted">キミの知恵（ちえ）をのこす</p>
        </div>
      </div>

      {/* Step: input */}
      {step === "input" && (
        <div className="section-card p-6 border border-gold-soft">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-1">
            ステップ 1／3 — ちえをかく
          </p>
          <h2 className="text-lg font-bold text-ink mb-3">
            キミのこだわりをはりつけてみよう
          </h2>
          <p className="text-sm text-ink-muted mb-4 leading-relaxed">
            じぶんのやりかた・せっけいのくふう・やってみたきろく。<br />
            50もじいじょうかくと「いしシグナル」がついてSランクを目指せます。
          </p>

          <textarea
            className="input-base w-full h-48 resize-none font-mono text-sm rounded-2xl"
            placeholder={"# わたしのこだわり\n\n例: AIエージェントをつくるとき、まず...\n\n#AI #設計"}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            aria-label="ちえのノート"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-ink-muted">{noteContent.length} もじ</span>
            {noteContent.length > 50 && (
              <span className="text-xs text-gold font-semibold">✓ いしシグナルついた！</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleScore}
            disabled={noteContent.trim().length < 10}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-gold to-timee-yellow text-[#7A5000] font-bold py-3 text-base shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90 active:scale-[0.98]"
            aria-label="ノートをAI評価する"
          >
            ✨ しらべてもらう →
          </button>
        </div>
      )}

      {/* Step: scoring — watch mode + stamp drop */}
      {step === "scoring" && (
        <div className="section-card p-6 text-center border border-gold-soft">
          <Shimaenaga variant="trust" size="lg" mode="watch" className="mx-auto" />
          <p className="mt-4 text-lg font-bold text-ink">スキャンちゅう...</p>
          <p className="text-sm text-ink-muted mt-1">シマエナガがじーっと ちえをよんでいます</p>
          <div className="mt-6">
            <GoldStamp rank="S" stamped={stamped} />
          </div>
        </div>
      )}

      {/* Step: result */}
      {step === "result" && auditResult && (
        <div className="space-y-4">
          <div className="section-card p-6 border-2 border-gold-soft">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-3">
              ステップ 2／3 — けっか！
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="shrink-0">
                <GoldStamp rank={auditResult.rank} stamped />
              </div>
              <div className="flex-1">
                <p className={`text-xl font-black ${FRIENDLY_RANK_LABELS[auditResult.rank].color}`}>
                  {FRIENDLY_RANK_LABELS[auditResult.rank].title}
                </p>
                <RankBadge rank={auditResult.rank} large friendly />
                <p className="mt-2 text-sm text-ink-muted">{FRIENDLY_RANK_LABELS[auditResult.rank].desc}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink-muted">スコア</span>
                <span className="font-bold text-ink tabular-nums">{auditResult.score.toFixed(1)} / 100</span>
              </div>
              <ScoreBar score={auditResult.score} />
            </div>
          </div>

          <div className="section-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
              ぶきのなまえ（へんこうOK）
            </p>
            <input
              type="text"
              className="input-base w-full text-base font-semibold rounded-2xl"
              value={weaponTitle}
              onChange={(e) => setWeaponTitle(e.target.value)}
              aria-label="ぶきのなまえ"
            />
            <p className="mt-1 text-xs text-ink-muted">
              タグ: {extractTags(noteContent).join(", ") || "（なし）"}
            </p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={handleReset} className="btn-secondary flex-1 rounded-2xl">
              かきなおす
            </button>
            <button
              type="button"
              onClick={handleMint}
              className="flex-1 rounded-2xl bg-gradient-to-r from-gold to-timee-yellow text-[#7A5000] font-bold py-2.5 text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
              aria-label="ぶきにしてぶきこにいれる"
            >
              ⚔️ ぶきにしてのこす →
            </button>
          </div>
        </div>
      )}

      {/* Step: minting */}
      {step === "minting" && (
        <div className="section-card p-6 text-center border border-gold-soft">
          <Shimaenaga variant="coin" size="lg" mode="guardian" className="mx-auto" />
          <p className="mt-4 text-lg font-bold text-gold animate-pulse">ぶきにしています…</p>
          <div className="flex justify-center gap-1 mt-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Step: done */}
      {step === "done" && auditResult && (
        <div className="section-card p-6 text-center border-2 border-gold-soft">
          <Shimaenaga variant="wave" size="lg" mode="guardian" className="mx-auto" />
          <h2 className="mt-4 text-2xl font-black text-ink">🎉 できた！</h2>
          <p className="mt-2 text-sm text-ink-muted">
            「{weaponTitle}」が
            <span className="font-bold text-gold"> {auditResult.rank}ランクのぶき </span>
            になりました！
          </p>
          <p className="mt-1 text-sm text-ink-muted">クエストボードでつかってみよう！</p>
          <div className="mt-6 flex gap-3 justify-center">
            <button type="button" onClick={handleReset} className="btn-secondary rounded-2xl">
              もうひとつのこす
            </button>
            <button
              type="button"
              onClick={() => { playSuccessChime(); router.push("/jobs"); }}
              className="rounded-2xl bg-gradient-to-r from-gold to-timee-yellow text-[#7A5000] font-bold px-5 py-2.5 text-sm shadow-md hover:opacity-90 active:scale-[0.98]"
            >
              クエストへいく →
            </button>
          </div>
          <button type="button" onClick={() => router.push("/guild")} className="mt-3 text-sm text-ink-muted hover:text-gold transition-colors">
            ぶきこをみる
          </button>
        </div>
      )}

      {/* How it works */}
      {step === "input" && (
        <div className="mt-6 section-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-3">しくみ</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: "📝", label: "ノートをおく", desc: "こだわり・くふう・きろくをかく" },
              { icon: "🔬", label: "AIがしらべる", desc: "おもさ・いしシグナルから金/銀/銅バッジ" },
              { icon: "⚔️", label: "ぶきになる", desc: "クエストボードでつかってかせぐ" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="text-center">
                <span className="text-2xl">{icon}</span>
                <p className="mt-1 text-sm font-bold text-ink">{label}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
