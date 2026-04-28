"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateDeployUrl } from "@/lib/ownership";
import type { OwnershipRecord } from "@/types";

interface Props {
  assetId: string;
  assetTitle: string;
  price: number;
}

export function PurchaseButton({ assetId, assetTitle, price }: Props) {
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    try {
      const owned: OwnershipRecord[] = JSON.parse(
        localStorage.getItem("guild_owned_assets") ?? "[]"
      );
      setPurchased(owned.some((r) => r.assetId === assetId));
    } catch {
      // ignore
    }
  }, [assetId]);

  const handlePurchase = () => {
    try {
      const owned: OwnershipRecord[] = JSON.parse(
        localStorage.getItem("guild_owned_assets") ?? "[]"
      );
      const record: OwnershipRecord = {
        assetId,
        ownerId: "demo-user",
        acquiredAt: new Date().toISOString(),
        deployUrl: generateDeployUrl(assetId),
        assetTitle,
      };
      const updated = [...owned.filter((r) => r.assetId !== assetId), record];
      localStorage.setItem("guild_owned_assets", JSON.stringify(updated));
      setPurchased(true);
    } catch {
      // ignore
    }
  };

  if (purchased) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className="inline-flex items-center gap-1 rounded-xl border border-green-400 px-5 py-3 text-green-700 font-semibold">
          購入済み ✓
        </span>
        <Link
          href="/dashboard"
          className="inline-block rounded-xl bg-kuroko/10 px-5 py-3 text-kuroko hover:bg-kuroko/20 font-medium"
        >
          ダッシュボードへ →
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={handlePurchase}
      className="rounded-xl bg-kuroko px-5 py-3 text-kami hover:bg-kuroko/90 font-semibold"
    >
      購入する ¥{price.toLocaleString("ja-JP")}
    </button>
  );
}
