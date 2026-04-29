# GUILD AI — Final Vision 設計図

## 概要

Showcase × Marketplace の完全統合。スキルを「分身」として登記し、無人マーケットで自律流通させる最終形態。

---

## 情報アーキテクチャ（IA）

```
/                  ← ホーム（思想を登記すれば、AIが買いに来る）
/showcase          ← ✨ つくったもの（タイムライン）
/marketplace       ← マーケット（鑑定済み資産一覧）
/sell              ← おしごとに登録（3パス登記フロー）
/wallet            ← 💰 お財布（収益・信用スコア通帳）
/asset/[id]        ← 資産詳細（鑑定・購入・AtoA）
/dashboard         ← → /wallet（リダイレクト）
```

### ページ別アイコン

| ページ | アイコン | 役割 |
|--------|---------|------|
| ホーム | — | 詩的ヒーロー + 4ステップ解説 |
| つくったもの | ✨ | 自分＋みんなの分身タイムライン |
| マーケット | 🛒 | 鑑定済み資産の探索・購入 |
| おしごとに登録 | 📦 | 3パス登記（AI/声/テキスト） |
| お財布 | 💰 | 収益通帳・信用スコア |

---

## 語彙マッピング（Final Vision §4）

旧語彙から統一された語彙への変換表。

| 旧語彙 | Final Vision 語彙 | 文脈 |
|--------|-----------------|------|
| 知能資産 | 分身 / たからもの | UI全般 |
| スキル資産 | 分身 | カード・CTA |
| 出品する / 登記する | お店にならべる | 動詞CTA |
| 登録する | おしごとに登録する | ナビ・ボタン |
| マイページ / Dashboard | 💰 お財布 | ナビ・ヘッダー |
| お仕事 (漢字) | おしごと (ひらがな) | UI全般 ★jargon-lint禁止 |
| AIが評価して登録する | ✨ お店にならべる | 送信ボタン |
| お店に並べました | あなたの たからもの として登録されました | 完了画面 |

---

## ★ ランク × 星数表（UI統一）

| ランク | 星 | 文脈 |
|--------|----|------|
| S | ★★★★★ | `aria-label="5つ星中5つ"` |
| A | ★★★★☆ | `aria-label="5つ星中4つ"` |
| B | ★★★☆☆ | `aria-label="5つ星中3つ"` |

実装: `src/components/StarRating.tsx`

---

## /showcase — つくったもの タイムライン

### カード構成

```
┌─────────────────────────────────┐
│ [グラデーション thumbnail]  [Sランク] │ ← djb2ハッシュ→グラデーション
│ あなたの たからもの (自分の場合)      │
├─────────────────────────────────┤
│ タイトル                  ★★★★★ │
│ 説明文 (2行)                       │
│ 信用スコア · ¥価格                  │
│ [💖 N]  [シェア]  [この分身に投資する→] │
└─────────────────────────────────┘
```

### ロジック

- `MOCK_MARKETPLACE.slice(0, 6)` を表示
- 先頭1件が「あなたの たからもの」（`isMine=true`）
- 残り5件がタイムライングリッド（`sm:grid-cols-2 lg:grid-cols-3`）
- いいねは楽観的UI（ローカルstate）
- シェアパネルは `ShareButton compact`

---

## /wallet — お財布

`/dashboard` は `redirect("/wallet")` で転送。

### コンポーネント構成

```
WalletPage
├── GamificationHeader (信用スコア・ランク)
├── PassbookCard (通帳カード — 収益・取引履歴)
│   └── ShareButton (passbook_milestone)
├── SesLeverageChart (SESレバレッジ)
└── RawDataPanel (技術的詳細)
```

---

## /sell — おしごとに登録

### 3パス登記フロー

```
[✨ AIにおまかせ バナーボタン]  ← 全画面幅グラデーション
     ↓
┌──────────┬──────────┬──────────┐
│ AIにお任せ │  声で登録  │ 手動入力  │ ← 3タブ
│   1分     │   2分    │   3分    │
└──────────┴──────────┴──────────┘
```

### AiPath 内部フロー

```
GitHub連携 → リポジトリ選択 → extractSalesParts() → [売れる部品プレビュー] → ✨AIにおまかせ
```

### extractSalesParts() 仕様

```typescript
interface SalesParts {
  sellingPoints: string[];   // 最大4件（パターンマッチ）
  productManual: string[];   // 固定5ステップマニュアル
  priceSuggestion: number;   // 3000 + 検出tech数 × 1500
}
```

---

## AtoA 無人マーケット — シーケンス図

