// Deterministic visual emblem generator for GUILD AI assets.
// Each assetId maps to a unique SVG emblem via djb2 hash — zero external deps.

export interface EmblemSpec {
  assetId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  axes: 5 | 7;
  petalRadius: number;   // 28–37 (for 100×100 viewBox, center 50,50)
  centerRadius: number;  // 10–17
  rotation: number;      // 0–359 degrees
  hasOuterRing: boolean;
}

const PALETTE = [
  "#1A6BB5", // kaki blue
  "#0FA968", // accent green
  "#9B6BB5", // violet
  "#E8621C", // orange
  "#2D7FBF", // mid blue
  "#E84C88", // rose
  "#F5A623", // amber
  "#4ECDC4", // teal
  "#6C5CE7", // purple
  "#E84C4C", // red
];

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function generateEmblemSpec(assetId: string): EmblemSpec {
  const seed = djb2(assetId);
  const n = PALETTE.length;
  // Pick 3 distinct palette indices without replacement.
  const all = Array.from({ length: n }, (_, i) => i);
  const pi = seed % n;
  const rem1 = all.filter((i) => i !== pi);
  const si = rem1[(seed >> 4) % rem1.length];
  const rem2 = rem1.filter((i) => i !== si);
  const ai = rem2[(seed >> 8) % rem2.length];

  return {
    assetId,
    primaryColor: PALETTE[pi],
    secondaryColor: PALETTE[si],
    accentColor: PALETTE[ai],
    axes: (seed % 2 === 0 ? 5 : 7) as 5 | 7,
    petalRadius: 28 + (seed % 10),
    centerRadius: 10 + ((seed >> 4) % 8),
    rotation: (seed >> 8) % 360,
    hasOuterRing: (seed >> 12) % 2 === 0,
  };
}

// Returns SVG markup string for server-side rendering / API endpoints.
// viewBox is always 100×100; scale by changing the `size` argument.
export function renderEmblemSvg(spec: EmblemSpec, size = 100): string {
  const cx = size / 2;
  const cy = size / 2;
  const sc = size / 100;
  const gid = (djb2(spec.assetId) % 99999).toString(36);
  const pg = `pg_${gid}`;
  const cg = `cg_${gid}`;
  const ry = (spec.petalRadius * sc) / 2;
  const rx = spec.petalRadius * sc * 0.3;
  const petalCy = cy - ry;
  const cr = spec.centerRadius * sc;

  const petals = Array.from({ length: spec.axes }, (_, i) => {
    const angle = (360 / spec.axes) * i + spec.rotation;
    return `<g transform="rotate(${angle},${cx},${cy})"><ellipse cx="${cx}" cy="${petalCy}" rx="${rx}" ry="${ry}" fill="url(#${pg})" opacity="0.85"/></g>`;
  }).join("\n  ");

  const ring = spec.hasOuterRing
    ? `<circle cx="${cx}" cy="${cy}" r="${(spec.petalRadius + 5) * sc}" fill="none" stroke="${spec.secondaryColor}" stroke-width="${1.5 * sc}" opacity="0.4"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
  <defs>
    <linearGradient id="${pg}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${spec.primaryColor}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${spec.secondaryColor}" stop-opacity="0.6"/>
    </linearGradient>
    <radialGradient id="${cg}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${spec.accentColor}"/>
      <stop offset="100%" stop-color="${spec.primaryColor}" stop-opacity="0.7"/>
    </radialGradient>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${cx}" fill="${spec.primaryColor}" opacity="0.08"/>
  ${petals}
  ${ring}
  <circle cx="${cx}" cy="${cy}" r="${cr}" fill="url(#${cg})"/>
  <circle cx="${cx}" cy="${cy}" r="${cr * 0.4}" fill="white" opacity="0.5"/>
</svg>`;
}

// Encodes EmblemSpec as a 12-dim float32 array for AtoA cosine-similarity matching.
export function specToVectorEmbedding(spec: EmblemSpec): number[] {
  const toRgb = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
  return [
    spec.axes / 7,
    spec.petalRadius / 40,
    spec.centerRadius / 20,
    spec.rotation / 360,
    spec.hasOuterRing ? 1 : 0,
    ...toRgb(spec.primaryColor),
    ...toRgb(spec.secondaryColor),
    ...toRgb(spec.accentColor),
  ];
}
