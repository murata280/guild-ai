# Human-Verified バッジ設計

クリエイターが実際に権利主張を行い、AI ではなく人間が作成したと証明された資産を
可視化するバッジシステムです。

---

## レベル定義

`src/lib/human-verified/index.ts` が実装する `getVerificationLevel()`:

| レベル | 条件 | 説明 |
|--------|------|------|
| `ai-generated` | `claimStatus !== "claimed"` | 未請求（クローラーが発見した仮出品） |
| `human-claimed` | `claimStatus === "claimed"` かつ `trustScore < 600` | 権利主張済みだが信用スコアが中程度 |
| `gold` | `claimStatus === "claimed"` かつ `trustScore >= 600` | 権利主張済み＋高信用スコア |

---

## 価格乗数

`applyHumanPremium(basePrice, level)`:

| レベル | 乗数 | 備考 |
|--------|------|------|
| `gold` | × 1.5 | 人間性プレミアム最高値 |
| `human-claimed` | × 1.2 | 権利主張プレミアム |
| `ai-generated` | × 0.7 | AI 生成ディスカウント |

結果は整数（`Math.round`）に丸めます。

---

## バッジデザイン仕様

`src/components/HumanVerifiedBadge.tsx`:

- `ai-generated` → バッジを表示しない（`return null`）
- `human-claimed` → シルバー（`#C0C0C0`）メダル型 SVG
- `gold` → ゴールド（`#FFCC00`）メダル型 SVG

### SVG 構造
- 外円: 中心 `(12,12)` 半径 `10`
- 内リング: 半径 `7`
- チェックマーク path: `M8 12 l3 3 l5-6`
- ギザギザ（8本）: `Array.from({length:8})` で均等配置

---

## 配置ガイドライン

| 使用場所 | 推奨 |
|---------|------|
| マーケットカード | `gold` のみ表示（スペース節約） |
| 資産詳細ページ | 全レベル表示（ai-generated は非表示） |
| 未請求カード | 表示しない（ProvisionalListing の場合） |

---

## テスト

`src/lib/__tests__/human-verified.test.ts` が以下を検証：

- `provisional` → `ai-generated`
- `claimed + score >= 600` → `gold`
- `claimed + score < 600` → `human-claimed`
- 各レベルの価格乗数
- `ai-generated` の乗数が `< 1.0`