```
購入者エージェント
      │
      ▼
runAutonomousAuction(spec)
      │ カタログスコアリング
      │ (trustScore + rankBonus + タグ一致 + budget制限)
      ▼
top-3 MatchResult → winner選定
      │
      ▼
AtoAエスクロー held (esw_xxx)
      │
      ▼
recordSettlement(matchId, escrowId, amount)
      │ エスクロー解放 + APIキー発行 (key_xxx)
      ▼
売り手クリエイター 収益反映
      │
      ▼ (紹介者がいる場合)
attributeAmbassadorReward(ambassadorId, saleAmount, 0.05)
      │ Discord貢献度 +5pt
      ▼
アンバサダー 報酬 5%
```

---

## Ambassador Meritocracy フロー

```
アンバサダー
  └→ 分身をXでシェア
  └→ 購入が発生
  └→ attributeAmbassadorReward() が呼ばれる
       ├─ rewardAmount = saleAmount × 0.05
       ├─ discordBridge.ingest({ kind: "share" })
       └─ AwardedAt タイムスタンプ記録
```

シェアボタン (`ShareButton`) から `listing_published` コンテキストで生成したテキストがアンバサダーの紹介経路となる。

---

## computeFloorPrice ロジック表

| 呼び出し形式 | 用途 | 計算式 |
|------------|------|--------|
| `computeFloorPrice(rank, ratingCount, base)` | 出品価格下限決定 | `base × rankMul × (1 + min(ratings,20)×0.01)` |
| `computeFloorPrice(price, trustScore)` | レガシー（ai-auditor） | `price × (0.8 + trust/5000)` |

| ランク | rankMul |
|--------|---------|
| S | 1.5 |
| A | 1.2 |
| B | 1.0 |

---

## NASA vs 自販機 — 登記体験の設計哲学

| 指標 | NASA 基準（目指す） | 自販機水準（避ける） |
|------|-------------------|--------------------|
| 登記までの操作数 | 3タップ以内 | 10フォーム入力 |
| 価格設定 | AIが自動提示 | 手動入力のみ |
| 鑑定結果 | リアルタイムレーダー | 静的テキスト |
| 完了体験 | 紙吹雪 + チャイム | 「送信しました」 |
| 次のアクション | シェアボタン即表示 | なし |

---

## Social Share — 挑発的クロージング質問（全テンプレート共通）

```
自分の価値を、自分の手に。
あなたはいつまで自分のスキルを誰かに預けておくつもり？
```

5コンテキスト × 3テンプレート = 15パターン、全末尾に付加。

実装: `src/lib/social-share/index.ts` の `CLOSING` 定数。

---

## 実装済みファイル一覧（Final Vision）

| ファイル | 内容 |
|---------|------|
| `src/components/StarRating.tsx` | S/A/B → ★数変換 |
| `src/app/showcase/page.tsx` | つくったもの タイムライン |
| `src/app/wallet/page.tsx` | お財布ページ |
| `src/app/dashboard/page.tsx` | /wallet へリダイレクト |
| `src/components/SidebarNav.tsx` | 5項目ナビ（おしごとに登録・お財布） |
| `src/lib/listing-generator/index.ts` | extractSalesParts() 追加 |
| `src/lib/atoa-marketplace/index.ts` | runAutonomousAuction + recordSettlement |
| `src/lib/discord-bridge/index.ts` | attributeAmbassadorReward() 追加 |
| `src/lib/trust-score/index.ts` | computeFloorPrice() 2オーバーロード |
| `src/lib/social-share/index.ts` | CLOSING 定数・全15テンプレート |

---

## Refinement v2: EtoE star sync, Skill-to-Asset, Ambassador smart-contract feel

### 用語最終統一（Refinement v2）

| 旧表記（廃止） | 新表記 |
|--------------|--------|
| AI連携窓口 | おしごと窓口 |
| 利用窓口（API） | おしごと窓口（接続先） |
| 資産を登録する | たからもの登録する |
| 分身として登録する | たからもの登録する |
| 登録する（Step 1） | たからもの登録 |
| マーケットへ（Step 3） | マーケットに並ぶ |
| 自動で入金（Step 4） | 買われたら自動でお金が入る |

ホームページ追加タグライン：「自慢が、そのまま"たからもの"になる場所です。」

### EtoE ピアレビュー → 信用スコア直結

`computeTrustScore()` が `peerRatings?: number[]` と `peerComments?: number` を受け付ける。

```
EtoE-enhanced: 0.4q + 0.2d + 0.15x + 0.15*peerAvg + 0.10*log(comments)*30
legacy (peer fields omitted): 0.5q + 0.3d + 0.2x  ← 既存テスト互換
```

`/asset/[id]` の `AssetReview` コンポーネントで★投票・コメントを受け付け、Trust Score へフィードバック。

### Skill-to-Asset Sync

`src/lib/skill-sync/index.ts`:

