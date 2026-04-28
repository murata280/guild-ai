# Hybrid Checkout 設計（法定通貨 × JPYC）

## 概要

GUILD AI の購入フローは JPY（法定通貨）と JPYC（円ペッグ・ステーブルコイン）の両方に対応する。
1:1 等価で提示し、購入者が最適な決済手段を選択できる。

---

## 支払い方法（4タイル）

| ID | 表示名 | 決済層 | 払出通貨 |
|----|-------|--------|---------|
| `card` | クレジットカード | Stripe モック | JPY |
| `bank` | 銀行振込 | Stripe モック | JPY |
| `jpyc` | JPYC（保有あり） | JPYC モック | JPYC |
| `onramp` | JPYC を今すぐ買う | Stripe → JPYC | JPYC |

---

## データフロー

```
createCheckoutSession()  →  CheckoutSession (status: "pending")
confirmPayment()         →  PaymentResult   (status: "settled")
issueApiKeyVerified()    →  ApiKey          (gld_... トークン)
holdPayment()            →  EscrowRecord    (status: "held")
confirmOnApiSuccess()    →  EscrowRecord    (status: "confirmed")
release()                →  EscrowRecord    (status: "released")
```

---

## Verification & Trust Layer

`issueApiKeyVerified()` は `isPaymentSettled(sessionId)` を内部で呼び出す。
決済が完了していない場合は `GUILD-E401: Payment not settled. API Key issuance denied.` を throw する。

これにより「お金を払わずに API キーを入手する」ことができない。

---

## JPYC 1:1 ペッグ

- `amountJpy === amountJpyc` — 常に等価
- `resolvePayoutAmount()` は 1:1 で返す
- On-ramp: `onrampJpyc(amountJpy, cardToken)` → `jpycAmount === amountJpy`

---

## モック実装について

> ⚠️ **重要**: 本実装はすべてモック（in-memory）です。実際の金融取引は発生しません。

- Stripe 決済: `src/lib/payments/fiat.ts` — `pi_mock_*` セッション
- JPYC トランザクション: `src/lib/payments/jpyc.ts` — `0x...` ハッシュ（疑似乱数）
- API キー: `src/lib/api-gateway/index.ts` — `gld_...` 32文字トークン（疑似乱数）
- エスクロー: `src/lib/escrow/index.ts` — Map ストア（ページリロードでリセット）

本番環境への移行時は各モジュールを本物の Stripe SDK / JPYC コントラクト呼び出しに差し替える。

---

## コンプライアンス注記

- 本サービスは現時点で資金移動業の登録を行っていない。デモ・プロトタイプ段階。
- JPYC の実際の発行・流通は JPYC 株式会社のライセンスに基づく。
- 本番展開時は資金決済法・暗号資産交換業規制の適用可否を法務確認すること。
