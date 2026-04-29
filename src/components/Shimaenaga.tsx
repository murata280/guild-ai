"use client";

type Variant = "trust" | "key" | "coin" | "wave";
type Size = "xs" | "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = { xs: 24, sm: 40, md: 64, lg: 96 };

interface ShimaenagaProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const ACCENT = "#FFCC00";
const BODY_WHITE = "#FFFFFF";
const OUTLINE = "#D0D0D0";
const EYE_COLOR = "#1A1628";
const BEAK_COLOR = "#FFA500";

function TrustAccessory({ scale }: { scale: number }) {
  // Small notepad/memo
  return (
    <g transform={`translate(${14 * scale}, ${26 * scale})`}>
      <rect
        x={0} y={0}
        width={10 * scale} height={12 * scale}
        rx={1.5 * scale}
        fill={ACCENT}
        stroke="#E6B800"
        strokeWidth={0.8 * scale}
      />
      <line x1={2 * scale} y1={4 * scale} x2={8 * scale} y2={4 * scale} stroke="#A08800" strokeWidth={0.8 * scale} />
      <line x1={2 * scale} y1={7 * scale} x2={8 * scale} y2={7 * scale} stroke="#A08800" strokeWidth={0.8 * scale} />
      <line x1={2 * scale} y1={10 * scale} x2={6 * scale} y2={10 * scale} stroke="#A08800" strokeWidth={0.8 * scale} />
    </g>
  );
}

function KeyAccessory({ scale }: { scale: number }) {
  // Key shape
  return (
    <g transform={`translate(${12 * scale}, ${24 * scale})`}>
      <circle
        cx={5 * scale} cy={5 * scale}
        r={4 * scale}
        fill="none"
        stroke={ACCENT}
        strokeWidth={2 * scale}
      />
      <line
        x1={9 * scale} y1={5 * scale}
        x2={18 * scale} y2={5 * scale}
        stroke={ACCENT}
        strokeWidth={2 * scale}
        strokeLinecap="round"
      />
      <line
        x1={15 * scale} y1={5 * scale}
        x2={15 * scale} y2={8 * scale}
        stroke={ACCENT}
        strokeWidth={1.5 * scale}
        strokeLinecap="round"
      />
      <line
        x1={12 * scale} y1={5 * scale}
        x2={12 * scale} y2={7 * scale}
        stroke={ACCENT}
        strokeWidth={1.5 * scale}
        strokeLinecap="round"
      />
    </g>
  );
}

function CoinAccessory({ scale }: { scale: number }) {
  // Gold coin
  return (
    <g transform={`translate(${14 * scale}, ${22 * scale})`}>
      <circle
        cx={7 * scale} cy={7 * scale}
        r={7 * scale}
        fill={ACCENT}
        stroke="#E6B800"
        strokeWidth={1 * scale}
      />
      <text
        x={7 * scale} y={10 * scale}
        textAnchor="middle"
        fontSize={8 * scale}
        fontWeight="bold"
        fill="#8B6800"
      >
        ¥
      </text>
    </g>
  );
}

function WaveAccessory({ scale }: { scale: number }) {
  // Raised wing with wave gesture
  return null; // The wave is handled in the wing transform
}

