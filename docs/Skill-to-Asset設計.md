# GUILD AI — Skill-to-Asset 設計図

## 概要

GitHub の草（Contribution Graph）と学習進捗が、即座に知能ランクの向上・収益増に反映される「スキル成長ループ」の設計。

---

## Skill-Sync ロジック表

`src/lib/skill-sync/index.ts`

| 関数 | 入力 | 出力 | 説明 |
|------|------|------|------|
| `getGithubGreenScore(username)` | GitHub username | 0–100 | djb2ハッシュで過去90日の活動量をモック生成。決定論的。 |
| `getLearningProgress(userId)` | userId | 0–20 | 完了モジュール数をモック生成（0–20）。決定論的。 |
| `applySkillBoost(rank, green, learning)` | Rank, number, number | Rank | 閾値判定でランク昇格。 |
| `getSkillBoostHint(username, userId, rank)` | 3引数 | SkillBoostHint | 昇格見込み・ヒント文（執事トーン）を返す。 |

---

## ランク昇格条件

| 条件 | 昇格量 |
|------|--------|
| `greenScore < 70 OR learningProgress < 10` | なし |
| `greenScore ≥ 70 AND learningProgress ≥ 10` | +1 ランク |
| `greenScore ≥ 85 AND learningProgress ≥ 17` | +2 ランク（上限 S） |

```
B → A (green≥70, learn≥10)
B → S (green≥85, learn≥17) [+2]
A → S (green≥70, learn≥10) [+1]
S → S (cap)
```

---

## UI 配置

### /wallet — スキル成長カード（3カラム）

```
┌────────────────────────────────────────────┐
│  GitHubの草    学習の進み    予測ランク      │
│   87 /100       12 /20        A ↑          │
│ [▓▓▓▓▓▓▓▓░]  [▓▓▓▓▓▓░░░]  [▓▓▓▓▓▓░░░]    │
│                                            │
│  もう少しでランクが上がります（あと3%）。    │
│  GitHubへの継続的なコミットをお勧めします。 │
└────────────────────────────────────────────┘
```

- `sm:grid-cols-3` でレスポンシブ（375px以下は縦積み）
- ランク昇格した場合 `↑` バッジと `text-kaki` でハイライト
- 執事トーン: 「もう少しでランクが上がります（あと◯%）」

### /sell — AiPath 内のフィードバック

AiPath の Step 3（リポジトリ確認後）に `applySkillBoost` による暫定ランクを表示：
「あなたの活動が反映されています（予測ランク: A）」

---

## SkillBoostHint 型

```typescript
interface SkillBoostHint {
  boostedRank: Rank;       // 昇格後ランク
  greenScore: number;      // 0–100
  learningProgress: number; // 0–20
  nextBoostPct: number;    // 0–100 次ティアへの進捗
  hintMessage: string;     // 執事トーン
}
```

---

## A11y

- 成長カードの各指標は `aria-label` なしのプレーンテキスト（スクリーンリーダーが数値と単位を読み上げる）
- 予測ランク欄の `↑` は `aria-hidden` を付与（視覚的装飾）
- プログレスバーは `role="progressbar"` は省略（数値が同一行に表示されるため冗長回避）

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/lib/skill-sync/index.ts` | Skill-Sync コアロジック |
| `src/lib/skill-sync/__tests__/skill-sync.test.ts` | 7テスト（範囲・決定論・昇格条件） |
| `src/app/wallet/page.tsx` | SkillGrowthCard コンポーネント |
| `src/app/sell/page.tsx` | AiPath 内暫定ランク表示 |
