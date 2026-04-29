"use client";

interface GoldenSealProps {
  size?: 24 | 32 | 48;
  className?: string;
}

const SIZES = {
  24: { r: 9, outerR: 11, innerR: 7.5, body: 5, wing: 3, label: 3.5 },
  32: { r: 12, outerR: 15, innerR: 10, body: 7, wing: 4, label: 4.5 },
  48: { r: 18, outerR: 22, innerR: 15, body: 10, wing: 6, label: 6 },
};

export function GoldenSeal({ size = 32, className }: GoldenSealProps) {
  const cx = size / 2;
  const cy = size / 2;
  const s = SIZES[size];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Verified by GUILD AI — 鑑定済み証"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer gold ring */}
      <circle cx={cx} cy={cy} r={s.outerR} fill="none" stroke="#D4AF37" strokeWidth="1.5" />
      {/* Inner gold ring */}
      <circle cx={cx} cy={cy} r={s.innerR} fill="none" stroke="#B58E1A" strokeWidth="0.75" opacity="0.7" />
      {/* Dark fill background */}
      <circle cx={cx} cy={cy} r={s.innerR - 0.5} fill="#11141A" />

      {/* Shimaenaga abstract silhouette — round body + tiny wings, white+gold, eyeless abstract */}
      {/* Round body */}
      <ellipse cx={cx} cy={cy + 0.5} rx={s.body * 0.65} ry={s.body * 0.7} fill="#D4AF37" opacity="0.92" />
      {/* Head (slightly smaller circle above) */}
      <circle cx={cx} cy={cy - s.body * 0.55} r={s.body * 0.42} fill="#E8EBF0" opacity="0.95" />
      {/* Left wing */}
      <ellipse
        cx={cx - s.body * 0.7}
        cy={cy + 0.5}
        rx={s.wing * 0.45}
        ry={s.wing * 0.3}
        fill="#D4AF37"
        opacity="0.7"
        transform={`rotate(-20, ${cx - s.body * 0.7}, ${cy + 0.5})`}
      />
      {/* Right wing */}
      <ellipse
        cx={cx + s.body * 0.7}
        cy={cy + 0.5}
        rx={s.wing * 0.45}
        ry={s.wing * 0.3}
        fill="#D4AF37"
        opacity="0.7"
        transform={`rotate(20, ${cx + s.body * 0.7}, ${cy + 0.5})`}
      />

      {/* "Verified" arc text — small, bottom */}
      <text
        x={cx}
        y={cy + s.outerR - 2}
        textAnchor="middle"
        fontSize={s.label}
        fontFamily="'JetBrains Mono', monospace"
        fill="#D4AF37"
        opacity="0.9"
        letterSpacing="0.5"
      >
        Verified
      </text>
    </svg>
  );
}
