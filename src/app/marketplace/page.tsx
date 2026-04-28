"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MOCK_MARKETPLACE,
  sortListings,
  filterListings,
  type SortKey,
} from "@/lib/marketplace";
import { RankBadge } from "@/components/RankBadge";
import type { Rank } from "@/types";

const SORT_LABELS: { key: SortKey; label: string }[] = [
  { key: "trust", label: "Trust Score順" },
  { key: "ccaf", label: "CCAF順" },
  { key: "price", label: "Floor Price順" },
];

const ALL_RANKS: Rank[] = ["S", "A", "B"];

export default function MarketplacePage() {
  const [sortKey, setSortKey] = useState<SortKey>("trust");
  const [filterRanks, setFilterRanks] = useState<Rank[]>(["S", "A", "B"]);
  const [minTrustScore, setMinTrustScore] = useState(0);

  const items = useMemo(
    () =>
      sortListings(
        filterListings(MOCK_MARKETPLACE, { ranks: filterRanks, minTrustScore }),
        sortKey
      ),
    [sortKey, filterRanks, minTrustScore]
  );

  const toggleRank = (rank: Rank) => {
    setFilterRanks((prev) =>
      prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank]
    );
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Marketplace</h1>
      <p className="mt-2 text-sm text-kuroko/60">
        鑑定済み知能資産の一覧。CCAF・Trust Score・Floor Price を比較して選択。
      </p>

      {/* Controls */}
      <div className="mt-8 flex flex-wrap gap-6">
        {/* Sort */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-kuroko/50">
            並び順
          </p>
          <div className="flex gap-2">
            {SORT_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
                  sortKey === key
                    ? "border-kuroko bg-kuroko text-kami"
                    : "border-kuroko/20 text-kuroko hover:border-kuroko/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Rank filter */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-kuroko/50">
            ランク
          </p>
          <div className="flex gap-2">
            {ALL_RANKS.map((rank) => (
              <button
                key={rank}
                onClick={() => toggleRank(rank)}
                className={`rounded-lg border px-3 py-1 text-sm font-semibold transition-colors ${
                  filterRanks.includes(rank)
                    ? rank === "S"
                      ? "border-kaki bg-kaki text-kuroko"
                      : rank === "A"
                      ? "border-zinc-400 bg-zinc-300 text-kuroko"
                      : "border-amber-800 bg-amber-700 text-white"
                    : "border-kuroko/20 text-kuroko/40"
                }`}
              >
                {rank}
              </button>
            ))}
          </div>
        </div>

        {/* Min Trust Score */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-kuroko/50">
            最低 Trust Score: <span className="text-kuroko">{minTrustScore}</span>
          </p>
          <input
            type="range"
            min={0}
            max={900}
            step={50}
            value={minTrustScore}
            onChange={(e) => setMinTrustScore(Number(e.target.value))}
            className="w-40 accent-kuroko"
          />
        </div>
      </div>

      {/* Listing count */}
      <p className="mt-6 text-xs text-kuroko/50">{items.length} 件</p>

      {/* Asset grid */}
      {items.length === 0 ? (
        <p className="mt-12 text-center text-kuroko/40">
          条件に一致する資産がありません。フィルタを緩めてください。
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.listing.id}>
              <Link
                href={`/asset/${item.listing.id}`}
                className="block rounded-2xl border border-kuroko/10 bg-white/60 p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold leading-snug">{item.listing.title}</h2>
                  <RankBadge rank={item.listing.rank} />
                </div>

                <p className="mt-2 line-clamp-2 text-xs text-kuroko/60">
                  {item.listing.description}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-kuroko/50">Trust Score</dt>
                    <dd className="font-semibold tabular-nums">{item.trustScore.score} / 1000</dd>
                  </div>
                  <div>
                    <dt className="text-kuroko/50">CCAF</dt>
                    <dd className="font-semibold tabular-nums">{item.auditResult.score.toFixed(1)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-kuroko/50">Floor Price</dt>
                    <dd className="text-base font-bold">
                      ¥{item.listing.floorPrice.toLocaleString("ja-JP")}
                    </dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
