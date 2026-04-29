"use client";

import { useState, useEffect } from "react";
import { AssetEmblem } from "@/components/AssetEmblem";
import { getPhoto } from "@/lib/asset-photos";
import type { Rank } from "@/types";

interface HumanThumbnailProps {
  assetId: string;
  title: string;
  rank?: Rank;
  size?: number;
  className?: string;
}

// 2-layer visual hierarchy:
//   1. Photo (user-uploaded) — highest priority
//   2. AssetEmblem (geometric flower) — fallback
//
// SSR renders layer 2 immediately (no hydration mismatch).
// Photo is loaded client-side via useEffect.
export function HumanThumbnail({ assetId, title, rank: _rank, size = 80, className }: HumanThumbnailProps) {
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

  return <AssetEmblem assetId={assetId} size={size} className={className} />;
}
