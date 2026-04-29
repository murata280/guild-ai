"use client";

interface LineChartProps {
  data: number[];
  width?: number;
  height?: number;
  label?: string;
  xLabels?: string[];
}

export function LineChart({
  data,
  width = 320,
  height = 80,
  label,
  xLabels,
}: LineChartProps) {
  if (data.length < 2) return null;

  const padL = 36;
  const padR = 8;
  const padT = 8;
  const padB = 20;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: padL + (i / (data.length - 1)) * innerW,
    y: padT + (1 - (v - min) / range) * innerH,
  }));

  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Grid lines (3)
  const gridVals = [min, min + range * 0.5, max];
  const gridYs = gridVals.map((v) => padT + (1 - (v - min) / range) * innerH);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label ?? "ラインチャート"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{label ?? "ラインチャート"}</title>

      {/* Grid lines */}
      {gridYs.map((y, i) => (
        <g key={i}>
          <line
            x1={padL} y1={y.toFixed(1)}
            x2={padL + innerW} y2={y.toFixed(1)}
            stroke="#2A2F38" strokeWidth="0.5"
          />
          <text
            x={padL - 3}
            y={y + 3}
            textAnchor="end"
            fontSize="8"
            fontFamily="'JetBrains Mono', monospace"
            fill="#98A1B0"
          >
            {gridVals[i].toFixed(0)}
          </text>
        </g>
      ))}

      {/* Gold area fill */}
      <polyline
        points={[
          `${padL},${padT + innerH}`,
          polyline,
          `${padL + innerW},${padT + innerH}`,
        ].join(" ")}
        fill="rgba(212,175,55,0.08)"
        stroke="none"
      />

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* X axis labels */}
      {xLabels && (
        <g>
          {xLabels.map((lbl, i) => {
            const x = padL + (i / (xLabels.length - 1)) * innerW;
            return (
              <text
                key={i}
                x={x}
                y={height - 4}
                textAnchor="middle"
                fontSize="7"
                fontFamily="'JetBrains Mono', monospace"
                fill="#98A1B0"
              >
                {lbl}
              </text>
            );
          })}
        </g>
      )}
    </svg>
  );
}
