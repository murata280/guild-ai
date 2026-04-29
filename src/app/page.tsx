import Link from "next/link";
import TrustScore from "@/components/trust-score/TrustScore";
import { PackageIcon, SearchIcon, ShoppingBagIcon, BanknoteIcon } from "@/components/icons";

// ─── 4-step flow ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    Icon: PackageIcon,
    label: "たからもの登録",
    desc: "GitHubを選ぶだけ、AIが自動提案",
    color: "text-kaki",
    bg: "bg-kaki/10 border-kaki/20",
  },
  {
    Icon: SearchIcon,
    label: "AIが評価する",
    desc: "品質を自動で判定",
    color: "text-[#9B6BB5]",
    bg: "bg-[#9B6BB5]/10 border-[#9B6BB5]/20",
  },
  {
    Icon: ShoppingBagIcon,
    label: "マーケットに並ぶ",
    desc: "世界中に自動で公開",
    color: "text-accent-green",
    bg: "bg-accent-green/10 border-accent-green/20",
  },
  {
    Icon: BanknoteIcon,
    label: "買われたら自動でお金が入る",
    desc: "寝ている間も分身が稼ぐ",
    color: "text-kaki",
    bg: "bg-kaki/5 border-kaki/20",
  },
] as const;

export default function HomePage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

      {/* ── Hero + 4-step (first viewport) ───────────────── */}
      <section className="min-h-[80vh] flex flex-col justify-center py-10 sm:py-14">
        <span className="inline-block rounded-full border border-kaki/40 bg-kaki/10 px-3 py-1 text-xs font-semibold text-kaki">
          GUILD AI
        </span>

        <h1 className="mt-4 text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-kuroko">
          思想を登記すれば、<br />
          <span className="text-kaki">AIが買いに来る。</span>
        </h1>

        {/* Butler-tone explainer */}
        <p className="mt-4 max-w-xl text-sm sm:text-base text-[#4A4464] leading-relaxed">
          あなたのスキルやコードを「たからもの」として登録すると、世界中の人やAIが利用料を払って使ってくれます。
          寝ている間も、あなたの分身が稼ぎ続ける場所です。
        </p>
        <p className="mt-2 text-sm text-kaki font-semibold">
          自慢が、そのまま"たからもの"になる場所です。
        </p>

        {/* 4-step flow cards */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="サービスの流れ">
          {STEPS.map(({ Icon, label, desc, color, bg }, i) => (
            <div
              key={label}
              className={`section-card border ${bg} p-4 flex flex-col items-center text-center gap-2`}
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-xs text-[#9890A8] font-semibold">Step {i + 1}</p>
                <p className="text-sm font-bold text-kuroko leading-snug">{label}</p>
                <p className="mt-0.5 text-xs text-[#9890A8] leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-8 flex flex-wrap gap-3 items-center">
          <Link href="/marketplace" className="btn-primary" aria-label="マーケットを見る">
            マーケットを見る →
          </Link>
          <Link href="/sell" className="btn-secondary" aria-label="たからもの登録する">
            たからもの登録する
          </Link>
          <Link
            href="/sell"
            className="text-sm text-[#9890A8] underline hover:text-kaki transition-colors"
            aria-label="使い方をもっと見る"
          >
            使い方をもっと見る
          </Link>
        </div>
      </section>

      {/* ── Why you can trust us ──────────────────────────── */}
      <section className="pb-10 sm:pb-14" aria-labelledby="trust-heading">
        <h2
          id="trust-heading"
          className="text-xs font-semibold uppercase tracking-widest text-[#9890A8] mb-4"
        >
          なぜ信頼できるのか
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <article className="section-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-kaki">信用スコア</p>
            <h3 className="mt-2 text-base font-bold text-kuroko leading-snug">
              スコアが高いほど売れやすくなる
            </h3>
            <p className="mt-2 text-sm text-[#4A4464] leading-relaxed">
              こだわり（実績ログ）・コミュニティ貢献・拡散実績が加重合算され、価格と露出量に直結します。
            </p>
          </article>
          <article className="section-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-kaki">AI評価</p>
            <h3 className="mt-2 text-base font-bold text-kuroko leading-snug">
              お墨付きランクは最大 +50% 高値
            </h3>
            <p className="mt-2 text-sm text-[#4A4464] leading-relaxed">
              AIが意図の深さと稼働実績を審査します。お墨付き（Sランク）資産は自動的に高値で表示されます。
            </p>
          </article>
          <article className="section-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-kaki">還元（リワード）</p>
            <h3 className="mt-2 text-base font-bold text-kuroko leading-snug">
              登録するほど収益が積み上がる
            </h3>
            <p className="mt-2 text-sm text-[#4A4464] leading-relaxed">
              二次利用のたびに、作者へ自動で還元が分配されます。信用スコアも連動して伸び続けます。
            </p>
          </article>
        </div>
      </section>

      {/* ── Trust Score Demo ──────────────────────────────── */}
      <section className="pb-10" aria-labelledby="demo-heading">
        <p
          id="demo-heading"
          className="text-xs font-semibold uppercase tracking-widest text-[#9890A8] mb-3"
        >
          信用スコア デモ
        </p>
        <TrustScore
          ownerName="Demo Owner"
          input={{ qualityHistory: 78, discordContribution: 64, xAmplification: 52 }}
        />
      </section>

      {/* ── Bottom CTA ────────────────────────────────────── */}
      <section
        className="mb-10 section-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        aria-label="スキルを登録して収益化する"
      >
        <div>
          <h2 className="font-bold text-kuroko">今すぐ「たからもの登録」する</h2>
          <p className="mt-1 text-sm text-[#4A4464] leading-relaxed">
            GitHubを選ぶだけ、AIが売れるロジックを自動提案。
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0 flex-wrap">
          <Link href="/sell" className="btn-primary" aria-label="たからもの登録する">
            たからもの登録する →
          </Link>
          <Link href="/marketplace" className="btn-secondary" aria-label="マーケットを見る">
            マーケットを見る
          </Link>
        </div>
      </section>

    </main>
  );
}
