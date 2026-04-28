"use client";

export interface RankRadarProps {
  thoughtDensity: number;   // 0-100
  iterations: number;       // raw count, normalized 0-30 → 0-100
  uptimeDays: number;       // raw days, normalized 0-60 → 0-100
  size?: number;            // px, default 240
}

interface Point { x: number; y: number }

function polarToCart(cx: number, cy: number, r: number, angleDeg: number): Point {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function polyPath(points: Point[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z";
}

const AXES = [
  { label: "思考密度", angleDeg: 0 },
  { label: "試行回数", angleDeg: 120 },
  { label: "稼働日数", angleDeg: 240 },
];

export function RankRadar({ thoughtDensity, iterations, uptimeDays, size = 240 }: RankRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const labelR = size * 0.47;

  // Normalize values to 0-1
  const values = [
    Math.min(thoughtDensity, 100) / 100,
    Math.min(iterations, 30) / 30,
    Math.min(uptimeDays, 60) / 60,
  ];

  // Grid rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Data polygon points
  const dataPoints = AXES.map(({ angleDeg }, i) =>
    polarToCart(cx, cy, values[i] * maxR, angleDeg)
  );

  // Axis end points (100%)
  const axisPoints = AXES.map(({ angleDeg }) =>
    polarToCart(cx, cy, maxR, angleDeg)
  );

  // Label positions
  const labelPoints = AXES.map(({ angleDeg, label }) => ({
    ...polarToCart(cx, cy, labelR, angleDeg),
    label,
    angleDeg,
  }));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="鑑定スコア レーダーチャート"
      role="img"
      className="w-full max-w-[300px]"
    >
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1A6BB5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0FA968" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Grid rings */}
      {rings.map((ratio) => {
        const ringPts = AXES.map(({ angleDeg }) => polarToCart(cx, cy, ratio * maxR, angleDeg));
        return (
          <path
            key={ratio}
            d={polyPath(ringPts)}
            fill="none"
            stroke="#1A1628"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines */}
      {axisPoints.map((pt, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={pt.x} y2={pt.y}
          stroke="#1A1628"
          strokeOpacity={0.15}
          strokeWidth={1}
        />
      ))}

      {/* Data polygon */}
      <path
        d={polyPath(dataPoints)}
        fill="url(#radarFill)"
        stroke="#1A6BB5"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r={3.5} fill="#1A6BB5" />
      ))}

      {/* Labels */}
      {labelPoints.map(({ x, y, label, angleDeg }) => {
        let anchor: "middle" | "start" | "end" = "middle";
        if (angleDeg > 90 && angleDeg < 270) anchor = "end";
        else if (angleDeg >= 270 || angleDeg <= 90) anchor = "start";
        if (angleDeg === 0 || angleDeg === 180) anchor = "middle";

        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={size * 0.055}
            fill="#1A1628"
            fontWeight="500"
          >
            {label}
          </text>
        );
      })}

      {/* Value percentages */}
      {dataPoints.map((pt, i) => {
        const pct = Math.round(values[i] * 100);
        return (
          <text
            key={`val-${i}`}
            x={pt.x}
            y={pt.y - 8}
            textAnchor="middle"
            fontSize={size * 0.045}
            fill="#1A6BB5"
            fontWeight="700"
          >
            {pct}
          </text>
        );
      })}
    </svg>
  );
}
