import Link from "next/link";
import TrustScore from "@/components/trust-score/TrustScore";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-5xl font-bold tracking-tight">GUILD AI</h1>
      <p className="mt-3 text-lg text-kuroko/70">
        知能資産の登記と信用の循環経済圏。
      </p>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-kuroko/10 p-6">
          <h2 className="text-xl font-semibold">Proof of Thought</h2>
          <p className="mt-2 text-sm text-kuroko/70">
            CCAF (Cognitive Context Audit File) でプロセスを資産化。
          </p>
        </article>
        <article className="rounded-2xl border border-kuroko/10 p-6">
          <h2 className="text-xl font-semibold">Trust-Based Pricing</h2>
          <p className="mt-2 text-sm text-kuroko/70">
            Trust Score が高いほど Floor Price と露出を担保。
          </p>
        </article>
      </section>

      <section className="mt-10">
        <TrustScore
          ownerName="Demo Owner"
          input={{ qualityHistory: 78, discordContribution: 64, xAmplification: 52 }}
        />
      </section>

      <div className="mt-10">
        <Link
          href="/sell"
          className="inline-block rounded-xl bg-kuroko px-5 py-3 text-kami hover:bg-kuroko/90"
        >
          知能を登記する →
        </Link>
      </div>
    </main>
  );
}
