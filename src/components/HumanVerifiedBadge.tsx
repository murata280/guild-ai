"use client";

interface HumanVerifiedBadgeProps {
  level: "ai-generated" | "human-claimed" | "human-verified-gold";
  size?: number;
  className?: string;
}

export function HumanVerifiedBadge({ level, size = 24, className }: HumanVerifiedBadgeProps) {
  if (level === "ai-generated") return null;

  const isGold = level === "human-verified-gold";
  const label = isGold ? "人の手の証明 ゴールド" : "人間が登録済み";
  const outerColor = isGold ? "#FFCC00" : "#C0C0C0";
  const innerColor = isGold ? "#E6B800" : "#A0A0A0";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
      className={className}
    >
      {/* Medal circle */}
      <circle cx="12" cy="12" r="10" fill={outerColor} stroke={innerColor} strokeWidth="1.5" />
      {/* Inner ring */}
      <circle cx="12" cy="12" r="7" fill="none" stroke={innerColor} strokeWidth="1" />
      {/* Signature-like check mark */}
      <path
        d="M8 12 L10.5 14.5 L16 9"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Serrations (medal edge details) */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = 12 + Math.cos(angle) * 10;
        const y1 = 12 + Math.sin(angle) * 10;
        const x2 = 12 + Math.cos(angle) * 11.5;
        const y2 = 12 + Math.sin(angle) * 11.5;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={innerColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