| 関数 | 入力 | 出力 |
|------|------|------|
| `getGithubGreenScore(username)` | GitHub username | 0–100（90日活動量） |
| `getLearningProgress(userId)` | userId | 0–20（完了モジュール数） |
| `applySkillBoost(rank, green, learning)` | Rank + 2 scores | boosted Rank |

**昇格条件:**
- `green ≥ 70 AND learning ≥ 10` → +1 rank
- `green ≥ 85 AND learning ≥ 17` → +2 ranks (cap S)

`/wallet` 通帳上部の「スキル成長カード」（3カラム）で可視化。

### Ambassador Smart-Contract Feel

`attributeAmbassadorReward()` が `txHash: string` (0x + 64 hex) を返すようになった。

通知メッセージ例：
```
アンバサダー ◯◯ さんに ¥500 を分配しました（tx: 0x1a2b3c...）
```

`getAmbassadorNotifications()` / `getAllNotifications()` で /wallet 通知ベルから分配履歴を確認可能。

---

## #38 Hybrid Visual Asset Hierarchy

詳細: `docs/Hybrid-Visual設計.md`

### 知能の紋章（Asset Emblem）

`src/lib/asset-emblem/index.ts`:
- `generateEmblemSpec(assetId)` — djb2 ハッシュで 10 色パレットから 3 色選択、5/7 軸対称花びら構造を決定
- `renderEmblemSvg(spec, size?)` — SVG 文字列生成（API エンドポイント用）
- `specToVectorEmbedding(spec)` — 14 次元 float32 ベクトル（AtoA 類似度マッチング）

### HumanThumbnail: 写真 > 紋章

```
HumanThumbnail（use client）
  → photoUrl あり: <img src={dataUrl}>
  → フォールバック: <AssetEmblem> (JSX SVG, no dangerouslySetInnerHTML)
```

### 適用ページ

| ページ | 変更 |
|--------|------|
| `/showcase` | グラデーション thumbnail → HumanThumbnail |
| `/marketplace` | カード上部に HumanThumbnail サムネイル追加 |
| `/asset/[id]` | タイトル行左に AssetEmblem（56px） |
| `/sell` 完了画面 | 写真アップロードセクション追加 |

### API 追加

| エンドポイント | 追加 |
|--------------|------|
| `GET /api/emblem/[assetId]` | `image/svg+xml` レスポンス（新規） |
| `GET /api/catalog` | `emblem: { spec, svgUrl, vectorEmbedding }` |
| `POST /api/atoa/[id]` | `emblem: { vectorEmbedding, svgUrl }` |

### Shimmer アニメーション

`globals.css` に `.shimmer` クラス（0.6s、prefers-reduced-motion 対応）追加。

### テスト: 45 件追加（計 284 件）

- `asset-emblem/__tests__/asset-emblem.test.ts`: 14 件
- `asset-photos/__tests__/asset-photos.test.ts`: 12 件（AssetEmblem / HumanThumbnail コンポーネント含む）
- `__tests__/visual-hierarchy.test.ts`: 19 件（API・CSS・ページ統合）

---

## Refinement v5: Singularity Standard UI

### 概要

感情とデータの二層UIシステム。ユーザー体験の感情的側面（情緒タグ・シマエナガ・Flip-Motion）と技術的側面（JSON-LD・Activity Pulse・Two-Way Pricing・Trust-Lock）を統合した第5世代 UI。

### 追加コンポーネント

| コンポーネント | パス | 説明 |
|--------------|------|------|
| Shimaenaga | `src/components/Shimaenaga.tsx` | マスコット（wave/trust/key/coin × xs/sm/md/lg） |
| FlipCard | `src/components/FlipCard.tsx` | 表/裏の二層カード（PC:hover、Mobile:tap） |
| ActivityPulse | `src/components/ActivityPulse.tsx` | SVGハートビート + リクエスト頻度表示 |

### 追加ライブラリ

| モジュール | パス | 説明 |
|-----------|------|------|
| emotional-tags | `src/lib/emotional-tags/index.ts` | ランク別情緒タグ辞書 |
| structured-data | `src/lib/structured-data/index.ts` | JSON-LD / Schema.org ビルダー |
| computeBundlePricing | `src/lib/checkout/index.ts` | Two-Way Pricing 計算関数 |

### UI 変更

| ページ | 変更内容 |
|--------|---------|
| `/marketplace` | aspect-[3/2] ヒーロー・情緒タグ・FlipCard・ActivityPulse（裏面） |
| `/showcase` | aspect-[3/2] ヒーロー・情緒タグ・FlipCard |
| `/asset/[id]` | ヒーロー拡大・JSON-LD・Trust-Lock・Two-Way Pricing・ActivityPulse |
| `/sell` | CompletionCard に Shimaenaga coin・Two-Way Pricing 派生値 |
| `/wallet` | ActivityPulse（保有資産の鼓動） |
| `layout.tsx` | サイドバーに Shimaenaga wave |
| `not-found.tsx` | Shimaenaga wave 追加 |

