import type { Rank } from "@/types";

const styles: Record<Rank, string> = {
  S: "bg-kaki text-kuroko",
  A: "bg-zinc-300 text-kuroko",
  B: "bg-amber-700 text-white",
};

export function RankBadge({ rank }: { rank: Rank }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-bold ${styles[rank]}`}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}
