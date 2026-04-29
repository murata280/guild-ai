"use client";

type Variant = "trust" | "key" | "coin" | "wave";
type Size = "xs" | "sm" | "md" | "lg";
type Mode = "avatar" | "seal" | "guardian" | "watch";

const SIZE_PX: Record<Size, number> = { xs: 24, sm: 40, md: 64, lg: 96 };

interface ShimaenagaProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  mode?: Mode;
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
  void scale;
  return null; // The wave is handled in the wing transform
}

// Shield shape behind the bird for guardian mode
function GuardianShield({ scale, cx, cy }: { scale: number; cx: number; cy: number }) {
  // Shield: a path positioned behind/below the bird center
  const sw = 22 * scale;
  const sh = 28 * scale;
  const sx = cx - sw / 2;
  const sy = cy - 4 * scale;
  return (
    <path
      d={`M ${sx} ${sy} L ${sx + sw} ${sy} L ${sx + sw} ${sy + sh * 0.65} Q ${sx + sw} ${sy + sh} ${cx} ${sy + sh} Q ${sx} ${sy + sh} ${sx} ${sy + sh * 0.65} Z`}
      fill="#1A6BB5"
      fillOpacity="0.18"
      stroke="#1A6BB5"
      strokeWidth={1.2 * scale}
      strokeOpacity="0.5"
    />
  );
}

// Stamp/seal serration ring
function SealRing({ scale, cx, cy, r }: { scale: number; cx: number; cy: number; r: number }) {
  const teeth = 24;
  const points = Array.from({ length: teeth * 2 }, (_, i) => {
    const angle = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? r + 3 * scale : r;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  });
  return (
    <polygon
      points={points.join(" ")}
      fill="none"
      stroke="#1A6BB5"
      strokeWidth={1 * scale}
      strokeOpacity="0.6"
    />
  );
}