### テスト: 11 件追加（計 330 件）

- `emotional-tags/__tests__/emotional-tags.test.ts`: 4 件
- `structured-data/__tests__/structured-data.test.ts`: 3 件
- `checkout/__tests__/bundle-pricing.test.ts`: 3 件（computeBundlePricing + computeMonthlyFromFloor）
- `lib/__tests__/activity-pulse.test.ts`: 1 件

### 設計原則

1. **感情ファースト** — 技術仕様は裏側に隠す。表側は情緒タグ・ヒーロー画像・直感的価格のみ
2. **決定論的パーソナライズ** — 情緒タグ・Activity Pulse は assetId の djb2 ハッシュで決定。SSR でもハイドレーション不一致なし
3. **段階的開示** — Flip-Motion でエンジニア向け技術詳細を「めくって見る」体験
4. **アクセシビリティ** — reduced-motion・aria-live・aria-pressed で全操作に対応
5. **SEO** — JSON-LD (Product + SoftwareApplication) + OGP を各資産ページに自動注入

---

## Mass Merchandising (v2)

詳細: `docs/Mass-Merchandising設計.md`

### 3x 密度戦略

同一資産を3つのペルソナ（一般・PM・エンジニア）向けにコンテキストを切り替えて訴求する。

- **ペルソナフィルタ** — `/marketplace` に「表示スタイル」フィルタ（一般 / PM / エンジニア）を追加。タブ切り替えでカードのヘッドライン・バレット・CTA が即座に変わる
- **BeforeAfterHero** — `AssetSpirit` の代替として、djb2 ハッシュで決定論的に Before/After の二分割 SVG を自動生成。5テンプレート × 3ランクカラーで多様な見た目を実現
- **Lazy Mount** — `useLazyMount` (IntersectionObserver + `rootMargin: 200px`) でカードを遅延マウント。スクロール中の描画負荷を軽減し、スケルトンでレイアウトシフトを防止
- **マスコット配置ルール確定** — `AssetSpirit` / `Shimaenaga` は商品カードから撤退。Trust-Lock・サイドバー・エラー画面・ローディングのみに限定

### 追加コンポーネント

| コンポーネント | パス | 説明 |
|--------------|------|------|
| `BeforeAfterHero` | `src/components/BeforeAfterHero.tsx` | Before/After 二分割 JSX SVG ヒーロー |
| `useLazyMount` | `src/hooks/useLazyMount.ts` | IntersectionObserver ベースの遅延マウント |

### 追加ライブラリ

| モジュール | パス | 説明 |
|-----------|------|------|
| `before-after` | `src/lib/before-after/index.ts` | SVG 仕様生成 + SVG 文字列レンダラー |
| `persona-cards` | `src/lib/persona-cards/index.ts` | 3 ペルソナ別カード仕様生成 |


## Double-Layer UI (v3)

双層 UI アーキテクチャ — 詳細は `docs/Double-Layer-UI設計.md` 参照。

### 追加コンポーネント

| コンポーネント | パス | 説明 |
|---|---|---|
| `BilingualLayout` | `src/components/BilingualLayout.tsx` | モバイルタブ / デスクトップ2カラム切り替え |
| `IntelligenceCore` | `src/components/IntelligenceCore.tsx` | ガラス玉型知能コアSVGウィジェット |
| `Shimaenaga` (mode拡張) | `src/components/Shimaenaga.tsx` | avatar/seal/guardian モード追加 |

### 追加ライブラリ

| モジュール | パス | 説明 |
|---|---|---|
| `morph` | `src/lib/morph/index.ts` | assignMorphTag + startViewTransition |
| `guild-id` | `src/lib/guild-id/index.ts` | GUILD:XXXX-XXXX-XXXX 名前空間 + URI パーサー |

## Refinement v8: Genesis Architecture

クローリング → 仮 CCAF 生成 → 未請求展示 → 権利主張 → 遡及解禁 の5フェーズパイプライン。詳細は `docs/Genesis-Architecture設計.md` 参照。

### 追加モジュール

| モジュール | パス |
|---|---|
| `crawler` | `src/lib/crawler/index.ts` |
| `draft-listing` | `src/lib/draft-listing/index.ts` |
| `ownership-verify` | `src/lib/ownership-verify/index.ts` |
| `value-pool` | `src/lib/value-pool/index.ts` |
| `ClaimFlow` | `src/components/ClaimFlow.tsx` |
| `PoolPulse` | `src/components/PoolPulse.tsx` |
