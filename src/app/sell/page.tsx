"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { audit, computeFloorPrice } from "@/lib/ai-auditor";
import { computeTrustScore } from "@/lib/trust-score";
import TrustScore from "@/components/trust-score/TrustScore";
import { RankBadge } from "@/components/RankBadge";
import { formatJPY, isGithubUrl } from "@/utils/format";
import { generateRemixDescription } from "@/lib/listing-generator";
import type { CCAF } from "@/types";

const defaultCCAF: CCAF = {
  intentSignals: ["author-statement"],
  thoughtDensity: 72,
  iterations: 14,
  authorId: "me",
  createdAt: new Date().toISOString(),
};

const inputClass =
  "mt-1 w-full rounded-lg border border-kuroko/20 bg-white px-3 py-2 text-sm text-kuroko placeholder-[#9890A8] focus:border-kaki focus:outline-none focus:ring-1 focus:ring-kaki/30";

// ─── Inner form (reads search params) ────────────────────────────────────────

function SellContent() {
  const params = useSearchParams();
  const remixId = params.get("remix");
  const remixFrom = params.get("from");

  const remixDescription = remixFrom ? generateRemixDescription(remixFrom) : "";

  const [githubUrl, setGithubUrl] = useState("");
  const [description, setDescription] = useState(remixDescription);
  const [inheritApiKey, setInheritApiKey] = useState(remixId !== null);
  const [ccaf, setCcaf] = useState<CCAF>(defaultCCAF);
  const [vercelUptimeDays, setUptime] = useState(30);
  const [basePrice, setBasePrice] = useState(5000);
  const [submitted, setSubmitted] = useState<null | { id: string }>(null);

  // Re-sync description if remix params change on client
  useEffect(() => {
    if (remixFrom) setDescription(generateRemixDescription(remixFrom));
  }, [remixFrom]);

  const trust = useMemo(
    () => computeTrustScore({ qualityHistory: 70, discordContribution: 55, xAmplification: 40 }),
    []
  );
  const auditResult = useMemo(() => audit({ ccaf, vercelUptimeDays }), [ccaf, vercelUptimeDays]);
  const floor = useMemo(() => computeFloorPrice(basePrice, trust.score), [basePrice, trust.score]);

  const githubOk = isGithubUrl(githubUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubOk) return;
    setSubmitted({ id: `listing_${Date.now()}` });
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-kuroko">知能を出品する</h1>
        <p className="mt-1 text-sm text-[#9890A8]">
          Trust Score が高いほど Floor Price と露出が上がる。良質な出品が、売れる。
        </p>
      </div>

      {/* Remix chip */}
      {remixFrom && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-kaki/30 bg-kaki/10 px-3 py-2">
          <span className="text-xs text-kaki font-medium">Remix元:</span>
          <span className="text-xs text-kuroko font-semibold truncate max-w-[240px]">{remixFrom}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">

        {/* Step 1 */}
        <section className="section-card p-5">
          <h2 className="text-sm font-semibold text-kuroko">Step 1 · GitHub URL</h2>
          <p className="mt-0.5 text-xs text-[#9890A8]">出品する知能資産のリポジトリ URL を入力</p>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className={inputClass}
            required
          />
          <p className={`mt-1.5 text-xs ${githubUrl ? (githubOk ? "text-emerald-600" : "text-red-500") : "text-[#9890A8]"}`}>
            {githubUrl
              ? githubOk ? "✓ 有効な GitHub URL" : "URL の形式が正しくありません"
              : "GitHub のリポジトリ URL を入力してください"}
          </p>

          {/* Description */}
          <label className="mt-3 flex flex-col text-sm text-[#4A4464]">
            説明文
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="この知能資産が解決する課題と特徴を記述してください"
              className={`${inputClass} resize-none`}
            />
          </label>

          {/* Inherit API key (remix only) */}
          {remixId && (
            <label className="mt-3 flex items-center gap-2 cursor-pointer text-sm text-[#4A4464]">
              <input
                type="checkbox"
                checked={inheritApiKey}
                onChange={(e) => setInheritApiKey(e.target.checked)}
                className="rounded border-kuroko/30 text-kaki focus:ring-kaki/30"
              />
              API キーを継承する
              <span className="text-xs text-[#9890A8]">（Remix 元の認証情報を引き継ぐ）</span>
            </label>
          )}
        </section>

        {/* Step 2 */}
        <section className="section-card p-5">
          <h2 className="text-sm font-semibold text-kuroko">Step 2 · CCAF</h2>
          <p className="mt-0.5 text-xs text-[#9890A8]">
            Cognitive Context Audit File — 思考密度が高いほどランクと価格が上がる
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <label className="flex flex-col text-[#4A4464]">
              思考密度 (0-100)
              <input
                type="number"
                value={ccaf.thoughtDensity}
                min={0} max={100}
                onChange={(e) => setCcaf({ ...ccaf, thoughtDensity: Number(e.target.value) })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col text-[#4A4464]">
              試行回数
              <input
                type="number"
                value={ccaf.iterations}
                min={0}
                onChange={(e) => setCcaf({ ...ccaf, iterations: Number(e.target.value) })}
                className={inputClass}
              />
            </label>
            <label className="col-span-2 flex flex-col text-[#4A4464]">
              人間意思シグナル（カンマ区切り）
              <input
                type="text"
                value={ccaf.intentSignals.join(", ")}
                onChange={(e) =>
                  setCcaf({ ...ccaf, intentSignals: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                }
                className={inputClass}
                placeholder="設計レビュー済み, ユーザーインタビュー反映"
              />
            </label>
            <label className="col-span-2 flex flex-col text-[#4A4464]">
              Vercel 稼働日数
              <input
                type="number"
                value={vercelUptimeDays}
                min={0}
                onChange={(e) => setUptime(Number(e.target.value))}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        {/* Step 3 — AI preview */}
        <section className="section-card p-5">
          <h2 className="text-sm font-semibold text-kuroko">Step 3 · AI 鑑定プレビュー</h2>
          <div className="mt-3 flex items-center gap-3">
            <RankBadge rank={auditResult.rank} />
            <span className="text-sm text-[#4A4464]">composite score {auditResult.score}</span>
          </div>
          <ul className="mt-2 space-y-1">
            {auditResult.reasons.map((r) => (
              <li key={r} className="flex gap-2 text-xs text-[#4A4464]">
                <span className="text-kaki mt-0.5">·</span>
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[#9890A8]">
            ※ S ランクは最大 +50% プレミアム価格。魂の登記（意思シグナル）が必要。
          </p>
        </section>

        {/* Step 4 — Pricing */}
        <section className="section-card p-5">
          <h2 className="text-sm font-semibold text-kuroko">Step 4 · 価格設定</h2>
          <label className="mt-3 flex flex-col text-sm text-[#4A4464]">
            ベース価格 (JPY)
            <input
              type="number"
              value={basePrice}
              min={0}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xs text-[#9890A8]">Floor Price（Trust-Based Pricing 適用後）</span>
            <span className="text-xl font-bold text-kuroko">{formatJPY(floor)}</span>
          </div>
          <p className="mt-1 text-xs text-[#9890A8]">
            Trust Score {trust.score} / 1000 に基づき自動算出
          </p>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={!githubOk}
          className="btn-primary w-full !py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          出品する
        </button>

        {submitted && (
          <div className="section-card p-4 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm flex-shrink-0">✓</span>
            <div>
              <p className="text-sm font-medium text-kuroko">出品完了</p>
              <p className="text-xs text-[#9890A8] font-mono">{submitted.id}</p>
            </div>
          </div>
        )}

      </form>

      {/* Trust Score aside */}
      <aside className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9890A8] mb-3">
          あなたの Trust Score
        </p>
        <TrustScore
          ownerName="You"
          input={{ qualityHistory: 70, discordContribution: 55, xAmplification: 40 }}
        />
      </aside>

    </main>
  );
}

// ─── Page wrapper with Suspense (required for useSearchParams) ────────────────

export default function SellPage() {
  return (
    <Suspense fallback={
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
        <div className="section-card p-8 text-center mt-12">
          <p className="text-sm text-[#9890A8]">読み込み中…</p>
        </div>
      </main>
    }>
      <SellContent />
    </Suspense>
  );
}
