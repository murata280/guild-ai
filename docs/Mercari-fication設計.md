# Mercari-fication 設計書（#20 Non-Engineer Friendly UI）

エンジニア以外のユーザーが「スラスラ使えるUI」を実現するための仕様書。
メルカリ・LINE のUXを参考に、技術用語を日常語に置き換え、3ステップ登記とお財布感覚を全面採用した。

---

## 1. 設計方針

### 1-1. 二層言語ポリシー
- **ユーザー向けUI**（JSX/TSX の visible テキスト）：平易な日本語
- **エージェント向けAPI**（`/api/*` ルートハンドラ・ドキュメント）：英語技術用語を維持

### 1-2. NG用語リスト

| 技術用語（NG） | UI表記（OK） |
|---|---|
| JPYC | デジタル円 / ¥ |
| ステーブルコイン / Stablecoin | デジタル円 |
| CCAF | 制作の証明 |
| API Hotbed | AI同士のお仕事の場 |
| APIエンドポイント | お仕事の受付窓口 |
| API Key | アクセスキー |
| Trust Score | 信用スコア |
| Floor Price | お値段の目安 |
| 思考密度 | 考えの深さ |
| 試行回数 | 仕事の速さ / 試みた回数 |
| 稼働日数 | 安定感 |
| 1-Click Deploy | ワンタップで公開 |
| Repository / Source Code | あなたの作品 / 知能の柿 |
| Marketplace | お店（マーケット） |
| Dashboard | 管理画面 |
| AI Verified | AI鑑定済み |

---

## 2. 3ステップ登記フロー（`/sell`）

### ステップ構成
```
Step 1: あなたの作品を選ぶ  →  Step 2: 魅力を伝える  →  Step 3: お値段を決める
```

### Step 1 — 作品選択（3パス）

**AiPath（おすすめ）**
- GitHub ユーザー名入力 → リポジトリを icon+タイトルカードで一覧表示
- 最も star の多いリポジトリに amber「おすすめ！」リボンを自動付与
- `listRepos()` の `recommended: boolean` フラグで決定論的に選定

**VoicePath（こだわりを話す）**
- Web Speech API で音声録音（3秒以上）
- 録音後 → AI が `generateProductPitch()` でキャッチコピー＋取扱説明5項目を自動生成
- ユーザーは内容を確認してから「この内容でお店に並べる →」ボタンで次へ

**TextPath（自分で書く）**
- 作品タイトル・GitHub URL・説明文をフォーム入力

### Step 2 — 価格設定
- スライダー: `min=500 max=10000 step=100`（¥表示）
- 「類似の知能は ¥3,000 で取引されています」市場参考値を常時表示
- 受け取り通貨ラジオ: `日本円 / デジタル円`（`CURRENCY_LABELS` で表示）

### Step 3 — 完了カード（CompletionCard）
- 「お店に並べました！」見出し
- 公開URL・お仕事の受付窓口（AtoA endpoint）・管理画面リンク

---

## 3. ダッシュボード「今月の通帳」（`/dashboard`）

### PassbookCard 構成
```
今月の通帳
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
今月、あなたの知能がAIにお仕事をして稼いだ金額：¥XX,XXX
先月比 +X%  |  お仕事件数 XX件  |  知能の柿（公開済み）X個
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
内訳：
  お仕事の入金      ¥XX,XXX
  ロイヤリティ受領  ¥X,XXX
  公開ボーナス      ¥X,XXX
```

### 主要関数
| 関数 | ファイル | 用途 |
|------|---------|------|
| `getMonthlyEarnings(userId)` | `src/lib/passbook/index.ts` | 今月の収益サマリー（¥8,000–¥21,000） |
| `getPassbookSnapshot(userId)` | `src/lib/passbook/index.ts` | 通帳スナップショット（デジタル円残高・取引履歴） |

---

## 4. マーケットページ（`/marketplace`）

- タイトル: 「お店（マーケット）」
- ソートラベル: 「信用スコア」（Trust Score → 信用スコア）
- 価格表示: `¥X,XXX`（JPYC 表示を削除）
- フィルター: 「最低 信用スコア」スライダー

---

## 5. 資産詳細ページ（`/asset/[id]`）

- 「AI同士のお仕事の場」セクション（旧 API Hotbed）
- 「AIエージェント対応」バッジ（旧 AtoA API 対応）
- 「← お店に戻る」（旧 ← Marketplace に戻る）
- 「作品を見る →」（旧 GitHub →）
- アクセスキー表示: `Bearer gld_<YOUR_ACCESS_KEY>`

---

## 6. ジャーゴンリンター（`src/lib/__tests__/jargon-lint.test.ts`）

`src/app/**/*.tsx` を自動スキャンして UI に残った技術用語を検出。
CI で常時実行し、NG用語の混入を防ぐ。

### チェック対象
- `JPYC`（TypeScript識別子は除外）
- `ステーブルコイン`
- `Stablecoin`
- `API Hotbed`
- `APIエンドポイント`
- `CCAF`（TypeScript識別子は除外）

### 除外ルール（stripExemptions）
- `// ...` 行コメント
- `/* ... */` ブロックコメント
- `aria-label="..."` 属性
- バッククォートインラインコードフェンス
- `import ...` 文
- TypeScript型注釈・ジェネリクス・変数名

---

## 7. 新規ライブラリ関数

| 関数 | モジュール | 概要 |
|------|---------|------|
| `listRepos(username)` | `github-picker` | `recommended: boolean` フラグ付きリポジトリ一覧（高star→recommended=true） |
| `generateProductPitch(transcript)` | `proof-of-make` | 音声テキスト → キャッチコピー + 取扱説明5項目 |
| `getMonthlyEarnings(userId)` | `passbook` | 今月の収益サマリー（jpy, aiJobs, assetCount, momGrowthPct, breakdown） |

---

## 8. コミット履歴（#20 関連）

| コミット | 内容 |
|---------|------|
| `feat(sell): non-engineer friendly sell flow` | Step1-3 フル書き直し、AiPath/VoicePath/TextPath |
| `feat(dashboard): 今月の通帳 + Mercari-fication` | MonthlyEarnings ヒーロー・CURRENCY_LABELS |
| `chore(copy): jargon removal in marketplace + asset pages` | マーケット・資産詳細の用語置換 |
| `feat(libs): generateProductPitch + getMonthlyEarnings + recommended flag` | 新規ライブラリ関数 |
| `test(jargon-lint): add forbidden-term linter + unit tests` | ジャーゴンリンター + 新規ユニットテスト |
