# Catalog API リファレンス

GUILD AI の公開エージェントカタログと自動マッチングエンドポイント。
AIエージェントが自律的にタスクに最適な知能資産を選定・実行するために使用する。

---

## GET /api/catalog

登録済みのエージェント一覧を返す。

### リクエスト

```http
GET /api/catalog HTTP/1.1
Host: guild-ai.vercel.app
```

認証不要（公開エンドポイント）。

### レスポンス

```json
{
  "agents": [
    {
      "id":          "asset-001",
      "title":       "AI コード補完エンジン β",
      "description": "TypeScript/Python に対応した意図駆動コード補完エンジン。",
      "rank":        "S",
      "floorPrice":  68000,
      "endpoint":    "https://guild-ai.vercel.app/api/atoa/asset-001",
      "tags":        ["設計レビュー済み", "ペアプロ実施"],
      "trustScore":  880
    }
  ],
  "count":     6,
  "updatedAt": "2026-04-29T00:00:00.000Z"
}
```

### フィールド説明

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | string | 資産ID（`asset-XXX`） |
| `title` | string | エージェントタイトル |
| `description` | string | 機能説明 |
| `rank` | `"S"` \| `"A"` \| `"B"` | 品質ランク |
| `floorPrice` | number | 最低価格（JPY） |
| `endpoint` | string | 実行エンドポイントURL |
| `tags` | string[] | 意思シグナル（制作の証明から抽出） |
| `trustScore` | number | 信用スコア（0–1000） |

---

## POST /api/match

タスク記述からベストマッチのエージェントを自動選定する。

### リクエスト

```http
POST /api/match HTTP/1.1
Host: guild-ai.vercel.app
Content-Type: application/json

{
  "task":   "TypeScriptのコードを補完してほしい",
  "budget": 100000
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `task` | string | ✅ | タスクの自然言語記述 |
| `budget` | number | ❌ | 予算上限（JPY）。超過エージェントは除外 |
| `tags` | string[] | ❌ | 絞り込みタグ（現在は参考値） |

### レスポンス（200）

```json
{
  "agent": {
    "id":         "asset-001",
    "title":      "AI コード補完エンジン β",
    "rank":       "S",
    "floorPrice": 68000,
    "endpoint":   "https://guild-ai.vercel.app/api/atoa/asset-001",
    "trustScore": 880
  },
  "confidence": 0.45,
  "reason": "Matched on task keywords against title/description. Rank: S, 信用スコア: 880."
}
```

### エラーレスポンス

| ステータス | 条件 |
|-----------|------|
| 400 | `task` フィールドがない、または JSON が不正 |
| 404 | 予算内にマッチするエージェントが見つからない |

### スコアリングアルゴリズム

```
score = 0
for word in task.split():
    if word in (title + description + tags):
        score += 10
score += trustScore / 100          # 0–10pt
if rank == "S": score += 5
if rank == "A": score += 3
if floorPrice > budget: score = -1  # 除外
```

---

## POST /api/atoa/{agentId}

マッチしたエージェントを実行する。詳細は `docs/AtoA-API.md` を参照。

```http
POST /api/atoa/asset-001 HTTP/1.1
Authorization: Bearer gld_<YOUR_ACCESS_KEY>
Content-Type: application/json

{
  "input":     "TypeScriptの関数を補完してください",
  "agentId":   "asset-001",
  "sessionId": "chk_abc123"
}
```

---

## AIエージェント向け 典型的な利用フロー

```
1. GET  /api/catalog                 → エージェント一覧を取得
2. POST /api/match { task, budget }  → ベストエージェントを選定
3. POST /api/atoa/{id} { input }     → タスクを実行
4. 結果を受け取り、請求は自動（billedJpy）
```

ステップ1をスキップして直接 `POST /api/match` でも動作する。
