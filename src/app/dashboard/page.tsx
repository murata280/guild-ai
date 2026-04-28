"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { OwnershipRecord } from "@/types";
import { computeContributionRank } from "@/lib/contribution-rank";
import type { ContributionRank } from "@/lib/contribution-rank";
import { getAssetHealth } from "@/lib/asset-health";

// ─── Rank styling ─────────────────────────────────────────────────────────────

const RANK_STYLE: Record<ContributionRank, { bg: string; text: string }> = {
  Newcomer:      { bg: "bg-[#9890A8]/20", text: "text-[#9890A8]" },
  Riser:         { bg: "bg-kaki/20",      text: "text-kaki" },
  Creator:       { bg: "bg-kaki/40",      text: "text-kaki" },
  "Pro Creator": { bg: "bg-kaki",         text: "text-white" },
  Legendary:     { bg: "bg-kuroko",       text: "text-white" },
};

// ─── Mini stat bar ────────────────────────────────────────────────────────────

function StatBar({ value, color = "bg-kaki" }: { value: number; color?: string }) {
  return (
    <div className="mt-1 h-1.5 w-full rounded-full bg-kuroko/10">
      <div
        className={`h-1.5 rounded-full ${color} transition-all`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

// ─── Gamification header ──────────────────────────────────────────────────────

function GamificationHeader({ owned }: { owned: OwnershipRecord[] }) {
  const rankResult = computeContributionRank({
    ownedCount: owned.length,
    salesCount: 0,
    listingCount: 0,
    apiCalls: owned.length * 3,
  });

  const style = RANK_STYLE[rankResult.rank];
  const isClose = rankResult.progress >= 70 && rankResult.nextRank !== null;

  return (
    <div className="mt-6 rounded-2xl border border-kaki/20 bg-kaki/5 p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">

        {/* Left: rank badge + progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${style.bg} ${style.text}`}>
              {rankResult.rank}
            </span>
            <p className="text-[11px] uppercase tracking-widest text-[#9890A8]">知能貢献ランク</p>
          </div>

          {rankResult.nextRank ? (
            <>
              <p className={`mt-2 text-sm font-medium ${isClose ? "text-kaki" : "text-[#4A4464]"}`}>
                {isClose ? "あと一歩！ " : ""}{rankResult.nextRank} まで {100 - rankResult.progress}%
              </p>
              <div className="mt-1.5 h-2 w-full rounded-full bg-kuroko/10">
                <div
                  className="h-2 rounded-full bg-kaki transition-all duration-500"
                  style={{ width: `${rankResult.progress}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[#9890A8]">累計スコア {rankResult.score} pt</p>
            </>
          ) : (
            <p className="mt-2 text-sm font-medium text-kaki">最高ランク達成！知能経済のパイオニア</p>
          )}
        </div>

        {/* Right: AI next action bubble */}
        <div className="sm:max-w-[220px] rounded-xl border border-kaki/20 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-kaki font-semibold">AI レコメンド</p>
          <p className="mt-1.5 text-xs text-[#4A4464] leading-relaxed">{rankResult.nextAction}</p>
        </div>

      </div>
    </div>
  );
}

// ─── Asset card ───────────────────────────────────────────────────────────────

function AssetCard({ record }: { record: OwnershipRecord }) {
  const health = getAssetHealth(record.assetId);

  return (
    <li className="section-card p-5 hover:shadow-card-hover transition-shadow">

      {/* AI Verified chip + live dot */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 rounded-full border border-kaki/30 bg-kaki/10 px-2.5 py-0.5 text-[11px] font-semibold text-kaki">
          AI Verified
        </span>
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[11px] text-[#9890A8]">稼働中</span>
      </div>

      {/* Title + deploy button */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-semibold text-kuroko truncate">{record.assetTitle}</h2>
          <p className="mt-0.5 text-xs text-[#9890A8]">
            取得日: {new Date(record.acquiredAt).toLocaleDateString("ja-JP")}
          </p>
          <p className="mt-0.5 text-[11px] text-[#9890A8] font-mono truncate">{record.assetId}</p>
        </div>
        <a
          href={record.deployUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary shrink-0 text-xs !px-3 !py-3"
        >
          Vercel にデプロイ ↗
        </a>
      </div>

      {/* Trust Graph */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <div className="flex justify-between text-xs text-[#4A4464]">
            <span>稼働率</span>
            <span className="tabular-nums font-medium">{health.uptimePercent}%</span>
          </div>
          <StatBar value={health.uptimePercent} color="bg-kaki" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-[#4A4464]">
            <span>成功率</span>
            <span className="tabular-nums font-medium">{health.successRate}%</span>
          </div>
          <StatBar value={health.successRate} color="bg-emerald-500" />
        </div>
      </div>

      {/* Footer: detail link + remix button */}
      <div className="mt-4 pt-3 border-t border-kuroko/10 flex flex-wrap items-center gap-3">
        <Link
          href={`/asset/${record.assetId}`}
          className="text-xs text-[#9890A8] hover:text-kaki transition-colors"
        >
          資産詳細を見る →
        </Link>
        <Link
          href={`/sell?remix=${record.assetId}&from=${encodeURIComponent(record.assetTitle)}`}
          className="ml-auto text-xs border border-kuroko/20 text-[#4A4464] rounded-lg px-3 py-1.5 hover:bg-kuroko/5 active:scale-[0.97] transition-all"
          title="APIキーを継承して新しい知能を作る"
        >
          この知能を組み合わせて出品
        </Link>
      </div>
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [owned, setOwned] = useState<OwnershipRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const records: OwnershipRecord[] = JSON.parse(
        localStorage.getItem("guild_owned_assets") ?? "[]"
      );
      setOwned(records);
    } catch {
      setOwned([]);
    }
  }, []);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kuroko">Dashboard</h1>
          <p className="mt-1 text-sm text-[#9890A8]">
            購入済み知能資産の一覧。Vercel にワンクリックでデプロイ可能。
          </p>
        </div>
        <Link href="/marketplace" className="btn-secondary shrink-0">
          Marketplace →
        </Link>
      </div>

      {!mounted ? (
        <div className="mt-12 section-card p-8 text-center">
          <p className="text-sm text-[#9890A8]">読み込み中…</p>
        </div>
      ) : owned.length === 0 ? (
        <>
          <GamificationHeader owned={owned} />
          <div className="mt-8 section-card p-8 text-center">
            <p className="text-[#9890A8] text-sm">まだ保有資産がありません。</p>
            <p className="mt-1 text-xs text-[#9890A8]">
              良質な知能資産を購入すると、ここに表示されます。
            </p>
            <Link href="/marketplace" className="btn-primary mt-5">
              Marketplace を見る →
            </Link>
          </div>
        </>
      ) : (
        <>
          <GamificationHeader owned={owned} />

          {/* Summary stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="section-card p-4">
              <p className="text-[11px] uppercase tracking-widest text-[#9890A8]">保有資産</p>
              <p className="mt-1 text-2xl font-bold text-kuroko tabular-nums">{owned.length}</p>
            </div>
            <div className="section-card p-4">
              <p className="text-[11px] uppercase tracking-widest text-[#9890A8]">AI 検品済み</p>
              <p className="mt-1 text-2xl font-bold text-kaki tabular-nums">{owned.length}</p>
            </div>
          </div>

          {/* Asset list */}
          <ul className="mt-5 space-y-3">
            {owned.map((record) => (
              <AssetCard key={record.assetId} record={record} />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
