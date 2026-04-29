"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shimaenaga } from "@/components/Shimaenaga";
import { Confetti } from "@/components/Confetti";
import { RankBadge } from "@/components/RankBadge";
import { MOCK_JOBS, checkJobEligibility, applyToJob, getApplications } from "@/lib/jobs";
import { getWeapons } from "@/lib/weapons";
import { playPassbookChime } from "@/lib/sound";
import { useTactile } from "@/hooks/useTactile";
import type { Weapon, Job } from "@/types";

// ─── Shimaenaga hint bubble ───────────────────────────────────────────────────

function HintBubble({ hint, weaponTitle }: { hint: string; weaponTitle?: string }) {
  const [open, setOpen] = useState(false);
  const msg = weaponTitle
    ? `この武器（${weaponTitle}）が あれば クリアできるよ！`
    : hint;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] text-ink-muted hover:text-gold transition-colors"
        aria-label="シマエナガのヒントをみる"
      >
        <Shimaenaga variant="wave" size="xs" mode="avatar" aria-hidden />
        <span>ヒント</span>
      </button>
      {open && (
        <div className="absolute bottom-7 left-0 z-20 w-52 rounded-2xl bg-white border-2 border-gold-soft shadow-lg p-3 text-xs text-ink leading-snug">
          <div className="flex items-start gap-2">
            <Shimaenaga variant="trust" size="xs" mode="avatar" className="shrink-0 mt-0.5" />
            <p>{msg}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold text-white text-[10px] flex items-center justify-center"
            aria-label="ヒントをとじる"
          >×</button>
          {/* Bubble tail */}
          <div className="mt-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#F2DFA0] ml-3" />
        </div>
      )}
    </div>
  );
}

// ─── Job card ─────────────────────────────────────────────────────────────────

