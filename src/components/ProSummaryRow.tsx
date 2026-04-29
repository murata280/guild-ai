"use client";

interface ProSummaryRowProps {
  rps: number;
  trustScore: number;
  totalValueJpy: number;
  maxValueJpy: number;
  minValueJpy: number;
  last24hJpy: number;
  last30dPnlJpy: number;
}

export function ProSummaryRow({
  rps,
  trustScore,
  totalValueJpy,
  last24hJpy,
  last30dPnlJpy,
}: ProSummaryRowProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-4 py-3 border-b border-kuroko/10 font-mono text-sm tabular-nums">
      <div>
        <span className="text-[#9890A8] text-xs">rps</span>
        <br />
        <span className="font-bold text-kuroko">{rps.toFixed(1)}</span>
      </div>
      <div>
        <span className="text-[#9890A8] text-xs">信用</span>
        <br />
        <span className="font-bold text-kuroko">{trustScore}</span>
      </div>
      <div>
        <span className="text-[#9890A8] text-xs">資産</span>
        <br />
        <span className="font-bold text-kuroko">¥{totalValueJpy.toLocaleString("ja-JP")}</span>
      </div>
      <div>
        <span className="text-[#9890A8] text-xs">24h</span>
        <br />
        <span className="font-bold text-accent-green">¥{last24hJpy.toLocaleString("ja-JP")}</span>
      </div>
      <div>
        <span className="text-[#9890A8] text-xs">30d P&amp;L</span>
        <br />
        <span className={`font-bold ${last30dPnlJpy >= 0 ? "text-accent-green" : "text-red-500"}`}>
          ¥{last30dPnlJpy.toLocaleString("ja-JP")}
        </span>
      </div>
    </div>
  );
}
