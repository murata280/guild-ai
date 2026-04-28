import { notFound } from "next/navigation";
import Link from "next/link";
import { MOCK_MARKETPLACE } from "@/lib/marketplace";
import { RankBadge } from "@/components/RankBadge";
import { PurchaseButton } from "@/components/PurchaseButton";

export function generateStaticParams() {
  return MOCK_MARKETPLACE.map((item) => ({ id: item.listing.id }));
}

export default function AssetPage({ params }: { params: { id: string } }) {
  const item = MOCK_MARKETPLACE.find((m) => m.listing.id === params.id);
  if (!item) notFound();

  const { listing, auditResult, trustScore } = item;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">

      {/* Back */}
      <Link href="/marketplace" className="text-xs text-[#9890A8] hover:text-kaki transition-colors">
        ← Marketplace に戻る
      </Link>

      {/* Title row */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold leading-tight text-kuroko">{listing.title}</h1>
        <RankBadge rank={listing.rank} />
      </div>

      <p className="mt-2 text-sm text-[#4A4464] leading-relaxed">{listing.description}</p>

      {listing.githubUrl && (
        <a
          href={listing.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-[#9890A8] underline hover:text-kaki transition-colors"
        >
          GitHub →
        </a>
      )}

      {/* Metrics */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="section-card p-4 overflow-hidden">
          <p className="text-[11px] uppercase tracking-widest text-[#9890A8] truncate">Trust</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-kuroko">{trustScore.score}</p>
          <p className="text-xs text-[#9890A8]">/ 1000</p>
        </div>
        <div className="section-card p-4 overflow-hidden">
          <p className="text-[11px] uppercase tracking-widest text-[#9890A8] truncate">CCAF</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-kuroko">{auditResult.score.toFixed(1)}</p>
          <p className="text-xs text-[#9890A8]">/ 100</p>
        </div>
        <div className="section-card p-4 overflow-hidden">
          <p className="text-[11px] uppercase tracking-widest text-[#9890A8] truncate">稼働</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-kuroko">{listing.vercelUptimeDays}</p>
          <p className="text-xs text-[#9890A8]">日</p>
        </div>
      </div>

      {/* CCAF detail */}
      <section className="mt-4 section-card p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#9890A8]">
          CCAF — Cognitive Context Audit File
        </h2>
        <dl className="mt-3 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#4A4464]">Thought Density</dt>
            <dd className="font-semibold tabular-nums text-kuroko">{listing.ccaf.thoughtDensity} / 100</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#4A4464]">Iterations</dt>
            <dd className="font-semibold tabular-nums text-kuroko">{listing.ccaf.iterations}</dd>
          </div>
          <div>
            <dt className="text-[#4A4464] mb-1.5">Intent Signals（魂の登記）</dt>
            {listing.ccaf.intentSignals.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {listing.ccaf.intentSignals.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-kaki/30 bg-kaki/10 px-2.5 py-0.5 text-xs text-kaki"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <dd className="text-xs text-[#9890A8]">なし（S ランク不可）</dd>
            )}
          </div>
        </dl>
      </section>

      {/* Audit reasons */}
      <section className="mt-3 section-card p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#9890A8]">
          AI Auditor 判定理由
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-[#4A4464]">
          {auditResult.reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="text-kaki mt-0.5">·</span>
              {r}
            </li>
          ))}
        </ul>
      </section>

      {/* Purchase section */}
      <section className="mt-4 section-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#9890A8]">Floor Price</p>
          <p className="text-3xl font-bold text-kuroko mt-0.5">
            ¥{listing.floorPrice.toLocaleString("ja-JP")}
          </p>
          <p className="text-xs text-[#9890A8] mt-0.5">
            Trust Score {trustScore.score} に基づく自動価格
          </p>
        </div>
        <PurchaseButton
          assetId={listing.id}
          assetTitle={listing.title}
          price={listing.floorPrice}
        />
      </section>

    </main>
  );
}