export function Shimaenaga({ variant = "wave", size = "md", className }: ShimaenagaProps) {
  const px = SIZE_PX[size];
  const scale = px / 64; // Base design at 64px
  const s = scale;

  const LABEL_MAP: Record<Variant, string> = {
    trust: "メモを持つシマエナガ",
    key: "鍵を持つシマエナガ",
    coin: "コインを持つシマエナガ",
    wave: "手を振るシマエナガ",
  };

  // Bird body center at (32, 30) in 64px space
  const cx = 32 * s;
  const cy = 30 * s;

  // Wing positions
  const leftWingX = 8 * s;
  const leftWingY = 28 * s;
  const rightWingX = 44 * s;
  const rightWingY = 28 * s;
  const waveRightWingY = variant === "wave" ? 18 * s : rightWingY;

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${64 * s} ${64 * s}`}
      role="img"
      aria-label={LABEL_MAP[variant]}
      className={className}
      style={{ overflow: "visible" }}
    >
      {/* Left wing */}
      <ellipse
        cx={leftWingX}
        cy={leftWingY}
        rx={8 * s}
        ry={10 * s}
        fill={BODY_WHITE}
        stroke={OUTLINE}
        strokeWidth={0.8 * s}
        transform={`rotate(-20, ${leftWingX}, ${leftWingY})`}
      />

      {/* Right wing — raised if wave variant */}
      <ellipse
        cx={rightWingX + 8 * s}
        cy={waveRightWingY}
        rx={8 * s}
        ry={10 * s}
        fill={BODY_WHITE}
        stroke={OUTLINE}
        strokeWidth={0.8 * s}
        transform={variant === "wave"
          ? `rotate(-50, ${rightWingX + 8 * s}, ${waveRightWingY})`
          : `rotate(20, ${rightWingX + 8 * s}, ${rightWingY})`
        }
      />

      {/* Body */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={18 * s}
        ry={22 * s}
        fill={BODY_WHITE}
        stroke={OUTLINE}
        strokeWidth={1 * s}
      />

      {/* Head */}
      <circle
        cx={cx}
        cy={14 * s}
        r={12 * s}
        fill={BODY_WHITE}
        stroke={OUTLINE}
        strokeWidth={1 * s}
      />

      {/* Left eye */}
      <circle cx={cx - 5 * s} cy={12 * s} r={2.5 * s} fill={EYE_COLOR} />
      <circle cx={cx - 5 * s + 0.8 * s} cy={12 * s - 0.8 * s} r={0.8 * s} fill="white" />

      {/* Right eye */}
      <circle cx={cx + 5 * s} cy={12 * s} r={2.5 * s} fill={EYE_COLOR} />
      <circle cx={cx + 5 * s + 0.8 * s} cy={12 * s - 0.8 * s} r={0.8 * s} fill="white" />

      {/* Beak */}
      <path
        d={`M ${cx - 2 * s} ${17 * s} L ${cx} ${21 * s} L ${cx + 2 * s} ${17 * s} Z`}
        fill={BEAK_COLOR}
      />

      {/* Cheek blush */}
      <ellipse cx={cx - 9 * s} cy={15 * s} rx={3 * s} ry={2 * s} fill="rgba(255,150,150,0.3)" />
      <ellipse cx={cx + 9 * s} cy={15 * s} rx={3 * s} ry={2 * s} fill="rgba(255,150,150,0.3)" />

      {/* Accessory by variant */}
      {variant === "trust" && <TrustAccessory scale={s} />}
      {variant === "key" && <KeyAccessory scale={s} />}
      {variant === "coin" && <CoinAccessory scale={s} />}
      {variant === "wave" && <WaveAccessory scale={s} />}

      {/* Feet */}
      <line x1={cx - 5 * s} y1={50 * s} x2={cx - 5 * s} y2={58 * s} stroke={OUTLINE} strokeWidth={1.5 * s} strokeLinecap="round" />
      <line x1={cx + 5 * s} y1={50 * s} x2={cx + 5 * s} y2={58 * s} stroke={OUTLINE} strokeWidth={1.5 * s} strokeLinecap="round" />
      <line x1={cx - 8 * s} y1={58 * s} x2={cx - 2 * s} y2={58 * s} stroke={OUTLINE} strokeWidth={1.5 * s} strokeLinecap="round" />
      <line x1={cx + 2 * s} y1={58 * s} x2={cx + 8 * s} y2={58 * s} stroke={OUTLINE} strokeWidth={1.5 * s} strokeLinecap="round" />
    </svg>
  );
}
