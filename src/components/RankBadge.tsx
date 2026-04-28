import type { Rank } from "@/types";

const RANK_META: Record<Rank, {
  emoji: string;
  label: string;
  bg: string;
  emojiColor: string;
}> = {
  S: { emoji: "👑", label: "すごい！",    bg: "bg-kaki text-white border border-amber-400/60", emojiColor: "text-yellow-300" },
  A: { emoji: "😊", label: "いい かんじ", bg: "bg-zinc-300 text-kuroko border border-zinc-400/40", emojiColor: "text-yellow-500" },
  B: { emoji: "🌱", label: "これから",    bg: "bg-amber-700 text-white border border-amber-800/40", emojiColor: "text-green-300" },
};

export function RankBadge({ rank, large, showLabel = false }: { rank: Rank; large?: boolean; showLabel?: boolean }) {
  const meta = RANK_META[rank];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${large ? "px-4 py-1 text-base" : "px-2.5 py-0.5 text-sm"} ${meta.bg}`}
      aria-label={`ランク ${rank} — ${meta.label}`}
    >
      <span aria-hidden className={large ? "text-base" : "text-xs"}>{meta.emoji}</span>
      <span>{rank}</span>
      {showLabel && (
        <span className="text-xs font-normal opacity-90 ml-0.5">{meta.label}</span>
      )}
    </span>
  );
}
