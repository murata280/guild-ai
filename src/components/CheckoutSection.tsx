"use client";

import { useState, useCallback } from "react";
import { purchaseAction } from "@/app/actions/checkout";
import type { PaymentMethod, Currency } from "@/types";

interface CheckoutSectionProps {
  assetId: string;
  assetTitle: string;
  price: number;
  onSuccess?: (apiKey: string, receiptUrl?: string, txHash?: string) => void;
}

type FlowState =
  | { kind: "idle" }
  | { kind: "jpyc-connecting" }
  | { kind: "onramp-loading" }
  | { kind: "processing" }
  | { kind: "success"; apiKey: string; receiptUrl?: string; txHash?: string }
  | { kind: "error"; message: string };

function PaymentTile({
  id, icon, label, sublabel, selected, onSelect, badge,
}: {
  id: PaymentMethod; icon: string; label: string; sublabel: string;
  selected: boolean; onSelect: (id: PaymentMethod) => void; badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      aria-label={label}
      className={`relative flex min-h-[56px] flex-col items-start justify-center rounded-xl border px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
        selected
          ? "border-kaki bg-kaki/5 ring-1 ring-kaki/30"
          : "border-kuroko/15 bg-white hover:border-kaki/40"
      }`}
    >
      {badge && (
        <span className="absolute top-2 right-2 rounded-full bg-accent-green/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent-green">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none">{icon}</span>
        <span className="text-sm font-semibold text-kuroko">{label}</span>
      </div>
      <p className="mt-0.5 text-[11px] text-[#9890A8] leading-tight">{sublabel}</p>
    </button>
  );
}

function OnrampModal({ amount, onClose }: { amount: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-base font-bold text-kuroko">クレカでJPYCを購入して支払う</h3>
        <p className="mt-1 text-sm text-[#9890A8]">クレジットカードでJPYCを購入し、即時に決済します</p>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-kuroko/10 bg-surface-inset px-4 py-3">
            <p className="text-xs text-[#9890A8]">購入金額</p>
            <p className="mt-1 text-2xl font-bold text-kuroko tabular-nums">
              {amount.toLocaleString("ja-JP")} <span className="text-base font-normal">JPYC</span>
            </p>
            <p className="text-xs text-[#9890A8]">≒ ¥{amount.toLocaleString("ja-JP")}（1:1）</p>
          </div>
          <div className="rounded-xl border border-kaki/20 bg-kaki/5 px-4 py-3">
            <p className="text-xs text-kaki font-medium">
              JPYCは日本円とほぼ同じ価値で、安全に保管できる安心の電子マネーです
            </p>
          </div>
          <div className="rounded-xl border border-kuroko/10 bg-surface-inset px-4 py-3">
            <p className="text-xs text-[#9890A8] mb-1">カード番号（モック）</p>
            <p className="text-base font-mono text-kuroko">**** **** **** 4242</p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="キャンセル"
            className="flex-1 rounded-xl border border-kuroko/20 py-3 text-sm text-[#4A4464] hover:bg-kuroko/5 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="購入して支払う"
            className="flex-1 btn-primary !py-3"
          >
            購入して支払う
          </button>
        </div>
      </div>
    </div>
  );
}

const DEPLOY_STEPS = [
  "① GitHubリポジトリをクローン中…",
  "② Vercel に接続中…",
  "③ サービスを起動中…",
];

function DeployChecklist({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useState(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    DEPLOY_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), (i + 1) * 400));
    });
    timers.push(setTimeout(onDone, DEPLOY_STEPS.length * 400 + 200));
    return () => timers.forEach(clearTimeout);
  });

  return (
    <div className="mt-4 rounded-xl border border-kaki/20 bg-kaki/5 px-4 py-4 space-y-2">
      {DEPLOY_STEPS.slice(0, step + 1).map((msg, i) => (
        <p key={msg} className="flex items-center gap-2 text-sm text-[#3A3664]">
          <span className={i < step ? "text-accent-green" : "text-kaki animate-pulse"}>
            {i < step ? "✓" : "⟳"}
          </span>
          {msg}
        </p>
      ))}
    </div>
  );
}

const TILES: Array<{
  id: PaymentMethod; icon: string; label: string; sublabel: string;
  badge?: string; payoutCurrency: Currency;
}> = [
  { id: "card",   icon: "💳", label: "クレジットカード（日本円）", sublabel: "Visa / Mastercard 即時決済",         payoutCurrency: "JPY" },
  { id: "bank",   icon: "🏦", label: "銀行振込",                  sublabel: "振込確認後に資産を移転",             payoutCurrency: "JPY" },
  { id: "jpyc",   icon: "🟦", label: "JPYC残高で払う",            sublabel: "保有残高から即時決済",   badge: "残高あり", payoutCurrency: "JPYC" },
  { id: "onramp", icon: "⚡", label: "クレカでJPYCを買って払う",  sublabel: "クレジットカードで電子マネーを購入",   payoutCurrency: "JPYC" },
];