export function Shimaenaga({ variant = "wave", size = "md", className, mode }: ShimaenagaProps) {
  const px = SIZE_PX[size];
  const scale = px / 64; // Base design at 64px
  const s = scale;

  // Combined label map for variant + mode
  const LABEL_MAP: Record<Variant, string> = {
    trust: "メモを持つシマエナガ",
    key: "鍵を持つシマエナガ",
    coin: "コインを持つシマエナガ",
    wave: "手を振るシマエナガ",
  };

  const MODE_LABEL_SUFFIX: Record<Mode, string> = {
    avatar: "（アバターモード）",
    seal: "（認証スタンプ）",
    guardian: "（ガーディアン守り神）",
    watch: "（じーっとみてる）",
  };

  const ariaLabel = mode
    ? LABEL_MAP[variant] + MODE_LABEL_SUFFIX[mode]
    : LABEL_MAP[variant];

  // Bird body center at (32, 30) in 64px space
  const cx = 32 * s;
  const cy = 30 * s;

  // Wing positions
  const leftWingX = 8 * s;
  const leftWingY = 28 * s;
  const rightWingX = 44 * s;
  const rightWingY = 28 * s;
  const waveRightWingY = variant === "wave" ? 18 * s : rightWingY;

  // Guardian mode: wings spread dramatically outward
  const isGuardian = mode === "guardian";
  const guardianLeftWingX = isGuardian ? 2 * s : leftWingX;
  const guardianLeftWingY = isGuardian ? 20 * s : leftWingY;
  const guardianRightWingX = isGuardian ? 52 * s : rightWingX + 8 * s;
  const guardianRightWingY = isGuardian ? 20 * s : waveRightWingY;

  // Seal mode: render as circular emblem
  if (mode === "seal") {
    const sealRadius = 28 * s;
    const sealCx = 32 * s;
    const sealCy = 32 * s;
    return (
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${64 * s} ${64 * s}`}
        role="img"
        aria-label={ariaLabel}
        className={className}
        style={{ overflow: "visible" }}
      >
        {/* Outer circle */}
        <circle cx={sealCx} cy={sealCy} r={sealRadius} fill="#EEF5FF" stroke="#1A6BB5" strokeWidth={1.5 * s} strokeOpacity="0.5" />
        {/* Serration ring */}
        <SealRing scale={s} cx={sealCx} cy={sealCy} r={sealRadius} />
        {/* Inner bird emblem — scaled down to fit circle */}
        <g transform={`translate(${sealCx - 10 * s}, ${sealCy - 14 * s}) scale(0.62)`}>
          {/* Body */}
          <ellipse cx={16 * s} cy={18 * s} rx={14 * s} ry={17 * s} fill={BODY_WHITE} stroke={OUTLINE} strokeWidth={1 * s} />
          {/* Head */}
          <circle cx={16 * s} cy={5 * s} r={9 * s} fill={BODY_WHITE} stroke={OUTLINE} strokeWidth={1 * s} />
          {/* Eyes */}
          <circle cx={11 * s} cy={3 * s} r={1.8 * s} fill={EYE_COLOR} />
          <circle cx={21 * s} cy={3 * s} r={1.8 * s} fill={EYE_COLOR} />
          {/* Beak */}
          <path d={`M ${14 * s} ${7.5 * s} L ${16 * s} ${10 * s} L ${18 * s} ${7.5 * s} Z`} fill={BEAK_COLOR} />
        </g>
        {/* "GUILD CERTIFIED" text arc at bottom */}
        <text
          x={sealCx}
          y={sealCy + sealRadius - 3 * s}
          textAnchor="middle"
          fontSize={4.5 * s}
          fontWeight="700"
          letterSpacing={0.8 * s}
          fill="#1A6BB5"
          fillOpacity="0.75"
        >
          GUILD CERTIFIED
        </text>
      </svg>
    );
  }

  // Avatar mode: includes blink animation with reduced-motion guard
  const isAvatar = mode === "avatar";
  const isWatch = mode === "watch";

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${64 * s} ${64 * s}`}
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{ overflow: "visible" }}
    >
      {isAvatar && (
        <style>{`
          @keyframes shimaenaga-blink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
          }
          @media (prefers-reduced-motion: no-preference) {
            .shima-eye-blink {
              transform-box: fill-box;
              transform-origin: center;
              animation: shimaenaga-blink 4s ease-in-out infinite;
            }
          }
        `}</style>
      )}

      {/* Guardian shield (behind bird body) */}
      {isGuardian && <GuardianShield scale={s} cx={cx} cy={cy} />}

      {/* Left wing */}
      <ellipse
        cx={isGuardian ? guardianLeftWingX : leftWingX}
        cy={isGuardian ? guardianLeftWingY : leftWingY}
        rx={8 * s}
        ry={10 * s}
        fill={BODY_WHITE}
        stroke={OUTLINE}
        strokeWidth={0.8 * s}
        transform={isGuardian
          ? `rotate(-50, ${guardianLeftWingX}, ${guardianLeftWingY})`
          : `rotate(-20, ${leftWingX}, ${leftWingY})`
        }
      />

      {/* Right wing — raised if wave variant or guardian */}
      <ellipse
        cx={guardianRightWingX}
        cy={guardianRightWingY}
        rx={8 * s}
        ry={10 * s}
        fill={BODY_WHITE}
        stroke={OUTLINE}
        strokeWidth={0.8 * s}
        transform={isGuardian
          ? `rotate(50, ${guardianRightWingX}, ${guardianRightWingY})`
          : variant === "wave"
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

      {/* Left eye — blink in avatar, watch-sweep in watch */}
      <g className={isAvatar ? "shima-eye-blink" : undefined}>
        <circle cx={cx - 5 * s} cy={12 * s} r={2.5 * s} fill={EYE_COLOR} />
        <circle
          cx={cx - 5 * s + 0.8 * s} cy={12 * s - 0.8 * s} r={0.8 * s} fill="white"
          className={isWatch ? "shima-watch-pupil" : undefined}
        />
      </g>

      {/* Right eye — blink in avatar, watch-sweep in watch */}
      <g className={isAvatar ? "shima-eye-blink" : undefined}>
        <circle cx={cx + 5 * s} cy={12 * s} r={2.5 * s} fill={EYE_COLOR} />
        <circle
          cx={cx + 5 * s + 0.8 * s} cy={12 * s - 0.8 * s} r={0.8 * s} fill="white"
          className={isWatch ? "shima-watch-pupil" : undefined}
        />
      </g>

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
