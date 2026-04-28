# Trust & Delight Design 設計書（#23）

「指が吸い付く、安心して使える」GUILD AI の UX/UI 実装仕様。
メルカリ・LINE・日本の EC ベストプラクティスをベースに、おもてなしを徹底する。

---

## 1. マイクロコピー集（`src/lib/microcopy/index.ts`）

### エラーページ

| キー | コピー |
|------|-------|
| `notFound.heading` | 「お探しの柿（知能）は、まだ実っていないようです。」 |
| `notFound.body` | 「URLをご確認のうえ、もう一度お試しください。」 |
| `serverError.heading` | 「ご不便をおかけしています。少しだけ時間をください。」 |
| `serverError.body` | 「サーバー側で一時的なエラーが発生しました。しばらくしてからもう一度お試しください。」 |

### トランザクション完了

| キー | コピー |
|------|-------|
| `listingPublished` | 「無事にお店に並びました。あなたの知能が、これから誰かの役に立ち始めます。」 |
| `purchaseDone` | 「無事にお取引が完了しました。あなたの知能の柿、大切にお育てください。」 |
| `auditDone` | 「鑑定が終わりました。スコアをご確認ください。」 |
| `rankUpToS` | 「おめでとうございます！Sランクに昇格しました。魂の登記が完了です。」 |
| `atoaJobDone` | 「AIがお仕事を完了しました。収益がデジタル円残高に加算されます。」 |

### コンテクスチュアルヘルプ（HelpHint ポップオーバー）

| キー | 最大2行コピー |
|------|------------|
| `helpDigitalYen` | 「デジタル上の日本円です。1デジタル円 = 1円で、いつでも現金化できます。」 |
| `helpTrustScore` | 「出品実績・鑑定結果・コミュニティ貢献をもとにAIが算出する信頼指標（0〜1000）です。」 |
| `helpSRank` | 「制作の証明と人間の意思シグナルが確認された最高ランク。「魂の登記」とも呼ばれます。」 |
| `helpEndpoint` | 「AIエージェントがこの知能を直接呼び出せる窓口のアドレスです。自動化やシステム連携に使います。」 |
| `helpFloorPrice` | 「信用スコアをもとにAIが算出した、この知能資産の最低お値段です。」 |
| `helpProofOfMake` | 「制作中の思考や試行回数を記録した「制作の証明」です。作品の誠実さをAIが確認します。」 |
| `helpRankRadar` | 「考えの深さ・仕事の速さ・安定感の3軸でAIが評価したレーダーチャートです。」 |
| `helpRoyalty` | 「この知能が誰かに再利用されるたびに、あなたへ自動で収益が分配されます。」 |

---

## 2. Onboarding Funnel — 30秒登記ガイド

**実装:** `src/components/OnboardingGuide.tsx` + `src/lib/onboarding/index.ts`

### 4ステップ
1. 「ようこそ。30秒であなたの最初の登記をご案内します。」
2. 「右上の『出品する』を押してください。」← CSS矢印ハイライト付き
3. 「あなたの作品を選んだら、こだわりを声で教えてください。」
4. 「鑑定が終わったら『お店に並べる』。完了です。」

### レイアウトルール
- 固定位置: `bottom-20 right-4` (モバイル) / `bottom-6 right-6` (sm+)
- 幅: `w-72` — 375px端末でナビと重ならない（Bottom Nav: h=56px）
- 初回訪問のみ表示 (`localStorage.guild_onboarded` ゲート)
- 「あとで」「次へ」「はじめる →」ボタン

---

## 3. Visual Haptics & 紙吹雪

**実装:** `src/components/Confetti.tsx` + `WillSignalTrigger.tsx`

### トリガー条件
- A→S 昇格時（WillSignalTrigger 内の `stopRecording()` → promoting → done）

### Confetti スペック
| 項目 | 値 |
|------|-----|
| パーティクル数 | 24個 |
| 色 | 青 `#1A6BB5` / 緑 `#0FA968` / 白 `#FAFAFA` / 薄ピンク `#F9C0D0` |
| 初速 | 2–5 px/frame、放射状 |
| 重力 | 0.08 px/frame² |
| 持続時間 | 1.4s（1.2s + 200ms フェードアウト） |
| 実装 | `<canvas>` + `requestAnimationFrame`、外部依存ゼロ |
| 縮小モード | `prefers-reduced-motion: reduce` → 即座にスキップ |

### Haptic
```js
navigator.vibrate?.([20, 40, 20])  // 対応端末のみ
```

---

## 4. Real-time Earn Counter

**実装:** `src/components/SlotNumber.tsx` + `src/lib/live-earnings/index.ts`

