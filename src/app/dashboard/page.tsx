"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { OwnershipRecord } from "@/types";

export default function DashboardPage() {
  const [owned, setOwned] = useState<OwnershipRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const records: OwnershipRecord[] = JSON.parse(
        localStorage.getItem("guild_owned_assets") ?? "[]"
      );
      setOwned(records);
    } catch {
      setOwned([]);
    }
  }, []);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kuroko">Dashboard</h1>
          <p className="mt-1 text-sm text-[#9890A8]">
            購入済み知能資産の一覧。Vercel にワンクリックでデプロイ可能。
          </p>
        </div>
        <Link href="/marketplace" className="btn-secondary shrink-0">
          Marketplace →
        </Link>
      </div>

      {!mounted ? (
        <div className="mt-12 section-card p-8 text-center">
          <p className="text-sm text-[#9890A8]">読み込み中…</p>
        </div>
      ) : owned.length === 0 ? (
        <div className="mt-8 section-card p-8 text-center">
          <p className="text-[#9890A8] text-sm">まだ保有資産がありません。</p>
          <p className="mt-1 text-xs text-[#9890A8]">
            良質な知能資産を購入すると、ここに表示されます。
          </p>
          <Link href="/marketplace" className="btn-primary mt-5">
            Marketplace を見る →
          </Link>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="section-card p-4">
              <p className="text-[11px] uppercase tracking-widest text-[#9890A8]">保有資産</p>
              <p className="mt-1 text-2xl font-bold text-kuroko tabular-nums">{owned.length}</p>
            </div>
          </div>

          {/* Asset list */}
          <ul className="mt-5 space-y-3">
            {owned.map((record) => (
              <li key={record.assetId} className="section-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-kuroko truncate">{record.assetTitle}</h2>
                    <p className="mt-0.5 text-xs text-[#9890A8]">
                      取得日: {new Date(record.acquiredAt).toLocaleDateString("ja-JP")}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#9890A8] font-mono truncate">
                      {record.assetId}
                    </p>
                  </div>
                  <a
                    href={record.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary shrink-0 text-xs !px-3 !py-2"
                  >
                    Vercel にデプロイ ↗
                  </a>
                </div>
                <div className="mt-3 pt-3 border-t border-kuroko/10">
                  <Link
                    href={`/asset/${record.assetId}`}
                    className="text-xs text-[#9890A8] hover:text-kaki transition-colors"
                  >
                    資産詳細を見る →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
