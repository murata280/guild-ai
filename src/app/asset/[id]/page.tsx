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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/marketplace"
        className="text-sm text-kuroko/50 hover:text-kuroko"
      >
        ← Marketplace に戻る
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold leading-tight">{listing.title}</h1>
        <RankBadge rank={listing.rank} />
      </div>

      <p className="mt-3 text-kuroko/70">{listing.description}</p>

      {listing.githubUrl && (
        <a
          href={listing.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-kuroko/50 underline hover:text-kuroko"
        >
          GitHub →
        </a>
      )}

      {/* Metrics grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-kuroko/10 p-4">
          <p className="text-xs uppercase tracking-widest text-kuroko/50">Trust Score</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{trustScore.score}</p>
          <p className="text-xs text-kuroko/40">/ 1000</p>
        </div>
        <div className="rounded-2xl border border-kuroko/10 p-4">
          <p className="text-xs uppercase tracking-widest text-kuroko/50">CCAF スコア</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{auditResult.score.toFixed(1)}</p>
          <p className="text-xs text-kuroko/40">/ 100</p>
        </div>
        <div className="rounded-2xl border border-kuroko/10 p-4">
          <p className="text-xs uppercase tracking-widest text-kuroko/50">Vercel 稼働</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{listing.vercelUptimeDays}</p>
          <p className="text-xs text-kuroko/40">日</p>
        </div>
      </div>

      {/* CCAF detail */}
      <section className="mt-8 rounded-2xl border border-kuroko/10 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-kuroko/50">
          CCAF — Cognitive Context Audit File
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-kuroko/60">Thought Density</dt>
            <dd className="font-semibold tabular-nums">{listing.ccaf.thoughtDensity} / 100</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-kuroko/60">Iterations</dt>
            <dd className="font-semibold tabular-nums">{listing.ccaf.iterations}</dd>
          </div>
          <div>
            <dt className="text-kuroko/60">Intent Signals（魂の登記）</dt>
            {listing.ccaf.intentSignals.length > 0 ? (
              <ul className="mt-1 flex flex-wrap gap-1">
                {listing.ccaf.intentSignals.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-kaki/50 bg-kaki/10 px-2 py-0.5 text-xs"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <dd className="mt-1 text-xs text-kuroko/40">なし（S ランク不可）</dd>
            )}
          </div>
        </dl>
      </section>

      {/* Audit reasons */}
      <section className="mt-4 rounded-2xl border border-kuroko/10 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-kuroko/50">
          Auditor 判定理由
        </h2>
        <ul className="mt-3 space-y-1 text-sm text-kuroko/70">
          {auditResult.reasons.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
      </section>

      {/* Purchase */}
      <div className="mt-10 flex items-center gap-4">
        <div>
          <p className="text-xs text-kuroko/50">Floor Price</p>
          <p className="text-2xl font-bold">¥{listing.floorPrice.toLocaleString("ja-JP")}</p>
        </div>
        <PurchaseButton
          assetId={listing.id}
          assetTitle={listing.title}
          price={listing.floorPrice}
        />
      </div>
    </main>
  );
}
