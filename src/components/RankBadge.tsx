import type { Rank } from "@/types";

const styles: Record<Rank, string> = {
  S: "bg-kaki text-white border border-amber-400/60",
  A: "bg-zinc-300 text-kuroko border border-zinc-400/40",
  B: "bg-amber-700 text-white border border-amber-800/40",
};

export function RankBadge({ rank, large }: { rank: Rank; large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${large ? "px-4 py-1 text-base h-6" : "px-3 py-0.5 text-sm h-[24px]"} ${styles[rank]}`}
      aria-label={`ランク ${rank}`}
    >
      {rank}
    </span>
  );
}