function JobCard({
  job,
  weapons,
  appliedIds,
  onApply,
}: {
  job: Job;
  weapons: Weapon[];
  appliedIds: Set<string>;
  onApply: (jobId: string, reward: number) => void;
}) {
  const eligibility = checkJobEligibility(weapons, job);
  const alreadyApplied = appliedIds.has(job.id);

  const cardClass = eligibility.canApply && !alreadyApplied
    ? "section-card p-5 border-2 border-gold job-gold-glow transition-all"
    : "section-card p-5 border border-ink/10 transition-all";

  return (
    <li className={cardClass + (!eligibility.canApply && !alreadyApplied ? " opacity-60" : "")}>
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest">{job.category}</span>
            <RankBadge rank={job.requiredRank} friendly />
          </div>
          <h2 className="mt-1 text-base font-bold text-ink leading-snug">{job.title}</h2>
          <p className="mt-1 text-sm text-ink-muted leading-relaxed line-clamp-2">{job.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-accent-green tabular-nums">¥{job.reward.toLocaleString("ja-JP")}</p>
          <p className="text-[10px] text-ink-muted">おだちん</p>
        </div>
      </div>

      {/* Required tags with have/missing marks */}
      {job.requiredTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.requiredTags.map((tag) => {
            const owned = weapons.some((w) => w.tags.includes(tag));
            return (
              <span
                key={tag}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                  owned
                    ? "bg-gold-light border-gold/40 text-[#7A5000]"
                    : "bg-ink/5 border-ink/15 text-ink-muted"
                }`}
              >
                {owned ? "✓" : "まだない"} {tag}
              </span>
            );
          })}
        </div>
      )}

      {alreadyApplied ? (
        <div className="mt-2 rounded-2xl bg-accent-green/10 border border-accent-green/20 px-3 py-2 text-sm text-accent-green font-semibold text-center">
          ✓ えらんでもらえた！ おだちんうけとりました
        </div>
      ) : eligibility.canApply ? (
        <button
          type="button"
          onClick={() => onApply(job.id, job.reward)}
          className="mt-2 w-full rounded-2xl bg-gradient-to-r from-gold to-timee-yellow text-[#7A5000] font-bold py-2.5 text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
          aria-label={`${job.title}にえらんでもらう`}
        >
          ⚔️ えらんでもらう →
        </button>
      ) : (
        <div className="mt-2 space-y-1.5">
          <div className="rounded-2xl bg-ink/5 border border-ink/10 px-3 py-2 text-xs text-ink-muted text-center">
            🔒 {eligibility.hint}
          </div>
          <div className="flex items-center justify-between">
            <HintBubble hint={eligibility.hint} weaponTitle={eligibility.matchedWeapon?.title} />
            <Link href="/bank" className="text-xs text-gold hover:underline">シマエナガ銀行でぶきをつくる →</Link>
          </div>
        </div>
      )}
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [confetti, setConfetti] = useState(false);
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerQuest = useTactile("quest");

  useEffect(() => {
    setMounted(true);
    setWeapons(getWeapons());
    const apps = getApplications();
    setAppliedIds(new Set(apps.map((a) => a.jobId)));
  }, []);

  function handleApply(jobId: string, reward: number) {
    const weapon = weapons[0];
    if (!weapon) return;
    applyToJob(jobId, weapon.id, reward);
    setAppliedIds((prev) => new Set([...prev, jobId]));
    setLastReward(reward);
    playPassbookChime();
    triggerQuest();
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2000);
  }

  const canApplyCount = mounted
    ? MOCK_JOBS.filter((j) => checkJobEligibility(weapons, j).canApply && !appliedIds.has(j.id)).length
    : 0;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      <Confetti active={confetti} duration={1800} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Shimaenaga variant="key" size="md" mode="avatar" />
          <div>
            <h1 className="text-2xl font-bold text-ink">いまスグできる おねがい（クエスト）</h1>
            <p className="text-sm text-ink-muted">ぶきをそうびして かせごう</p>
          </div>
        </div>
        <Link href="/bank" className="rounded-2xl bg-gradient-to-r from-gold to-timee-yellow text-[#7A5000] font-bold px-4 py-2 text-sm shrink-0" aria-label="シマエナガ銀行へ">
          + ぶきをつくる
        </Link>
      </div>

      {/* Stats bar */}
      {mounted && (
        <div className="section-card p-4 mb-5 flex flex-wrap gap-4 border border-gold-soft">
          <div>
            <p className="text-xs text-ink-muted">もっているぶき</p>
            <p className="text-xl font-bold text-ink tabular-nums">{weapons.length} ほん</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">できるクエスト</p>
            <p className="text-xl font-bold text-gold tabular-nums">{canApplyCount} けん</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">おうぼずみ</p>
            <p className="text-xl font-bold text-accent-green tabular-nums">{appliedIds.size} けん</p>
          </div>
          {lastReward && (
            <div className="ml-auto flex items-center gap-2 rounded-2xl bg-accent-green/10 border border-accent-green/20 px-4 py-2">
              <span className="text-lg animate-bounce">🎉</span>
              <div>
                <p className="text-xs text-accent-green font-semibold">おだちんゲット！</p>
                <p className="text-base font-black text-accent-green tabular-nums">+¥{lastReward.toLocaleString("ja-JP")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No weapons state */}
      {mounted && weapons.length === 0 && (
        <div className="mb-5 section-card p-6 text-center border-2 border-dashed border-gold/30">
          <Shimaenaga variant="wave" size="md" mode="seal" className="mx-auto" />
          <h2 className="mt-3 text-base font-bold text-ink">ぶきがまだありません</h2>
          <p className="mt-1 text-sm text-ink-muted">シマエナガ銀行にノートをあずけるとぶきができます。</p>
          <Link href="/bank" className="rounded-2xl bg-gradient-to-r from-gold to-timee-yellow text-[#7A5000] font-bold px-5 py-2.5 text-sm mt-4 inline-block">
            銀行へいく →
          </Link>
        </div>
      )}

      {/* Jobs list */}
      <ul className="space-y-4">
        {MOCK_JOBS.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            weapons={weapons}
            appliedIds={appliedIds}
            onApply={handleApply}
          />
        ))}
      </ul>
    </main>
  );
}