### SlotNumber
- easeOutQuart: `1 - (1-t)^4` でカウントアップ
- `duration` デフォルト 1400ms
- `aria-live="polite" aria-atomic="true"` でスクリーンリーダー対応
- `prefers-reduced-motion` → 最終値を即座に表示

### Live Earnings
- `useLiveEarnings(userId)` hook: 初期値 = `getMonthlyEarnings().jpy`
- 5〜8秒ごとに `PSEUDO_DELTAS[i % 8]` (+¥60〜+¥300) を加算
- Dashboard 通帳ヒーローに緑「ライブ」バッジ（脈動アニメ）
- バンプのたびに水琴窟チャイムを再生（ミュート設定考慮）

---

## 5. お墨付きパネル — TrustPanel

**実装:** `src/components/TrustPanel.tsx`

### 表示項目
| 要素 | データソース |
|------|------------|
| ★〜★★★★★ + X.X / 5 | `trustScore / 1000 * 5` |
| Sランク鑑定済みバッジ | `listing.rank` |
| 稼働率 | `getAssetHealth().uptimePercent` |
| 累計実行数 | deterministic hash from `assetId` |
| 不具合発生率 | deterministic from `assetId.charCodeAt(0)` |

### 設置箇所
- `/asset/[id]` の Metrics グリッド直下

---

## 6. HelpHint（？アイコン ポップオーバー）

**実装:** `src/components/HelpHint.tsx`

### アクセシビリティ
- `role="tooltip"`, `aria-describedby`
- ESC キーで閉じる、外クリックで閉じる
- `aria-expanded` on trigger button
- フォーカスアウト時も閉じる (mousedown outside)

### 設置箇所（/asset/[id]）
- 信用スコア、制作の証明、お仕事の受付窓口

---

## 7. Mercari-Blue デザイントークン

### Border Radius
| トークン | 値 | 用途 |
|---------|-----|------|
| `rounded-sm` | 6px | 小タグ、バッジ |
| `rounded-md` | 10px | インプット、スモールカード |
| `rounded-lg` | 14px | ボタン（基本） |
| `rounded-xl` | 18px | カード、パネル |
| `rounded-2xl` | 22px | モーダル、ヒーロー |
| `rounded-3xl` | 28px | 大型カード |

### イージング
```
cubic-bezier(0.22, 1, 0.36, 1)  /* ease-out-quart */
```
- ボタン transition: 200ms
- タップフィードバック: `active:scale(0.98)`
- ホバー拡大: `@media(hover:hover)` のみ `scale(1.01)`
- reduced-motion: duration を 0.01ms に短縮

---

## 8. Sound of Success — 水琴窟チャイム

**実装:** `src/lib/sound/index.ts`

### 合成波形
| パーシャル | 周波数 | ゲイン | ディレイ | 長さ |
|-----------|-------|-------|---------|------|
| 1st (ベル) | 700Hz | 0.12 | 0ms | 0.6s |
| 2nd (残響) | 350Hz | 0.07 | 60ms | 0.5s |
| 3rd (倍音) | 1400Hz | 0.03 | 120ms | 0.3s |

- エンベロープ: 8ms attack → exponentialRampToValueAtTime(0.001) で自然減衰
- 推定音量: ~-18dBFS
- iOS Safari 等: silent fail（AudioContext.resume() 失敗を catch）

### ミュートトグル
- Dashboard ヘッダーに 🔔/🔕 ボタン
- `localStorage.guild_sound_muted` に永続化
- `playSuccessChime()` は `muted === true` のとき即 return

---

## 9. アクセシビリティ チェックリスト

| 項目 | 実装 |
|------|------|
| HelpHint | `role="tooltip"` `aria-describedby` ✅ |
| SlotNumber | `aria-live="polite"` `aria-atomic="true"` ✅ |
| Confetti | `aria-hidden` canvas ✅ |
| OnboardingGuide | `role="dialog"` `aria-label` ✅ |
| Vibration | `navigator.vibrate?.()` フィーチャーディテクション ✅ |
| prefers-reduced-motion | Confetti/SlotNumber/btn-primary/secondary ✅ |
| Sound autoplay | ユーザー操作後のみ AudioContext 起動 ✅ |

---

## 10. UX セルフチェック（375px + reduced-motion）

| チェック項目 | 結果 |
|------------|------|
| OnboardingGuide が Bottom Nav (56px) と重ならない | ✅ bottom-20 (80px) |
| HelpHint ポップオーバーが画面外にはみ出さない | ✅ w-56, -translate-x-1/2 |
| Confetti が reduced-motion でスキップ | ✅ `matchMedia` check at render |
| SlotNumber が reduced-motion で最終値即表示 | ✅ `matchMedia` check in useEffect |
| btn-primary hover が touch デバイスで不発 | ✅ `@media(hover:hover)` ガード |
