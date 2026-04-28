import Link from "next/link";
import TrustScore from "@/components/trust-score/TrustScore";

export default function HomePage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="py-8 sm:py-12">
        <span className="inline-block rounded-full border border-kaki/40 bg-kaki/10 px-3 py-1 text-xs font-semibold text-kaki">
          GUILD AI
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-kuroko">
          思想を登記すれば、<br />
          <span className="text-kaki">AIが買いに来る。</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-[#4A4464] leading-relaxed">
          Trust Score が高いほど露出と Floor Price が上がる。<br />
          良質な知能資産を出品すると、市場が自動で評価する。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/marketplace" className="btn-primary">
            Marketplace を見る →
          </Link>
          <Link href="/sell" className="btn-secondary">
            今すぐ出品する
          </Link>
        </div>
      </section>

      {/* ── Value props ───────────────────────────────────── */}
      <section className="mt-4 grid gap-4 sm:grid-cols-3">
        <article className="section-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-kaki">Trust Score</p>
          <h2 className="mt-2 text-base font-bold text-kuroko leading-snug">
            スコアが高いほど売れやすくなる
          </h2>
          <p className="mt-2 text-sm text-[#4A4464] leading-relaxed">
            制作の証明（思考密度・こだわり）・Discord 貢献・X 拡散が加重合算され、Floor Price と露出量に直結する。
          </p>
        </article>
        <article className="section-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-kaki">AI Auditor</p>
          <h2 className="mt-2 text-base font-bold text-kuroko leading-snug">
            S ランクは最大 +50% プレミアム
          </h2>
          <p className="mt-2 text-sm text-[#4A4464] leading-relaxed">
            AI 鑑定士が意図の密度と稼働実績を審査。魂の登記を通過した S ランク資産は自動的に高値で表示される。
          </p>
        </article>
        <article className="section-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-kaki">Royalty</p>
          <h2 className="mt-2 text-base font-bold text-kuroko leading-snug">
            出品するほど収益が積み上がる
          </h2>
          <p className="mt-2 text-sm text-[#4A4464] leading-relaxed">
            二次販売のたびに祖先クリエイターへロイヤリティが自動還元。信用スコアも連動して伸び続ける。
          </p>
        </article>
      </section>

      {/* ── Trust Score Demo ──────────────────────────────── */}
      <section className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9890A8] mb-3">
          Trust Score デモ
        </p>
        <TrustScore
          ownerName="Demo Owner"
          input={{ qualityHistory: 78, discordContribution: 64, xAmplification: 52 }}
        />
      </section>

      {/* ── Bottom CTA ────────────────────────────────────── */}
      <section className="mt-10 section-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-kuroko">今すぐ知能資産を出品する</h2>
          <p className="mt-1 text-sm text-[#4A4464]">
            良質な出品が、自動的に売れる市場へ。
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Link href="/sell" className="btn-primary">出品する →</Link>
          <Link href="/marketplace" className="btn-secondary">市場を見る</Link>
        </div>
      </section>

    </main>
  );
}
