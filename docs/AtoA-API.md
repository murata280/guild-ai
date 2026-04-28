# AtoA API — Agent-to-Agent 購入・決済仕様（モック）

## 概要

AIエージェントが自律的に知能資産を購入し、API キーを取得するためのフロー。
人間の介在なしに `createCheckoutSession → confirmPayment → issueApiKeyVerified` を完結させる。

---

## エンドポイント仕様（モック REST）

### POST /api/checkout/session

チェックアウトセッションを作成する。

**Request**
```json
{
  "assetId": "listing_001",
  "buyerId": "agent-xyz",
  "amountJpy": 5000,
  "method": "jpyc",
  "payoutCurrency": "JPYC"
}
```

**Response**
```json
{
  "id": "chk_1714867200000_abc123",
  "status": "pending",
  "amountJpy": 5000,
  "amountJpyc": 5000,
  "createdAt": "2026-04-28T00:00:00.000Z"
}
```

---

### POST /api/checkout/confirm

決済を確定し、セッションを `settled` に遷移させる。

**Request**
```json
{ "sessionId": "chk_1714867200000_abc123" }
```

**Response**
```json
{
  "sessionId": "chk_1714867200000_abc123",
  "status": "settled",
  "txHash": "0xabcdef1234567890"
}
```

---

### POST /api/gateway/issue-key

決済済みセッションを検証し、API キーを発行する。

**Request**
```json
{
  "buyerId": "agent-xyz",
  "assetId": "listing_001",
  "sessionId": "chk_1714867200000_abc123"
}
```

**Response（成功）**
```json
{
  "key": "gld_abc123def456...",
  "issuedAt": "2026-04-28T00:00:01.000Z",
  "callCount": 0
}
```

**Response（未決済エラー）**
```json
{
  "error": "GUILD-E401: Payment not settled. API Key issuance denied."
}
```

---

### POST /api/gateway/proxy

取得した API キーを使って、購入済み知能資産を呼び出す。

**Request**
```json
{
  "apiKeyId": "key-1714867200000-abc123",
  "payload": { "input": "データ分析してください" }
}
```

**Response**
```json
{
  "success": true,
  "latencyMs": 142,
  "output": { "status": "ok", "callCount": 1 }
}
```

---

## エラーコード

| コード | 意味 |
|--------|------|
| `GUILD-E401` | 決済未完了。API キー発行拒否 |
| `GUILD-E404` | API キーまたはセッション不存在 |
| `GUILD-E402` | 残高不足（JPYC） |

---

## AtoA フロー全体

```
Agent A ──→ POST /api/checkout/session   → session_id
Agent A ──→ POST /api/checkout/confirm   → status: settled
Agent A ──→ POST /api/gateway/issue-key  → gld_... API Key
Agent A ──→ POST /api/gateway/proxy      → 知能資産の出力
```

人間の承認ステップが一切不要。Verification Gateway がトラストレイヤーとして機能する。

---

> ⚠️ **モック実装**: 本仕様はドキュメント段階。実際のエンドポイントは Next.js Route Handler として実装予定。
