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
import { StarRating } from "@/components/StarRating";
import { StepIndicator } from "@/components/StepIndicator";
import type { Rank, MarketplaceListing } from "@/types";
import { ShoppingBagIcon } from "@/components/icons";
import { HumanThumbnail } from "@/components/HumanThumbnail";
import { FlipCard } from "@/components/FlipCard";
import { ActivityPulse } from "@/components/ActivityPulse";
import { generatePersonaCards, type Persona } from "@/lib/persona-cards";
import { useLazyMount } from "@/hooks/useLazyMount";

interface LazyMarketplaceCardProps {
  item: MarketplaceListing;
  isNew: boolean;
  hasDetailPage: boolean;
  persona: Persona;
}

function LazyMarketplaceCard({ item, isNew, hasDetailPage, persona }: LazyMarketplaceCardProps) {
  const { ref, mounted } = useLazyMount();
  const personaCards = generatePersonaCards(item);
  const personaCard = personaCards[persona];

  const frontContent = (
    <div className={`section-card p-4 transition-all ${isNew ? "ring-2 ring-kaki animate-pulse" : ""}`}>
      <div className="aspect-[3/2] bg-gradient-to-br from-kami to-kaki/5 rounded-xl flex items-center justify-center relative mb-3 overflow-hidden">
        <HumanThumbnail assetId={item.listing.id} title={item.listing.title} rank={item.listing.rank} size={80} />
        <div className="absolute top-2 right-2">
          <RankBadge rank={item.listing.rank} large />
        </div>
        {isNew && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold text-kaki uppercase tracking-widest">NEW</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {personaCard.emotionalTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-kaki/10 border border-kaki/20 px-2 py-0.5 text-[10px] font-semibold text-kaki"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold leading-snug text-kuroko line-clamp-2 flex-1">
          {personaCard.headline}
        </h2>
        <StarRating rank={item.listing.rank} size="sm" />
      </div>

      <ul className="mt-2 space-y-1">
        {personaCard.bullets.slice(0, 2).map((bullet) => (
          <li key={bullet} className="flex gap-1.5 text-xs text-[#4A4464]">
            <span className="text-kaki mt-0.5">·</span>
            {bullet}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-baseline justify-between border-t border-kuroko/10 pt-2">
        <span className="text-sm text-[#9890A8]">{personaCard.priceCallout}</span>
        <span className="text-xs font-semibold text-kaki">{personaCard.ctaLabel}</span>
      </div>

      {hasDetailPage && (
        <p className="mt-2 text-[10px] text-[#9890A8] text-right">ホバーで技術仕様を見る →</p>
      )}
    </div>
  );

  const backContent = (
    <div className="section-card p-4 bg-kuroko text-kami h-full min-h-[300px] flex flex-col gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">技術仕様</p>
      <pre className="text-[10px] font-mono text-accent-green leading-relaxed overflow-hidden">
{JSON.stringify({ id: item.listing.id, rank: item.listing.rank, trustScore: item.trustScore.score, floorPrice: item.listing.floorPrice }, null, 2)}
      </pre>
      <div className="mt-auto">
        <p className="text-[10px] text-white/40 mb-1">エージェント向け接続</p>
        <code className="text-[10px] font-mono text-accent-green break-all">
          curl /api/atoa/{item.listing.id}
        </code>
      </div>
      <ul className="space-y-1">
        {item.auditResult.reasons.slice(0, 2).map((r) => (
          <li key={r} className="text-[10px] text-white/60 flex gap-1"><span className="text-kaki">·</span>{r}</li>
        ))}
      </ul>
      <ActivityPulse assetId={item.listing.id} />
      {hasDetailPage && (
        <Link
          href={`/asset/${item.listing.id}`}
          className="mt-1 inline-flex items-center justify-center rounded-lg bg-kaki px-3 py-1.5 text-xs font-bold text-white"
          onClick={(e) => e.stopPropagation()}
        >
          詳細を見る →
        </Link>
      )}
    </div>
  );

  return (
    <div ref={ref}>
      {mounted ? (
        <FlipCard front={frontContent} back={backContent} />
      ) : (
        <div className="section-card aspect-[3/2] animate-pulse bg-kuroko/5" aria-hidden="true" />
      )}
    </div>
  );
}

const SORT_LABELS: { key: SortKey; label: string }[] = [
  { key: "trust", label: "信用スコア" },
  { key: "ccaf",  label: "こだわり（実績）" },
  { key: "price", label: "価格" },
];

const ALL_RANKS: Rank[] = ["S", "A", "B"];

function MarketplaceContent() {
  const params = useSearchParams();

  const [sortKey, setSortKey] = useState<SortKey>("trust");
  const [filterRanks, setFilterRanks] = useState<Rank[]>(["S", "A", "B"]);
  const [minTrustScore, setMinTrustScore] = useState(0);
  const [customListings, setCustomListings] = useState<MarketplaceListing[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona>("general");

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
          <h1 className="text-2xl font-bold tracking-tight text-kuroko leading-snug flex items-center gap-2"><ShoppingBagIcon size={22} className="text-kaki" />🏦 保管庫（スキルの貯金箱）</h1>
          <p className="mt-1 text-base text-[#9890A8] leading-relaxed">
            AI評価済みスキル資産の保管庫。良質なたからものほど高評価・高価格で表示されます。
          </p>
        </div>
        <Link href="/sell" className="btn-primary shrink-0" aria-label="スキルを資産として登録する">
          登録する →
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
            最低 信用スコア: <span className="text-kuroko font-bold">{minTrustScore}</span>
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

        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9890A8]">表示スタイル</legend>
          <div className="flex gap-1.5">
            {(["general", "pm", "engineer"] as Persona[]).map((p) => (
              <button key={p} onClick={() => setPersona(p)} aria-pressed={persona === p}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all active:scale-[0.97] ${
                  persona === p ? "border-kaki bg-kaki text-white" : "border-kuroko/20 text-[#3A3664] hover:border-kaki/40"
                }`}>
                {p === "general" ? "一般" : p === "pm" ? "PM" : "エンジニア"}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="ml-auto text-sm text-[#9890A8] self-end">{items.length} 件</p>
      </div>

      {/* Asset grid */}
      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-base text-[#9890A8]">条件に一致する資産がありません。</p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.listing.id}>
              <LazyMarketplaceCard
                item={item}
                isNew={item.listing.id === highlightId}
                hasDetailPage={isMock(item.listing.id)}
                persona={persona}
              />
            </li>
          ))}
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
