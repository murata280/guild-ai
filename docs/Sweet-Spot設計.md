# Sweet Spot 設計書（#26 Professional & Friendly）

## 設計方針

「子どもっぽすぎず、エンジニアすぎない」トーンを実現する。
#25（Ultra-Simple Language）のひらがな多用を修正し、#23（World-Class JA UX）の大人語彙を保ちつつ、
一般ユーザーが自然に読める「コンシェルジュ語」で統一する。

---

## 1. ボイス＆トーン原則

| 原則 | 説明 |
|---|---|
| です・ます体 | すべての通知・ステータスメッセージで敬体を使用 |
| いたします体 | 完了・処理中メッセージは謙譲語で締める |
| 体言止め禁止 | UI ラベル以外で「完了。」「登録。」は使わない |
| 過度なひらがな禁止 | 「おみせ」「ちえ」「しごと」は禁止ワード |

---

## 2. 語彙マッピング（Sweet Spot 修正版）

| #25 表記（NG） | Sweet Spot 表記（OK） | 変更箇所 |
|---|---|---|
| 知能 | スキル | dashboard, sell, marketplace |
| 出品する | 登録する | sell, marketplace CTA |
| 登記する | 登録する | sell フォーム |
| 制作の証明 | こだわり（実績ログ） | asset detail, sell step 2 |
| AI鑑定士 / 鑑定 | AI評価 / 評価 | audit セクション見出し |
| AI同士のお仕事の場 | AI連携窓口 | asset detail セクション |
| 管理画面 | マイページ | dashboard h1 |
| ロイヤリティ収入 | 還元（リワード）収入 | dashboard passbook |
| お仕事 (AtoAジョブ) | 採用 | dashboard stats |
| 知能貢献ランク | 貢献ランク | dashboard gamification |
| 登記済み / 公開済み知能 | 登録済み資産 / 公開資産 | dashboard stats |
| AI鑑定済み | AI評価済み | asset card badge |
| お仕事の受付窓口 | 利用窓口（API） | asset detail AtoA section |

---

## 3. マイクロコピー原則（concierge tone）

`src/lib/microcopy/index.ts` で管理。

### 完了メッセージのパターン
- `〜されました。これより、〜可能です。` — 登録完了
- `お取引が無事に完了いたしました。` — 購入完了
- `評価が完了いたしました。お墨付きをご確認ください。` — 審査完了

### 処理中メッセージのパターン
- `ただいま、〜AIが拝見しております。少々お待ちください。` — 待機中
- `お支払い処理中です。少々お待ちください。` — 決済中

### ヘルプテキストのパターン
- 簡潔に1文で完結。括弧で補足（例：`信用スコアです（0〜1000）`）

---

## 4. SVGアイコンセット

`src/components/icons/index.tsx` — ゼロ依存インラインSVG。

| アイコン | 用途 |
|---|---|
| CrownIcon | S ランクバッジ |
| StarIcon | A ランクバッジ |
| LeafIcon | B ランクバッジ |
| PackageIcon | スキル登録セクション（/sell h1） |
| SearchIcon | AI評価レポートセクション |
| ShoppingBagIcon | マーケットページ h1 |
| UserIcon | マイページ h1 |
| BanknoteIcon | 収益明細セクション |
| LinkIcon | AI連携窓口セクション |
| CodeIcon | Raw Data 折りたたみトグル |
| ChevronDownIcon | 汎用ドロップダウン |

---

## 5. Raw Data タブ（エンジニア向け）

`src/components/RawDataPanel.tsx` — クライアントコンポーネント。

- `<details>` / `<summary>` ネイティブアコーディオン（JS不要でアクセシブル）
- `data-raw="true"` 属性で jargon-lint の例外マーク
- `localStorage.setItem("guild_raw_data_open", ...)` で開閉状態を保持
- コードブロック内は技術用語を解禁（APIエンドポイント、CCAF構造体等）

配置ページ：
- `/asset/[id]` — 資産技術詳細（id, rank, ccaf, agentEndpoint, healthMetrics）
- `/dashboard` — 保有資産配列・TrustScore入力・貢献ランク・通知×10・AtoA APIエンドポイント

---

## 6. 関連ファイル

| ファイル | 役割 |
|---|---|
| `src/lib/microcopy/index.ts` | 全マイクロコピーの Single Source of Truth |
| `src/components/icons/index.tsx` | SVGアイコンセット |
| `src/components/RawDataPanel.tsx` | Raw Data クライアントアコーディオン |
| `src/components/RankBadge.tsx` | CrownIcon/StarIcon/LeafIcon 使用 |
| `docs/用語集.md` | 語彙マッピングのSSOT |
