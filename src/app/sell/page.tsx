"use client";

// GUILD AI — /sell page (登記 UI). Inherits the listing_008 structure.
// Steps: GitHub URL → CCAF upload/auto-gen → AI rank preview → price → submit.
// Spec: docs/マスター設計図.md §6.

import { useMemo, useState } from "react";
import { audit, computeFloorPrice } from "@/lib/ai-auditor";
import { computeTrustScore } from "@/lib/trust-score";
import TrustScore from "@/components/trust-score/TrustScore";
import { formatJPY, isGithubUrl } from "@/utils/format";
import type { CCAF } from "@/types";

const defaultCCAF: CCAF = {
  intentSignals: ["author-statement"],
  thoughtDensity: 72,
  iterations: 14,
  authorId: "me",
  createdAt: new Date().toISOString()
};

export default function SellPage() {
  const [githubUrl, setGithubUrl] = useState("");
  const [ccaf, setCcaf] = useState<CCAF>(defaultCCAF);
  const [vercelUptimeDays, setUptime] = useState(30);
  const [basePrice, setBasePrice] = useState(5000);
  const [submitted, setSubmitted] = useState<null | { id: string }>(null);

  const trust = useMemo(
    () =>
      computeTrustScore({
        qualityHistory: 70,
        discordContribution: 55,
        xAmplification: 40
      }),
    []
  );

  const auditResult = useMemo(
    () => audit({ ccaf, vercelUptimeDays }),
    [ccaf, vercelUptimeDays]
  );
  const floor = useMemo(
    () => computeFloorPrice(basePrice, trust.score),
    [basePrice, trust.score]
  );

  const githubOk = isGithubUrl(githubUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubOk) return;
    // In production, POST /api/listings — here we simulate.
    setSubmitted({ id: `listing_${Date.now()}` });
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">知能を登記する</h1>
      <p className="mt-2 text-sm text-kuroko/70">
        listing_008 を継承した登記フロー。GitHub × CCAF × AI 鑑定を統合します。
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <fieldset className="rounded-2xl border border-kuroko/10 p-5">
          <legend className="px-2 text-sm font-semibold">Step 1 · GitHub URL</legend>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="mt-2 w-full rounded-md border border-kuroko/20 bg-white px-3 py-2"
            required
          />
          <p className="mt-1 text-xs text-kuroko/60">
            {githubUrl
              ? githubOk
                ? "✓ 有効な GitHub URL"
                : "URL の形式が正しくありません"
              : "GitHub のリポジトリ URL を入力してください"}
          </p>
        </fieldset>

        <fieldset className="rounded-2xl border border-kuroko/10 p-5">
          <legend className="px-2 text-sm font-semibold">Step 2 · CCAF</legend>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="flex flex-col">
              思考密度 (0-100)
              <input
                type="number"
                value={ccaf.thoughtDensity}
                min={0}
                max={100}
                onChange={(e) =>
                  setCcaf({ ...ccaf, thoughtDensity: Number(e.target.value) })
                }
                className="mt-1 rounded-md border border-kuroko/20 px-2 py-1"
              />
            </label>
            <label className="flex flex-col">
              試行回数
              <input
                type="number"
                value={ccaf.iterations}
                min={0}
                onChange={(e) =>
                  setCcaf({ ...ccaf, iterations: Number(e.target.value) })
                }
                className="mt-1 rounded-md border border-kuroko/20 px-2 py-1"
              />
            </label>
            <label className="col-span-2 flex flex-col">
              人間意思シグナル（カンマ区切り）
              <input
                type="text"
                value={ccaf.intentSignals.join(", ")}
                onChange={(e) =>
                  setCcaf({
                    ...ccaf,
                    intentSignals: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  })
                }
                className="mt-1 rounded-md border border-kuroko/20 px-2 py-1"
              />
            </label>
            <label className="col-span-2 flex flex-col">
              Vercel 稼働日数
              <input
                type="number"
                value={vercelUptimeDays}
                min={0}
                onChange={(e) => setUptime(Number(e.target.value))}
                className="mt-1 rounded-md border border-kuroko/20 px-2 py-1"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-kuroko/10 p-5">
          <legend className="px-2 text-sm font-semibold">Step 3 · AI 鑑定プレビュー</legend>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold">Rank {auditResult.rank}</span>
            <span className="text-sm text-kuroko/70">
              composite score {auditResult.score}
            </span>
          </div>
          <ul className="mt-2 list-disc pl-5 text-sm text-kuroko/70">
            {auditResult.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </fieldset>

        <fieldset className="rounded-2xl border border-kuroko/10 p-5">
          <legend className="px-2 text-sm font-semibold">Step 4 · 価格</legend>
          <label className="flex flex-col text-sm">
            basePrice (JPY)
            <input
              type="number"
              value={basePrice}
              min={0}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="mt-1 rounded-md border border-kuroko/20 px-2 py-1"
            />
          </label>
          <p className="mt-2 text-sm text-kuroko/70">
            Floor Price: <strong>{formatJPY(floor)}</strong>
            <span className="ml-2 text-xs text-kuroko/50">
              (Trust Score {trust.score} に基づく Trust-Based Pricing)
            </span>
          </p>
        </fieldset>

        <button
          type="submit"
          disabled={!githubOk}
          className="rounded-xl bg-kuroko px-5 py-3 text-kami disabled:opacity-40"
        >
          登記する
        </button>

        {submitted && (
          <p className="rounded-md bg-kaki/30 p-3 text-sm">
            ✓ 登記完了: <code>{submitted.id}</code>
          </p>
        )}
      </form>

      <aside className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-kuroko/60">
          あなたの Trust Score
        </h2>
        <div className="mt-3">
          <TrustScore
            ownerName="You"
            input={{ qualityHistory: 70, discordContribution: 55, xAmplification: 40 }}
          />
        </div>
      </aside>
    </main>
  );
}
