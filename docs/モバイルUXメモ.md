# モバイル UX メモ

スマホ縦持ち（375px）での操作感設計。「3タップで登記完了」を目標とした導線。

---

## 3タップ登記フロー

```
タップ 1: GitHub タブで自分のユーザー名を入力
タップ 2: リポジトリをタップ選択（自動で URL・説明が入力される）
タップ 3: 「AI 鑑定して Marketplace へ出品する」ボタン
```

入力ソースを GitHub ピッカーにすることで、URL タイピングが不要になり、
実質3タップ（ユーザー名入力 → repo 選択 → 出品ボタン）で登記完了。

---

## 画面設計の原則（375px 縦持ち）

### /sell ページ
- タブバーは `overflow-x-auto` でスクロール可能に。3タブが収まらない場合でも崩れない
- リポジトリ一覧は `min-h-[56px]` のタップターゲット確保
- Step 1–4 のカードは縦スタック、`space-y-4` で統一

### /marketplace ページ
- グリッド: 375px → 1カラム、768px → 2カラム、1280px → 3カラム
- カードは `section-card block p-4`（横スクロールなし）

### /dashboard ページ
- Trust Graph は `grid grid-cols-2 gap-x-4`（375px でも2列）
- ガミフィケーションヘッダーは `flex flex-col sm:flex-row`で縦積み対応

---

## 音声入力の権限フロー

```
1. ユーザーが「録音開始」ボタンをタップ
2. ブラウザがマイク権限を要求
3. 許可 → SpeechRecognition.start()
   拒否 → ボタン無効化 + 「マイクの権限を許可してください」メッセージ
4. 非対応ブラウザ (hasSpeechApi=false) → テキストエリアにフォールバック
```

### SSR 安全性
```typescript
// hasSpeechApi は useEffect 内で評価するためSSRでは必ず false
// SpeechRecognition のインスタンス化は window 存在確認済みの関数内のみ
useEffect(() => {
  setHasSpeechApi(
    typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
}, []);
```

---

## タップターゲットチェックリスト

| 要素 | サイズ | 達成方法 |
|------|--------|---------|
| リポジトリ行 | min-h-56px | `min-h-[56px]` + padding |
| 出品ボタン | 44px+ | `!py-3` → 約 44px |
| 1-Click Deploy | 44px+ | `!px-3 !py-3` |
| タブ切り替え | 36px+ | `py-2` × 3 tabs |
| ランク絞り込み | 36px+ | `py-1.5 px-3` |

---

## UX セルフチェック結果（375px シミュレート）

| チェック項目 | 結果 |
|------------|------|
| 3タップで出品ボタンに到達できるか | ✓ GitHub ピッカー経由で可能 |
| タブバーが375pxで崩れないか | ✓ overflow-x-auto で対応 |
| ボタンが親指で押せるサイズか | ✓ min 44px タップターゲット確保 |
| 音声入力が非対応環境で壊れないか | ✓ テキストフォールバック実装済み |
| Marketplace の highlight が見えるか | ✓ ring-2 ring-kaki animate-pulse (5秒) |
| 1-Click Deploy のチェックリストが読めるか | ✓ bg-white/95 オーバーレイ |
