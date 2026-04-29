"use client";

interface OrderBookLiteProps {
  assetId: string;
}

function mockOrders(id: string, side: "buy" | "sell") {
  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 17);
  return Array.from({ length: 5 }, (_, i) => {
    const base = 3000 + (seed % 2000);
    const offset = (side === "buy" ? -1 : 1) * (i + 1) * 80;
    const price = base + offset;
    const qty = 1 + ((seed + i * 3) % 8);
    return { price, qty };
  });
}

export function OrderBookLite({ assetId }: OrderBookLiteProps) {
  const buys = mockOrders(assetId, "buy");
  const sells = mockOrders(assetId, "sell").reverse();

  return (
    <div
      role="region"
      aria-label={`オーダーブック — ${assetId}`}
      className="font-mono text-[11px] tabular-nums"
    >
      <div className="grid grid-cols-2 gap-0">
        {/* Sell side */}
        <div>
          <div className="text-[10px] text-[var(--text-muted,#98A1B0)] uppercase tracking-widest px-2 pb-1 border-b border-[var(--divider,#2A2F38)]">
            Ask (売り)
          </div>
          {sells.map((o, i) => (
            <div key={i} className="flex justify-between px-2 py-0.5 hover:bg-negative/10">
              <span className="text-negative">¥{o.price.toLocaleString()}</span>
              <span className="text-[var(--text-muted,#98A1B0)]">{o.qty}</span>
            </div>
          ))}
        </div>
        {/* Buy side */}
        <div>
          <div className="text-[10px] text-[var(--text-muted,#98A1B0)] uppercase tracking-widest px-2 pb-1 border-b border-[var(--divider,#2A2F38)]">
            Bid (買い)
          </div>
          {buys.map((o, i) => (
            <div key={i} className="flex justify-between px-2 py-0.5 hover:bg-positive/10">
              <span className="text-positive">¥{o.price.toLocaleString()}</span>
              <span className="text-[var(--text-muted,#98A1B0)]">{o.qty}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
