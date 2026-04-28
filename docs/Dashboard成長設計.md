# Dashboard 成長設計

GUILD AI Dashboard の「消費者 → 提供者」昇格体験の設計仕様。

---

## 1. 知能貢献ランク（Contribution Rank）

### ランク表

| ランク | 必要スコア | バッジ色 | ベネフィット |
|--------|-----------|---------|------------|
| Newcomer | 0–9 pt | グレー | — |
| Riser | 10–29 pt | 淡パープル | Remix 機能解放 |
| Creator | 30–59 pt | パープル | 手数料 3% 割引 |
| Pro Creator | 60–99 pt | 白文字パープル | ロイヤリティ受領枠拡張 |
| Legendary | 100+ pt | ダーク | 最上位露出・全機能解放 |

### スコア計算式

```
score = ownedCount × 5 + salesCount × 10 + listingCount × 15 + apiCalls × 1
```

| 行動 | 加点 |
|------|------|
| 知能資産を1つ購入 | +5 pt |
| 販売 1 件成立 | +10 pt |
| 知能を1つ出品 | +15 pt |
| API コール 1 回 | +1 pt |

### 進捗バー

```
progress = (score - currentRankMin) / (nextRankMin - currentRankMin) × 100
```

Legendary は progress = 100（上限固定）。

---

## 2. ネクストアクション ロジック分岐表

| 状態 | 表示メッセージ |
|------|--------------|
| ownedCount = 0 | 「まず1つ知能を購入してランクアップへ。」 |
| ownedCount ≥ 1、listingCount = 0 | 「初めての出品をすると手数料3%OFF＋次のランクに近づく。」 |
| listingCount ≥ 1、salesCount = 0 | 「Remix出品で初販売を目指そう。達成で大きくランクアップ。」 |
| nextRank に あと ≤ 10 pt | 「あと一歩！{nextRank} まであと {ptsToNext} pt。」 |
| 上記以外 | 「あと {ptsToNext} pt で {nextRank} に昇格。出品数を増やそう。」 |
| rank = Legendary | 「最高ランク達成！知能経済のパイオニアです。」 |

---

## 3. Trust Graph（信頼の可視化）

各保有資産カードに inline で表示する2本のバー。

| 指標 | 色 | 範囲 | 算出 |
|------|----|------|------|
| 稼働率 (Uptime) | パープル（kaki） | 95.0–99.9% | `95 + (djb2(assetId) % 50) / 10` |
| 成功率 (Success Rate) | エメラルド | 96.0–99.4% | `96 + (djb2(assetId+"_sr") % 35) / 10` |

`djb2` はシード固定の決定論的ハッシュ（`src/lib/asset-health/index.ts`）。
同じ assetId は常に同じ値を返すため、SSR/CSR 間のハイドレーション不整合なし。

ライブ感演出：`animate-ping` クラスの緑ドット + 「稼働中」ラベル。

---

## 4. Remix & Sell 導線フロー

```mermaid
flowchart LR
    A[Dashboard\n保有資産カード] -->|「この知能を組み合わせて出品」クリック| B[/sell?remix=assetId&from=title]
    B --> C[SellPage\nSellContent]
    C --> D{remixFrom あり?}
    D -- Yes --> E[Remix チップ表示\n説明文を自動プレフィル\nAPIキー継承チェックON]
    D -- No --> F[通常の出品フォーム]
    E --> G[Step 1–4 フォーム記入]
    F --> G
    G --> H[出品する ボタン]
    H --> I[listing_\{timestamp\} 生成\n※ remixedFrom を Listing に付与]
```

### クエリパラメータ仕様

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `remix` | string | 元資産の assetId |
| `from` | string | 元資産のタイトル（URI エンコード済み） |

### 説明文の自動プレフィル

`src/lib/listing-generator/index.ts` の `generateRemixDescription(originalTitle)` が以下を返す：

```
「{originalTitle}」の機能を活用し、新しいユースケースに特化した知能資産。
既存の API キーを継承しつつ、独自の拡張を加えて再登記。
```

### Royalty 系譜との連携

`Listing.remixedFrom` フィールドに元資産 ID を格納することで、将来の Royalty 計算（`src/lib/royalty`）において lineage 配列に自動挿入できる土台となる。今回の実装では UI 表示とフィールド保存まで。

---

## 5. UI 実装ファイル一覧

| ファイル | 役割 |
|---------|------|
| `src/app/dashboard/page.tsx` | GamificationHeader / AssetCard / Trust Graph |
| `src/app/sell/page.tsx` | Remix チップ / 説明文プレフィル / APIキー継承 |
| `src/lib/contribution-rank/index.ts` | スコア計算・ランク判定・ネクストアクション |
| `src/lib/asset-health/index.ts` | Uptime / Success Rate 決定論的生成 |
| `src/lib/listing-generator/index.ts` | `generateRemixDescription` |
