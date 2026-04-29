"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shimaenaga } from "@/components/Shimaenaga";
import { Confetti } from "@/components/Confetti";
import { RankBadge } from "@/components/RankBadge";
import { audit } from "@/lib/ai-auditor";
import { mintWeapon, extractTags, deriveTitle } from "@/lib/weapons";
import { playPassbookChime, playSuccessChime } from "@/lib/sound";
import type { AuditResult } from "@/types";

// ─── Step machine ─────────────────────────────────────────────────────────────

type Step = "input" | "scoring" | "result" | "minting" | "done";

const RANK_COLORS = {
  S: "border-kaki bg-kaki/10 text-kaki",
  A: "border-zinc-400 bg-zinc-100 text-zinc-600",
  B: "border-amber-700 bg-amber-50 text-amber-800",
};

const RANK_MESSAGES = {
  S: "最高ランク！あなたの知恵は「伝説の武器」に武器化されます。",
  A: "高品質！「精鋭の武器」として武器庫に格納されます。",
  B: "基本ランク。継続することでランクアップできます！",
};

// ─── Score animation ──────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="mt-3 h-3 w-full rounded-full bg-kuroko/10 overflow-hidden">
      <div
        className="h-3 rounded-full bg-kaki transition-all duration-1000"
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

// ─── Minting animation ────────────────────────────────────────────────────────

