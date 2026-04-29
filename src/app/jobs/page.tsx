"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shimaenaga } from "@/components/Shimaenaga";
import { Confetti } from "@/components/Confetti";
import { RankBadge } from "@/components/RankBadge";
import { MOCK_JOBS, checkJobEligibility, applyToJob, getApplications } from "@/lib/jobs";
import { getWeapons } from "@/lib/weapons";
import { playPassbookChime } from "@/lib/sound";
import type { Weapon, Job } from "@/types";

// ─── Job card ─────────────────────────────────────────────────────────────────

const RANK_BORDER: Record<string, string> = {
  S: "border-kaki shadow-[0_0_0_2px_rgba(26,107,181,0.3)]",
  A: "border-zinc-300",
  B: "border-amber-200",
};

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

  const borderClass = eligibility.canApply
    ? `border-2 ${RANK_BORDER[job.requiredRank]} ring-2 ring-kaki/20 animate-[glow_2s_ease-in-out_infinite]`
    : "border border-kuroko/10";

  return (
    <li className={`section-card p-5 transition-all ${borderClass} ${!eligibility.canApply && !alreadyApplied ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold text-[#9890A8] uppercase tracking-widest">
              {job.category}
            </span>
            <RankBadge rank={job.requiredRank} />
          </div>
          <h2 className="mt-1 text-base font-bold text-kuroko leading-snug">{job.title}</h2>
          <p className="mt-1 text-sm text-[#4A4464] leading-relaxed line-clamp-2">{job.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-accent-green tabular-nums">
            ¥{job.reward.toLocaleString("ja-JP")}
          </p>
          <p className="text-[10px] text-[#9890A8]">おだちん</p>
        </div>
      </div>

      {/* Required tags */}
      {job.requiredTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.requiredTags.map((tag) => {
            const owned = weapons.some((w) => w.tags.includes(tag));
            return (
              <span
                key={tag}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                  owned
                    ? "bg-kaki/10 border-kaki/30 text-kaki"
                    : "bg-kuroko/5 border-kuroko/15 text-[#9890A8]"
                }`}
              >
                {owned ? "✓" : "○"} {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Eligibility status */}
      {alreadyApplied ? (
        <div className="mt-2 rounded-xl bg-accent-green/10 border border-accent-green/20 px-3 py-2 text-sm text-accent-green font-semibold text-center">
          ✓ 応募済み — おだちんを受け取りました！
        </div>
      ) : eligibility.canApply ? (
        <button
          type="button"
          onClick={() => onApply(job.id, job.reward)}
          className="mt-2 btn-primary w-full"
          aria-label={`${job.title}に応募する`}
        >
          ⚔️ 今すぐ応募する →
        </button>
      ) : (
        <div className="mt-2 space-y-1.5">
          <div className="rounded-xl bg-kuroko/5 border border-kuroko/10 px-3 py-2 text-xs text-[#9890A8] text-center">
            🔒 {eligibility.hint}
          </div>
          <Link
            href="/bank"
            className="block text-center text-xs text-kaki hover:underline"
          >
            シマエナガ銀行で武器を装備する →
          </Link>
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
            <h1 className="text-2xl font-bold text-kuroko">案件ボード</h1>
            <p className="text-sm text-[#9890A8]">武器を装備して稼ごう</p>
          </div>
        </div>
        <Link href="/bank" className="btn-primary shrink-0 text-sm" aria-label="シマエナガ銀行へ">
          + 武器を作る
        </Link>
      </div>

      {/* Stats bar */}
      {mounted && (
        <div className="section-card p-4 mb-5 flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-[#9890A8]">所持武器</p>
            <p className="text-xl font-bold text-kuroko tabular-nums">{weapons.length} 本</p>
          </div>
          <div>
            <p className="text-xs text-[#9890A8]">応募できる案件</p>
            <p className="text-xl font-bold text-kaki tabular-nums">{canApplyCount} 件</p>
          </div>
          <div>
            <p className="text-xs text-[#9890A8]">応募済み</p>
            <p className="text-xl font-bold text-accent-green tabular-nums">{appliedIds.size} 件</p>
          </div>
          {lastReward && (
            <div className="ml-auto flex items-center gap-2 rounded-xl bg-accent-green/10 border border-accent-green/20 px-4 py-2">
              <span className="text-lg animate-bounce">🎉</span>
              <div>
                <p className="text-xs text-accent-green font-semibold">おだちん獲得！</p>
                <p className="text-base font-black text-accent-green tabular-nums">+¥{lastReward.toLocaleString("ja-JP")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No weapons state */}
      {mounted && weapons.length === 0 && (
        <div className="mb-5 section-card p-6 text-center border-2 border-dashed border-kaki/30">
          <Shimaenaga variant="wave" size="md" mode="seal" className="mx-auto" />
          <h2 className="mt-3 text-base font-bold text-kuroko">武器がまだありません</h2>
          <p className="mt-1 text-sm text-[#9890A8]">
            シマエナガ銀行にノートを預けると武器が手に入ります。
          </p>
          <Link href="/bank" className="btn-primary mt-4 inline-block">
            銀行へ行く →
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
