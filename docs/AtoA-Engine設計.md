# AtoA Autonomous Execution Engine 設計書（#22）

AIエージェントが人間の介在なしに知能資産を購入・実行・返金まで完結させるエンジン。
「The Heartbeat」= GUILD AI の自律経済の心拍数。

---

## アーキテクチャ概要

```
AIエージェント
    │ POST /api/match   ← タスク内容でベストエージェントを自動選定
    ▼
/api/match  →  AgentCatalogEntry + confidence
    │
    │ POST /api/atoa/{agentId}
    ▼
/api/atoa/[id]/route.ts
    │
    ├── auth check (Bearer gld_<ACCESS_KEY>)
    ├── runWithQA(agentId, input)
    │       ├── createAtoaEscrow()     ← 非カストディ エスクロー
    │       ├── instantiateAgent()     ← インスタンス起動
    │       ├── healthCheck()          ← 自己QA
    │       │     └─ fail → refundAtoaEscrow() + 502
    │       ├── (execute mock output)
    │       ├── recordMicropayment()   ← マイクロペイメント課金
    │       └── releaseAtoaEscrow()   ← 決済確定
    └── 200 { output, durationMs, billedJpy }
```

---

## Block 1: Catalog API

### GET /api/catalog

エージェント一覧を返す。AIエージェントが `POST /api/match` 前に全体を把握するために使用。

**レスポンス例:**
```json
{
  "agents": [
    {
      "id": "asset-001",
      "title": "AI コード補完エンジン β",
      "rank": "S",
      "floorPrice": 68000,
      "endpoint": "https://guild-ai.vercel.app/api/atoa/asset-001",
      "tags": ["設計レビュー済み", "ペアプロ実施"],
      "trustScore": 880
    }
  ],
  "count": 6
}
```

### POST /api/match

タスク内容からベストマッチエージェントを選定する。

**リクエスト:**
```json
{ "task": "TypeScriptのコードを補完してほしい", "budget": 100000 }
```

**スコアリング:**
- キーワードマッチ: `task` の単語がタイトル/説明/タグに含まれると +10pt
- 信用スコアボーナス: `trustScore / 100`（最大10pt）
- ランクボーナス: S=+5, A=+3
- 予算超過: `-1`（除外）

**レスポンス:**
```json
{
  "agent": { "id": "asset-001", ... },
  "confidence": 0.45,
  "reason": "Matched on task keywords against title/description. Rank: S, 信用スコア: 880."
}
```

---

## Block 2: AtoA Escrow + Micropayment Billing

**ファイル:** `src/lib/atoa-escrow/index.ts`

### エスクローライフサイクル

```
createAtoaEscrow()  →  status: "held"
        │
        ├── (成功) releaseAtoaEscrow()  →  status: "released"
        └── (失敗) refundAtoaEscrow()   →  status: "refunded"
```

### 主要関数

| 関数 | 概要 |
|------|------|
| `createAtoaEscrow(agentId, callerId, amount)` | エスクローセッション作成（`esw_...` ID） |
| `releaseAtoaEscrow(id)` | held → released（実行成功時） |
| `refundAtoaEscrow(id)` | held → refunded（健全性チェック失敗時）、冪等 |
| `recordMicropayment(escrowId, perCallAmount)` | コールごとの課金記録（累積） |
| `settleMicropayment(id)` | pending → settled |
| `getMicropaymentTotal(agentId)` | エージェント別の確定済み課金合計 |

---

## Block 3: AtoA Runner — Auto-Instantiate + Health Check + Self-QA

**ファイル:** `src/lib/atoa-runner/index.ts`

### `runWithQA(agentId, input, amount?)` — フルパイプライン

```
1. createAtoaEscrow()          → esw_...
2. instantiateAgent(agentId)   → inst_...  status: "running"
3. healthCheck(instanceId)
   ├── ok=true  → status: "healthy"  → 実行継続
   └── ok=false → status: "degraded"
                  refundAtoaEscrow()
                  return { success: false, refundIssued: true }
4. mock output generation (agentId ベースの決定論的レスポンス)
5. recordMicropayment(escrowId, amount/10)
6. releaseAtoaEscrow()
7. return { success: true, output, durationMs }
```

### 健全性判定ロジック
- agentId に `"degraded"` を含む場合は強制失敗（テストフック）
- 本番では実際のHTTPヘルスチェックに置き換え

---

## Block 4: Income Notifications + Bell UI

**ファイル:** `src/lib/notifications/index.ts`

### `getNotifications(userId)` — 5件の決定論的通知

| type | 表示 |
|------|------|
| `job_income` | 💰 お仕事の入金 |
| `royalty` | 🎁 ロイヤリティ受領 |
| `rank_up` | 🏅 ランクアップ！ |
| `refund` | ↩️ 返金処理 |

- 最初の2件は常に未読（`read: false`）
- `getUnreadCount(userId)` で未読数を取得

**Bell UI:** `src/components/NotificationBell.tsx`
- ヘッダー右上に配置（Dashboard）
- 未読バッジ（amber 数字）
- ドロップダウン展開でリスト表示
- 開いた瞬間に既読マーク（ローカルstate）

---

## POST /api/atoa/[id] — 実行エンドポイント仕様

```
Authorization: Bearer gld_<ACCESS_KEY>   (必須)
Content-Type: application/json

{
  "input":     "タスクを入力してください",
  "agentId":   "agent-xyz",
  "sessionId": "chk_..."
}
```

**成功レスポンス (200):**
```json
{
  "agentId":    "asset-001",
  "instanceId": "inst_1714000000_0001",
  "output":     "タスクを受理し、処理を完了しました。(入力文字数: 12)",
  "durationMs": 55,
  "billedJpy":  68000
}
```

**失敗レスポンス:**
| コード | 意味 |
|--------|------|
| 401 | `GUILD-E401` — Authorization ヘッダーなし/不正 |
| 404 | `GUILD-E404` — エージェントが見つからない |
| 502 | `GUILD-E502` — 健全性チェック失敗、自動返金済み |

---

## 新規テスト一覧（#22 追加分 27件）

| ファイル | テスト数 | 内容 |
|---------|---------|------|
| `atoa-escrow/__tests__/atoa-escrow.test.ts` | 9 | createEscrow, release, refund, micropayment |
| `atoa-runner/__tests__/atoa-runner.test.ts` | 8 | instantiate, healthCheck, runWithQA |
| `notifications/__tests__/notifications.test.ts` | 6 | getNotifications, getUnreadCount |
| 旧テストスイート | 122 | Mercari-fication + 既存 |
| **合計** | **149** | |