export function CheckoutSection({ assetId, assetTitle: _assetTitle, price, onSuccess }: CheckoutSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
  const [flow, setFlow] = useState<FlowState>({ kind: "idle" });
  const [showOnrampModal, setShowOnrampModal] = useState(false);
  const [showDeployChecklist, setShowDeployChecklist] = useState(false);

  const selectedTile = TILES.find((t) => t.id === selectedMethod)!;

  const handleMethodSelect = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method);
    setFlow({ kind: "idle" });
    if (method === "jpyc") {
      setFlow({ kind: "jpyc-connecting" });
      setTimeout(() => setFlow({ kind: "idle" }), 1000);
    }
  }, []);

  const handlePurchase = useCallback(async () => {
    if (selectedMethod === "onramp") {
      setShowOnrampModal(true);
      return;
    }
    setFlow({ kind: "processing" });
    await new Promise((r) => setTimeout(r, 600));
    const out = await purchaseAction({
      assetId,
      amountJpy: price,
      method: selectedMethod,
      payoutCurrency: selectedTile.payoutCurrency,
    });
    if (out.status !== "settled") {
      setFlow({ kind: "error", message: out.message });
      return;
    }
    setShowDeployChecklist(true);
    setFlow({ kind: "success", apiKey: out.apiKey, receiptUrl: out.receiptUrl, txHash: out.txHash });
    onSuccess?.(out.apiKey, out.receiptUrl, out.txHash);
  }, [assetId, price, selectedMethod, selectedTile.payoutCurrency, onSuccess]);

  const handleOnrampClose = useCallback(() => {
    setShowOnrampModal(false);
    setFlow({ kind: "onramp-loading" });
    setTimeout(async () => {
      const out = await purchaseAction({ assetId, amountJpy: price, method: "onramp", payoutCurrency: "JPYC" });
      if (out.status === "settled") {
        setShowDeployChecklist(true);
        setFlow({ kind: "success", apiKey: out.apiKey, txHash: out.txHash });
        onSuccess?.(out.apiKey, undefined, out.txHash);
      } else {
        setFlow({ kind: "error", message: out.message });
      }
    }, 700);
  }, [assetId, price, onSuccess]);

  if (flow.kind === "success") {
    return (
      <section className="mt-4 section-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-accent-green text-xl" aria-hidden>✓</span>
          <h2 className="text-base font-bold text-kuroko">購入完了 — 知能資産を取得しました</h2>
        </div>
        <div className="rounded-xl border border-accent-green/20 bg-accent-green/5 px-4 py-3 space-y-1">
          <p className="text-xs text-[#9890A8]">APIキー</p>
          <p className="font-mono text-xs text-kuroko break-all">{flow.apiKey}</p>
        </div>
        {flow.receiptUrl && (
          <p className="mt-2 text-sm text-[#9890A8]">領収書: <span className="text-kaki underline">{flow.receiptUrl}</span></p>
        )}
        {flow.txHash && (
          <p className="mt-2 text-sm text-[#9890A8]">取引ID: <span className="font-mono text-xs">{flow.txHash}</span></p>
        )}
        {showDeployChecklist && (
          <DeployChecklist onDone={() => setShowDeployChecklist(false)} />
        )}
        <div className="mt-4">
          <a href="/dashboard" className="btn-primary !py-2 !text-sm">Dashboard で確認 →</a>
        </div>
      </section>
    );
  }

  return (
    <>
      {showOnrampModal && <OnrampModal amount={price} onClose={handleOnrampClose} />}

      <section className="mt-4 section-card p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-[#9890A8]">販売価格</p>
            <p className="text-3xl font-bold text-kuroko mt-0.5">
              ¥{price.toLocaleString("ja-JP")}
            </p>
            <p className="text-sm text-[#9890A8] mt-0.5">
              （{price.toLocaleString("ja-JP")} JPYC・日本円と同等）
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-kaki/30 bg-kaki/10 px-3 py-1 text-xs font-semibold text-kaki">
            AtoA 対応
          </span>
        </div>

        <p className="text-sm font-semibold text-[#3A3664] mb-3">お支払い方法を選択</p>
        <div className="grid grid-cols-2 gap-2">
          {TILES.map((tile) => (
            <PaymentTile
              key={tile.id}
              {...tile}
              selected={selectedMethod === tile.id}
              onSelect={handleMethodSelect}
            />
          ))}
        </div>

        {flow.kind === "jpyc-connecting" && (
          <p className="mt-2 text-sm text-kaki animate-pulse" role="status">残高を確認中…</p>
        )}
        {flow.kind === "onramp-loading" && (
          <p className="mt-2 text-sm text-kaki animate-pulse" role="status">購入処理中…</p>
        )}
        {flow.kind === "error" && (
          <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
            {flow.message}
          </p>
        )}

        <button
          type="button"
          onClick={handlePurchase}
          disabled={flow.kind === "processing" || flow.kind === "jpyc-connecting" || flow.kind === "onramp-loading"}
          aria-label="購入してAPIキーを取得する"
          className="btn-primary w-full !py-4 mt-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {flow.kind === "processing" ? "決済処理中…" : flow.kind === "onramp-loading" ? "購入中…" : "購入してAPIキーを取得する"}
        </button>

        <p className="mt-2 text-xs text-center text-[#9890A8]">
          決済確認後にAPIキーを発行します（安全な認証システムで保護）
        </p>
      </section>
    </>
  );
}
