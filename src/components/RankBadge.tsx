import type { Rank } from "@/types";
import { CrownIcon, StarIcon, LeafIcon } from "@/components/icons";

const RANK_META: Record<Rank, {
  label: string;
  bg: string;
  Icon: typeof CrownIcon;
}> = {
  S: {
    label: "お墨付き",
    bg: "bg-kaki text-white border border-amber-400/60",
    Icon: CrownIcon,
  },
  A: {
    label: "高評価",
    bg: "bg-zinc-300 text-kuroko border border-zinc-400/40",
    Icon: StarIcon,
  },
  B: {
    label: "標準",
    bg: "bg-amber-700 text-white border border-amber-800/40",
    Icon: LeafIcon,
  },
};

export function RankBadge({ rank, large, showLabel = false }: { rank: Rank; large?: boolean; showLabel?: boolean }) {
  const meta = RANK_META[rank];
  const { Icon } = meta;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${large ? "px-4 py-1 text-base" : "px-2.5 py-0.5 text-sm"} ${meta.bg}`}
      aria-label={`ランク ${rank} — ${meta.label}`}
    >
      <Icon size={large ? 14 : 12} aria-hidden />
      <span>{rank}</span>
      {showLabel && (
        <span className="text-xs font-normal opacity-90 ml-0.5">{meta.label}</span>
      )}
    </span>
  );
}
