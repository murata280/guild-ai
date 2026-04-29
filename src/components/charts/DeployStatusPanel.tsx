"use client";

import type { DeployStatus } from "@/lib/terminal-data";

const STATE_STYLES: Record<DeployStatus["buildState"], { dot: string; label: string }> = {
  READY:    { dot: "bg-positive", label: "READY" },
  BUILDING: { dot: "bg-[var(--t-gold,#D4AF37)] animate-pulse", label: "BUILDING" },
  ERROR:    { dot: "bg-negative", label: "ERROR" },
};

interface DeployStatusPanelProps {
  status: DeployStatus;
}

export function DeployStatusPanel({ status }: DeployStatusPanelProps) {
  const s = STATE_STYLES[status.buildState];

  return (
    <div
      role="status"
      aria-label={`デプロイ状況: ${status.buildState}`}
      className="font-mono text-[11px] grid grid-cols-[auto_1fr] gap-x-3 gap-y-1"
    >
      <span className="text-[var(--text-muted,#98A1B0)]">branch</span>
      <span className="text-[var(--text-primary,#E8EBF0)]">{status.branch}</span>

      <span className="text-[var(--text-muted,#98A1B0)]">commit</span>
      <span className="text-[var(--t-gold,#D4AF37)]">{status.commit}</span>

      <span className="text-[var(--text-muted,#98A1B0)]">state</span>
      <span className="flex items-center gap-1.5">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden />
        <span className={status.buildState === "READY" ? "text-positive" : status.buildState === "ERROR" ? "text-negative" : "text-[var(--t-gold,#D4AF37)]"}>
          {s.label}
        </span>
      </span>

      <span className="text-[var(--text-muted,#98A1B0)]">build</span>
      <span className="text-[var(--text-primary,#E8EBF0)]">{status.buildTime}</span>

      <span className="text-[var(--text-muted,#98A1B0)]">url</span>
      <span className="text-[var(--t-gold,#D4AF37)] truncate">{status.url}</span>
    </div>
  );
}
