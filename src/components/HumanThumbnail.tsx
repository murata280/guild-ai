"use client";

import { useState, useEffect } from "react";
import { AssetEmblem } from "@/components/AssetEmblem";
import { getPhoto } from "@/lib/asset-photos";

interface HumanThumbnailProps {
  assetId: string;
  title: string;
  size?: number;
  className?: string;
}

// Renders user photo when available; falls back to deterministic AssetEmblem.
// SSR renders emblem immediately (no hydration mismatch).
export function HumanThumbnail({ assetId, title, size = 80, className }: HumanThumbnailProps) {
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
