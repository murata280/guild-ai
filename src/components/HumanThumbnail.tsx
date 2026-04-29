"use client";

import { useState, useEffect } from "react";
import { AssetEmblem } from "@/components/AssetEmblem";
import { AssetSpirit } from "@/components/AssetSpirit";
import { getPhoto } from "@/lib/asset-photos";
import type { Rank } from "@/types";

interface HumanThumbnailProps {
  assetId: string;
  title: string;
  rank?: Rank;      // if provided, renders AssetSpirit; else falls back to AssetEmblem
  size?: number;
  className?: string;
}

// 3-layer visual hierarchy:
//   1. Photo (user-uploaded) — highest priority
//   2. AssetSpirit (kawaii face + emblem) — standard when rank is known
//   3. AssetEmblem (geometric flower) — bare fallback when rank is absent
//
// SSR renders layer 2 or 3 immediately (no hydration mismatch).
// Photo is loaded client-side via useEffect.
export function HumanThumbnail({ assetId, title, rank, size = 80, className }: HumanThumbnailProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    setPhotoUrl(getPhoto(assetId));
  }, [assetId]);

  if (photoUrl && !imgErr) {
    return (
      <img
        src={photoUrl}
        alt={title}
        width={size}
        height={size}
        onError={() => setImgErr(true)}
        className={`object-cover ${className ?? ""}`}
      />
    );
  }

  if (rank) {
    return <AssetSpirit assetId={assetId} rank={rank} size={size} className={className} />;
  }

  return <AssetEmblem assetId={assetId} size={size} className={className} />;
}
