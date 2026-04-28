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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-kuroko/60">
        購入済み知能資産の一覧。各資産は Vercel にワンクリックでデプロイ可能。
      </p>

      {!mounted ? (
        <p className="mt-12 text-center text-kuroko/40">読み込み中…</p>
      ) : owned.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-kuroko/40">まだ保有資産がありません。</p>
          <Link
            href="/marketplace"
            className="mt-4 inline-block rounded-xl bg-kuroko px-5 py-3 text-kami hover:bg-kuroko/90"
          >
            Marketplace を見る →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {owned.map((record) => (
            <li
              key={record.assetId}
              className="rounded-2xl border border-kuroko/10 bg-white/60 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{record.assetTitle}</h2>
                  <p className="mt-1 text-xs text-kuroko/50">
                    取得日: {new Date(record.acquiredAt).toLocaleDateString("ja-JP")}
                  </p>
                  <p className="mt-0.5 text-xs text-kuroko/40 break-all">{record.assetId}</p>
                </div>
                <a
                  href={record.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-xl bg-kuroko px-4 py-2 text-sm font-semibold text-kami hover:bg-kuroko/90"
                >
                  Vercel にデプロイ ↗
                </a>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/asset/${record.assetId}`}
                  className="text-xs text-kuroko/50 underline hover:text-kuroko"
                >
                  資産詳細を見る
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
