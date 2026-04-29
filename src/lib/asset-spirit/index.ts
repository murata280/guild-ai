// Kawaii spirit overlay for GUILD AI assets.
// Renders a rank-expressive face on top of the base Asset Emblem.
// S=きらきら（sparkle stars）, A=やさしい（gentle smile）, B=もぐもぐ（munching）

import { generateEmblemSpec, renderEmblemSvg } from "@/lib/asset-emblem";
import type { Rank } from "@/types";

export interface SpiritSpec {
  assetId: string;
  rank: Rank;
}

export function generateSpirit(assetId: string, rank: Rank): SpiritSpec {
  return { assetId, rank };
}

// Face overlay elements as SVG string, normalized to a `size×size` canvas.
export function faceOverlaySvgString(rank: Rank, size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const sc = size / 100;

  const oval = `<ellipse cx="${cx}" cy="${cy + 2 * sc}" rx="${24 * sc}" ry="${26 * sc}" fill="white" opacity="0.82"/>`;

  if (rank === "S") {
    return `${oval}
  <ellipse cx="${cx - 14 * sc}" cy="${cy - 4 * sc}" rx="${4 * sc}" ry="${2 * sc}" fill="#1A1628"/>
  <ellipse cx="${cx - 14 * sc}" cy="${cy - 4 * sc}" rx="${2 * sc}" ry="${4 * sc}" fill="#1A1628"/>
  <ellipse cx="${cx + 14 * sc}" cy="${cy - 4 * sc}" rx="${4 * sc}" ry="${2 * sc}" fill="#1A1628"/>
  <ellipse cx="${cx + 14 * sc}" cy="${cy - 4 * sc}" rx="${2 * sc}" ry="${4 * sc}" fill="#1A1628"/>
  <path d="M ${cx - 16 * sc} ${cy + 12 * sc} Q ${cx} ${cy + 20 * sc} ${cx + 16 * sc} ${cy + 12 * sc}" stroke="#1A1628" stroke-width="${2.5 * sc}" fill="none" stroke-linecap="round"/>
  <ellipse cx="${cx - 22 * sc}" cy="${cy + 6 * sc}" rx="${9 * sc}" ry="${5 * sc}" fill="#FFB6C1" opacity="0.6"/>
  <ellipse cx="${cx + 22 * sc}" cy="${cy + 6 * sc}" rx="${9 * sc}" ry="${5 * sc}" fill="#FFB6C1" opacity="0.6"/>
  <circle cx="${cx + 38 * sc}" cy="${cy - 32 * sc}" r="${2 * sc}" fill="#F5A623"/>
  <circle cx="${cx - 36 * sc}" cy="${cy - 28 * sc}" r="${1.5 * sc}" fill="#E84C88"/>`;
  }

  if (rank === "A") {
    return `${oval}
  <circle cx="${cx - 14 * sc}" cy="${cy - 4 * sc}" r="${4 * sc}" fill="#1A1628"/>
  <circle cx="${cx + 14 * sc}" cy="${cy - 4 * sc}" r="${4 * sc}" fill="#1A1628"/>
  <circle cx="${cx - 12 * sc}" cy="${cy - 6 * sc}" r="${1.5 * sc}" fill="white"/>
  <circle cx="${cx + 16 * sc}" cy="${cy - 6 * sc}" r="${1.5 * sc}" fill="white"/>
  <path d="M ${cx - 12 * sc} ${cy + 12 * sc} Q ${cx} ${cy + 18 * sc} ${cx + 12 * sc} ${cy + 12 * sc}" stroke="#1A1628" stroke-width="${2 * sc}" fill="none" stroke-linecap="round"/>
  <ellipse cx="${cx - 20 * sc}" cy="${cy + 6 * sc}" rx="${8 * sc}" ry="${4 * sc}" fill="#FFB6C1" opacity="0.4"/>
  <ellipse cx="${cx + 20 * sc}" cy="${cy + 6 * sc}" rx="${8 * sc}" ry="${4 * sc}" fill="#FFB6C1" opacity="0.4"/>`;
  }

  // B — もぐもぐ
  return `${oval}
  <ellipse cx="${cx - 14 * sc}" cy="${cy - 2 * sc}" rx="${4 * sc}" ry="${3 * sc}" fill="#1A1628"/>
  <ellipse cx="${cx + 14 * sc}" cy="${cy - 2 * sc}" rx="${4 * sc}" ry="${3 * sc}" fill="#1A1628"/>
  <ellipse cx="${cx}" cy="${cy + 14 * sc}" rx="${5 * sc}" ry="${4 * sc}" fill="#1A1628" opacity="0.8"/>`;
}

// Full SVG string: emblem layer + kawaii face overlay.
// Used by the /api/spirit/[assetId] route handler.
export function renderSpiritSvg(assetId: string, rank: Rank, size = 100): string {
  const emblemSpec = generateEmblemSpec(assetId);
  const emblemFull = renderEmblemSvg(emblemSpec, size);

  // Strip outer <svg> tags to embed emblem elements inside a new SVG
  const inner = emblemFull
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "");

  const face = faceOverlaySvgString(rank, size);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
${inner}
${face}
</svg>`;
}
