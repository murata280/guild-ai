"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MOCK_MARKETPLACE,
  sortListings,
  filterListings,
  type SortKey,
} from "@/lib/marketplace";
import { RankBadge } from "@/components/RankBadge";
import { StepIndicator } from "@/components/StepIndicator";
import type { Rank, MarketplaceListing } from "@/types";

const SORT_LABELS: { key: SortKey; label: string }[] = [
  { key: "trust", label: "しんよう ポイント" },
  { key: "ccaf",  label: "あなたが 作った しょうこ" },
  { key: "price", label: "お値段" },
];

const ALL_RANKS: Rank[] = ["S", "A", "B"];

function MarketplaceContent() {
  const params = useSearchParams();

  const [sortKey, setSortKey] = useState<SortKey>("trust");
  const [filterRanks, setFilterRanks] = useState<Rank[]>(["S", "A", "B"]);
  const [minTrustScore, setMinTrustScore] = useState(0);
  const [customListings, setCustomListings] = useState<MarketplaceListing[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored: MarketplaceListing[] = JSON.parse(localStorage.getItem("guild_custom_listings") ?? "[]");
      setCustomListings(stored);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const id = params.get("highlight");
    if (id) {
      setHighlightId(id);
      const timer = setTimeout(() => setHighlightId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [params]);

  const allListings = useMemo(() => [...MOCK_MARKETPLACE, ...customListings], [customListings]);

  const items = useMemo(
    () => sortListings(filterListings(allListings, { ranks: filterRanks, minTrustScore }), sortKey),
    [allListings, sortKey, filterRanks, minTrustScore]
  );

  const toggleRank = (rank: Rank) => {
    setFilterRanks((prev) => prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank]);
  };

  const isMock = (id: string) => MOCK_MARKETPLACE.some((m) => m.listing.id === id);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">

      <StepIndicator current="distribute" />

      <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kuroko leading-snug">お店（マーケット）</h1>
          <p className="mt-1 text-base text-[#9890A8] leading-relaxed">
            鑑定済み知能資産の一覧。良質な出品ほど高評価・高価格で表示される。
          </p>
        </div>
        <Link href="/sell" className="btn-primary shrink-0" aria-label="知能を出品する">
          出品する →
        </Link>
      </div>

      {/* Controls */}
      <div className="mt-6 section-card p-4 flex flex-wrap gap-5 items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9890A8]">並び順</p>
          <div className="flex gap-1.5 flex-wrap">
            {SORT_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                aria-pressed={sortKey === key}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all active:scale-[0.97] ${
                  sortKey === key
                    ? "border-kaki bg-kaki text-white"
                    : "border-kuroko/20 text-[#3A3664] hover:border-kaki/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9890A8]">ランク</p>
          <div className="flex gap-1.5">
            {ALL_RANKS.map((rank) => (
              <button
                key={rank}
                onClick={() => toggleRank(rank)}
                aria-pressed={filterRanks.includes(rank)}
                aria-label={`ランク${rank}でフィルタ`}
                className={`rounded-lg border px-3 py-1.5 text-sm font-bold transition-all active:scale-[0.97] ${
                  filterRanks.includes(rank)
                    ? rank === "S"
                      ? "border-kaki bg-kaki text-white"
                      : rank === "A"
                      ? "border-zinc-400 bg-zinc-300 text-kuroko"
                      : "border-amber-800 bg-amber-700 text-white"
                    : "border-kuroko/20 text-[#9890A8]"
                }`}
              >
                {rank}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9890A8]">
            しんよう ポイント（さいてい）: <span className="text-kuroko font-bold">{minTrustScore}</span>
          </p>
          <input
            type="range"
            min={0} max={900} step={50}
            value={minTrustScore}
            onChange={(e) => setMinTrustScore(Number(e.target.value))}
            aria-label="最低信用スコアフィルタ"
            className="w-32 accent-kaki"
          />
        </div>

        <p className="ml-auto text-sm text-[#9890A8] self-end">{items.length} 件</p>
      </div>

      {/* Asset grid */}
      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-base text-[#9890A8]">条件に一致する資産がありません。</p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const isNew = item.listing.id === highlightId;
            const hasDetailPage = isMock(item.listing.id);
            const cardClass = `section-card block p-4 transition-all active:scale-[0.97] hover:shadow-card-hover relative ${
              isNew ? "ring-2 ring-kaki animate-pulse" : ""
            }`;

            const content = (
              <>
                {/* Rank badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <RankBadge rank={item.listing.rank} large />
                  {isNew && (
                    <span className="text-[10px] font-semibold text-kaki uppercase tracking-widest">NEW</span>
                  )}
                </div>

                <h2 className="text-base font-semibold leading-snug text-kuroko line-clamp-2">
                  {item.listing.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-[#9890A8] leading-relaxed">
                  {item.listing.description}
                </p>

                <dl className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <dt className="text-[#9890A8]">しんよう ポイント</dt>
                    <dd className="font-semibold tabular-nums text-kuroko">
                      {item.trustScore.score} <span className="text-[#9890A8] font-normal">/ 1000</span>
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-[#9890A8]">あなたが 作った しょうこ</dt>
                    <dd className="font-semibold tabular-nums text-kuroko">{item.auditResult.score.toFixed(1)}</dd>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-kuroko/10">
                    <dt className="text-sm text-[#9890A8]">お値段</dt>
                    <dd>
                      <span className="text-xl font-bold text-kuroko">
                        ¥{item.listing.floorPrice.toLocaleString("ja-JP")}
                      </span>
                    </dd>
                  </div>
                </dl>
              </>
            );

            return (
              <li key={item.listing.id}>
                {hasDetailPage ? (
                  <Link href={`/asset/${item.listing.id}`} className={cardClass} aria-label={`${item.listing.title}の詳細を見る`}>
                    {content}
                  </Link>
                ) : (
                  <div className={cardClass}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        <div className="mt-12 section-card p-8 text-center">
          <p className="text-base text-[#9890A8]">読み込み中…</p>
        </div>
      </main>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
