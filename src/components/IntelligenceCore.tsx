"use client";

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface IntelligenceCoreProps {
  assetId: string;
  size?: number;
  className?: string;
}

export function IntelligenceCore({ assetId, size = 64, className }: IntelligenceCoreProps) {
  // Generate deterministic node positions from assetId
  const seed = djb2(assetId);
  const nodes = Array.from({ length: 5 }, (_, i) => ({
    x: 20 + ((seed >> i * 4) % 24),
    y: 20 + ((seed >> (i * 4 + 2)) % 24),
  }));

  const gradId = `ic-${(seed % 9999).toString(36)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="知能コア"
      className={className}
      style={{ filter: "drop-shadow(0 2px 8px rgba(26,107,181,0.3))" }}
    >
      <style>{`
        @keyframes ic-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .ic-pulse-group {
            transform-origin: 32px 32px;
            animation: ic-pulse 2s ease-in-out infinite;
          }
        }
      `}</style>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#B8D4F0" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1A6BB5" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <g className="ic-pulse-group">
        <circle cx="32" cy="32" r="30" fill={`url(#${gradId})`} stroke="#1A6BB520" strokeWidth="1" />
        {/* Neural connections */}
        {nodes.map((n, i) =>
          nodes.slice(i + 1, i + 3).map((m, j) => (
            <line
              key={`${i}-${j}`}
              x1={n.x}
              y1={n.y}
              x2={m.x}
              y2={m.y}
              stroke="#1A6BB540"
              strokeWidth="0.8"
            />
          ))
        )}
        {/* Nodes */}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r="2.5" fill="#1A6BB5" fillOpacity="0.7" />
        ))}
        {/* Glass highlight */}
        <ellipse cx="24" cy="22" rx="8" ry="5" fill="white" fillOpacity="0.3" />
      </g>
    </svg>
  );
}
