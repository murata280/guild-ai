"use client";

import { useState } from "react";
import { RankRadar } from "@/components/RankRadar";
import { WillSignalTrigger } from "@/components/WillSignalTrigger";
import type { Rank } from "@/types";

interface ValuationSectionProps {
  rank: Rank;
  floorPrice: number;
  thoughtDensity: number;
  iterations: number;
  uptimeDays: number;
  justification?: string;
}

export function ValuationSection({
  rank,
  floorPrice,
  thoughtDensity,
  iterations,
  uptimeDays,
  justification,
}: ValuationSectionProps) {
  const [currentFloorPrice, setCurrentFloorPrice] = useState(floorPrice);
  const [currentRank, setCurrentRank] = useState<Rank>(rank);

  function handlePromoted(newFloorPrice: number) {
    setCurrentFloorPrice(newFloorPrice);
    setCurrentRank("S");
  }

  return (
    <section className="mt-4 section-card p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#9890A8]">
        知能の品質ランク
      </h2>

      <div className="mt-4 flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <RankRadar
          thoughtDensity={thoughtDensity}
          iterations={iterations}
          uptimeDays={uptimeDays}
          size={200}
        />
        <div className="flex-1 space-y-3">
          {justification && (
            <p className="text-sm text-[#4A4464] leading-relaxed">{justification}</p>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-[#9890A8]">お値段の目安</span>
            <span className="text-2xl font-bold tabular-nums text-kuroko">
              ¥{currentFloorPrice.toLocaleString()}
            </span>
          </div>
          {currentRank === "S" && currentFloorPrice > floorPrice && (
            <p className="text-xs font-semibold text-accent-green">
              ✓ 意思シグナルにより +50% 昇格済み
            </p>
          )}
        </div>
      </div>

      <WillSignalTrigger
        currentRank={currentRank}
        floorPrice={currentFloorPrice}
        onPromoted={handlePromoted}
      />
    </section>
  );
}
