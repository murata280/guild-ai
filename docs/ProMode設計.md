# Pro Mode 設計

プロクリエイター向けの高密度ダッシュボードモードです。ウォレットページ右上の
トグルスイッチで切り替えます。

---

## 表示項目（ProSummaryRow）

`src/components/ProSummaryRow.tsx` が5列グリッドで表示する指標：

| 列 | ラベル | Props | 型 | フォーマット |
|----|--------|-------|-----|------------|
| 1 | `rps` | `rps` | `number` | `toFixed(1)` |
| 2 | `信用` | `trustScore` | `number` | 整数 |
| 3 | `資産` | `totalValueJpy` | `number` | `¥{n.toLocaleString("ja-JP")}` |
| 4 | `24h` | `last24hJpy` | `number` | `¥{n}` 緑色 |
| 5 | `30d P&L` | `last30dPnlJpy` | `number` | `¥{n}` 損益色（赤/緑） |

- フォント: `font-mono tabular-nums text-sm`
- グリッド: `grid-cols-2 sm:grid-cols-5`
- 損益: 0以上 → `text-accent-green`、負 → `text-red-500`

---

## Pro Mode トグル（ProToggle）

`src/components/ProToggle.tsx`:

- `role="switch"` / `aria-checked={isOn}`
- `aria-label="プロモードを切り替え"`
- ON: `bg-kaki`、OFF: `bg-kuroko/20`
- つまみ: `h-4 w-4 bg-white rounded-full`（translate-x-6 / translate-x-1）

---

## localStorage 永続化

キー: `guild_pro_mode`

```ts
// 読み込み（mount 時）
if (localStorage.getItem("guild_pro_mode") === "true") setProMode(true);

// 書き込み（toggle 時）
localStorage.setItem("guild_pro_mode", String(next));
```

---

## 抑制される要素

Pro Mode ON の場合、将来的に以下を非表示にすることを検討：

- 装飾的アニメーション（`prefers-reduced-motion` と同様の扱い）
- オンボーディングガイドのバブル
- ガミフィケーションの紙吹雪エフェクト

現バージョン（v1）では ProSummaryRow の追加表示のみ実装しています。

---

## レスポンシブ動作

| 画面幅 | ProSummaryRow | ProToggle ラベル |
|--------|--------------|----------------|
| モバイル（< sm） | 2列グリッド | 非表示（`hidden sm:inline`） |
| デスクトップ（≥ sm） | 5列グリッド | `Pro` ラベル表示 |

---

## テスト

`src/lib/__tests__/pro-mode.test.ts`（16項目）:

- ProToggle: `role="switch"`、`aria-checked`、`aria-label` の存在確認
- ProSummaryRow: 5指標（rps/信用/資産/24h/30d P&L）、`sm:grid-cols-5`、`tabular-nums`
- Wallet 統合: インポート確認、`guild_pro_mode` キー、localStorage 読み込み、条件付きレンダリング
