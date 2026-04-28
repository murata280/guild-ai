import { notFound } from "next/navigation";
import Link from "next/link";
import { MOCK_MARKETPLACE } from "@/lib/marketplace";
import { RankBadge } from "@/components/RankBadge";
import { CheckoutSection } from "@/components/CheckoutSection";
import { ValuationSection } from "@/components/ValuationSection";

export function generateStaticParams() {
  return MOCK_MARKETPLACE.map((item) => ({ id: item.listing.id }));
}

export default function AssetPage({ params }: { params: { id: string } }) {
  const item = MOCK_MARKETPLACE.find((m) => m.listing.id === params.id);
  if (!item) notFound();

  const { listing, auditResult, trustScore } = item;

  const curlSample = `curl -X POST https://guild-ai.vercel.app/api/atoa/${listing.id} \\
  -H "Authorization: Bearer gld_<YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "タスクを入力してください", "agentId": "agent-xyz"}'`;

  const jsonPayload = JSON.stringify(
    {
      input: "タスクを入力してください",
      agentId: "agent-xyz",
      sessionId: "chk_...",
    },
    null,
    2
  );

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

      {/* クリエイターのこだわり (Proof of Make) */}
      {listing.proofOfMakeNote && (
        <section className="mt-4 section-card p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#9890A8]">
            クリエイターのこだわり（制作の証明）
          </h2>
          <p className="mt-3 text-sm text-[#4A4464] leading-relaxed whitespace-pre-wrap">
            {listing.proofOfMakeNote}
          </p>
        </section>
      )}

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="section-card p-4 overflow-hidden">
          <p className="text-[11px] uppercase tracking-widest text-[#9890A8] truncate">Trust</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-kuroko">{trustScore.score}</p>
          <p className="text-xs text-[#9890A8]">/ 1000</p>
        </div>
        <div className="section-card p-4 overflow-hidden">
          <p className="text-[11px] uppercase tracking-widest text-[#9890A8] truncate">制作の証明</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-kuroko">{auditResult.score.toFixed(1)}</p>
          <p className="text-xs text-[#9890A8]">/ 100</p>
        </div>
        <div className="section-card p-4 overflow-hidden">
          <p className="text-[11px] uppercase tracking-widest text-[#9890A8] truncate">稼働</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-kuroko">{listing.vercelUptimeDays}</p>
          <p className="text-xs text-[#9890A8]">日</p>
        </div>
      </div>

      {/* AI Valuation Radar + Will Signal Trigger */}
      <ValuationSection
        rank={listing.rank}
        floorPrice={listing.floorPrice}
        thoughtDensity={listing.ccaf.thoughtDensity}
        iterations={listing.ccaf.iterations}
        uptimeDays={listing.vercelUptimeDays}
        justification={auditResult.justification}
      />

      {/* CCAF detail */}
      <section className="mt-4 section-card p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#9890A8]">
          制作の証明 — Proof of Make
        </h2>
        <dl className="mt-3 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#4A4464]">思考密度</dt>
            <dd className="font-semibold tabular-nums text-kuroko">{listing.ccaf.thoughtDensity} / 100</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#4A4464]">試行回数</dt>
            <dd className="font-semibold tabular-nums text-kuroko">{listing.ccaf.iterations}</dd>
          </div>
          <div>
            <dt className="text-[#4A4464] mb-1.5">意思シグナル（魂の登記）</dt>
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
          AI 鑑定士 判定理由
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

      {/* Hybrid Checkout — Dual Payment Interface */}
      <CheckoutSection
        assetId={listing.id}
        assetTitle={listing.title}
        price={listing.floorPrice}
      />

      {/* API Hotbed — エージェント直接呼び出し */}
      <section className="mt-4 section-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#9890A8]">
            API Hotbed — エンドポイント
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-kaki/20 bg-kaki/5 px-3 py-1 text-[11px] font-semibold text-kaki">
            AtoA API 対応
          </span>
        </div>
        <p className="mt-2 text-sm text-[#4A4464]">
          AIエージェントが直接呼び出せます — 人間の介在なしに購入・実行が完結します。
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9890A8] mb-1.5">
              エンドポイント
            </p>
            <code className="block rounded-lg bg-kuroko px-3 py-2 text-xs font-mono text-accent-green break-all">
              POST https://guild-ai.vercel.app/api/atoa/{listing.id}
            </code>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9890A8] mb-1.5">
              curl サンプル
            </p>
            <pre className="rounded-lg bg-kuroko px-3 py-2 text-xs font-mono text-kami overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {curlSample}
            </pre>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9890A8] mb-1.5">
              JSON ペイロード
            </p>
            <pre className="rounded-lg bg-kuroko px-3 py-2 text-xs font-mono text-kami overflow-x-auto">
              {jsonPayload}
            </pre>
          </div>
        </div>
      </section>

    </main>
  );
}