function MintingAnimation() {
  return (
    <div className="flex flex-col items-center gap-4 py-10 animate-pulse">
      <Shimaenaga variant="coin" size="lg" mode="guardian" />
      <p className="text-lg font-bold text-kaki">武器化しています…</p>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-kaki"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
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
      setStep("result");
    }, 1200);
  }, [noteContent]);

  const handleMint = useCallback(() => {
    if (!auditResult) return;
    setStep("minting");

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
  }, [auditResult, noteContent, weaponTitle]);

  const handleReset = useCallback(() => {
    setStep("input");
    setNoteContent("");
    setAuditResult(null);
    setWeaponTitle("");
  }, []);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
      <Confetti active={confetti} duration={2000} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shimaenaga variant="trust" size="md" mode="seal" />
        <div>
          <h1 className="text-2xl font-bold text-kuroko">シマエナガ銀行</h1>
          <p className="text-sm text-[#9890A8]">知恵を預けると、最強の武器になります</p>
        </div>
      </div>

      {/* Step: input */}
      {step === "input" && (
        <div className="section-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9890A8] mb-1">
            ステップ 1／3 — ノートを書く
          </p>
          <h2 className="text-lg font-bold text-kuroko mb-3">
            あなたの「こだわり」を貼り付けてください
          </h2>
          <p className="text-sm text-[#4A4464] mb-4 leading-relaxed">
            自分のやり方・設計思想・試行錯誤のログ。Markdown対応。<br />
            50文字以上で意思シグナルが付与されSランクを目指せます。
          </p>

          <textarea
            className="input-base w-full h-48 resize-none font-mono text-sm"
            placeholder={"# 私のこだわり\n\n例: AIエージェントを設計するとき、まず...\n\n#AI #設計"}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            aria-label="知恵のノート"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-[#9890A8]">{noteContent.length} 文字</span>
            {noteContent.length > 50 && (
              <span className="text-xs text-kaki font-semibold">✓ 意思シグナル付与</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleScore}
            disabled={noteContent.trim().length < 10}
            className="mt-4 btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="ノートをAI評価する"
          >
            ✨ AIに評価してもらう →
          </button>
        </div>
      )}

      {/* Step: scoring */}
      {step === "scoring" && (
        <div className="section-card p-6 text-center">
          <Shimaenaga variant="key" size="lg" mode="avatar" className="mx-auto" />
          <p className="mt-4 text-base font-semibold text-kuroko">鑑定中です…</p>
          <p className="text-sm text-[#9890A8] mt-1">シマエナガが思考密度を解析しています</p>
          <div className="mt-4 h-2 w-full rounded-full bg-kuroko/10 overflow-hidden">
            <div className="h-2 rounded-full bg-kaki animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* Step: result */}
      {step === "result" && auditResult && (
        <div className="space-y-4">
          <div className="section-card p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9890A8] mb-1">
              ステップ 2／3 — 鑑定結果
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Shimaenaga variant="trust" size="md" mode="seal" />
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 ${RANK_COLORS[auditResult.rank]}`}>
                  <RankBadge rank={auditResult.rank} large />
                  <span className="text-lg font-black">{auditResult.rank} ランク</span>
                </div>
                <p className="mt-2 text-sm text-[#4A4464]">{RANK_MESSAGES[auditResult.rank]}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#9890A8]">総合スコア</span>
                <span className="font-bold text-kuroko tabular-nums">{auditResult.score.toFixed(1)} / 100</span>
              </div>
              <ScoreBar score={auditResult.score} />
            </div>

            <ul className="mt-3 space-y-1">
              {auditResult.reasons.map((r) => (
                <li key={r} className="text-xs text-[#4A4464] flex gap-1.5">
                  <span className="text-kaki mt-0.5 shrink-0">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="section-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9890A8] mb-2">
              武器のタイトル（編集可）
            </p>
            <input
              type="text"
              className="input-base w-full text-base font-semibold"
              value={weaponTitle}
              onChange={(e) => setWeaponTitle(e.target.value)}
              aria-label="武器タイトル"
            />
            <p className="mt-1 text-xs text-[#9890A8]">
              タグ: {extractTags(noteContent).join(", ") || "（なし）"}
            </p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={handleReset} className="btn-secondary flex-1">
              書き直す
            </button>
            <button
              type="button"
              onClick={handleMint}
              className="btn-primary flex-1"
              aria-label="武器化して武器庫に格納する"
            >
              ⚔️ 武器化して格納する →
            </button>
          </div>
        </div>
      )}

      {/* Step: minting */}
      {step === "minting" && (
        <div className="section-card p-6">
          <MintingAnimation />
        </div>
      )}

      {/* Step: done */}
      {step === "done" && auditResult && (
        <div className="section-card p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9890A8] mb-3">
            ステップ 3／3 — 完了！
          </p>
          <Shimaenaga variant="wave" size="lg" mode="guardian" className="mx-auto" />
          <h2 className="mt-4 text-xl font-black text-kuroko">
            🎉 武器化完了！
          </h2>
          <p className="mt-2 text-sm text-[#4A4464]">
            「{weaponTitle}」が<span className="font-bold text-kaki">{auditResult.rank}ランク武器</span>として武器庫に格納されました。
          </p>
          <p className="mt-1 text-sm text-[#9890A8]">
            案件ボードで装備して稼ぎましょう！
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button type="button" onClick={handleReset} className="btn-secondary">
              もう一つ預ける
            </button>
            <button
              type="button"
              onClick={() => { playSuccessChime(); router.push("/jobs"); }}
              className="btn-primary"
            >
              案件ボードへ →
            </button>
          </div>
          <button
            type="button"
            onClick={() => router.push("/guild")}
            className="mt-3 text-sm text-[#9890A8] hover:text-kaki transition-colors"
          >
            武器庫を見る
          </button>
        </div>
      )}

      {/* How it works */}
      {step === "input" && (
        <div className="mt-6 section-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9890A8] mb-3">
            仕組み
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: "📝", label: "ノートを貼る", desc: "こだわり・設計思想・試行ログを入力" },
              { icon: "🔬", label: "AIが評価", desc: "思考密度・意思シグナルからS/A/Bランク判定" },
              { icon: "⚔️", label: "武器化", desc: "案件ボードで装備して報酬を稼ぐ" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="text-center">
                <span className="text-2xl">{icon}</span>
                <p className="mt-1 text-sm font-bold text-kuroko">{label}</p>
                <p className="mt-0.5 text-xs text-[#9890A8]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
