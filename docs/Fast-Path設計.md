# Fast-Path 設計 — 3分出品UX

## 概要

GUILD AI の出品フローを最速3分で完結させるための設計仕様。
3つのパスすべてが同一の `CompletionCard` に収束し、`deployUrl` と `apiEndpoint` を発行する。

---

## 3パス比較

| パス | ラベル | 想定時間 | 入力 | AI介在度 |
|------|--------|----------|------|----------|
| AI パス | AIにお任せ | ≈ 30秒 | GitHub ユーザー名のみ | 全自動 |
| 音声パス | 音声で登録 | ≈ 60秒 | 音声入力（日本語） | 高（フォーマット変換） |
| テキストパス | 手動で入力 | ≈ 3分 | フォーム入力 | 中（鑑定のみ） |

---

## TimerBar 仕様

- 開始: 最初の操作（パス選択 or 入力開始）時に `startAt = Date.now()` をセット
- ポーリング: 500ms ごとに残り時間を再計算（`Date.now() - startAt` でドリフト防止）
- 表示: `M:SS` 形式（例: `2:45`）
- 警告: 3分（180秒）超過でバーが赤（`bg-red-500`）に変化
- 超過メッセージ: 「目安の3分を超えました」

---

## AutoProgress ステップ（AI パス・DoItForMe）

```
0  README を取得中…        (0.0–0.8s)
1  セールスポイントを抽出中…  (0.8–1.6s)
2  最適価格を算出中…         (1.6–2.4s)
3  AI 鑑定中…               (2.4–3.2s)
4  Marketplace に出品中…     (3.2–4.0s)
5  デプロイ URL を発行中…    (4.0–4.8s)
```

各ステップ 0.8秒。完了済みステップは `✓`、現在進行中は `⟳`、未実行は `○` で表示。

---

## Will Signal Trigger 動作

### 発火条件
- 現在の鑑定ランクが **A ランク**であること
- テキストパスの鑑定プレビュー後、または `/asset/[id]` ページ上に表示

### 録音フロー
1. 「✨ 意思を吹き込んでSへ昇格」ボタン押下 → 録音開始
2. 最低 **3秒以上**の音声入力が必要
3. 3秒経過後に「録音完了 → Sランクへ昇格」ボタンが有効化
4. 完了 → 1.2秒のプロモーション演出 → Toast 表示

### 結果
- ランク: A → **S**
- フロア価格: `現在価格 × 1.5`（+50%）
- Toast: 「🎉 Sランクへ昇格しました！ (+50% 価格)」（4秒表示）
- 一度昇格したらトリガーは非表示（`state === "done"`）

---

## DoItForMe — 全自動出品

1. ユーザーが GitHub ユーザー名を入力済みの状態で「全自動でAIにお任せ」ボタンを押す
2. オーバーレイ表示 → AutoProgress が6ステップを自動進行（計 ≈5秒）
3. `extractFromReadme` → `audit()` → CompletionCard へ収束
4. 未入力の場合はAIパスへ自動遷移

---

## CompletionCard 出力項目

| 項目 | 内容 |
|------|------|
| deployUrl | `https://vercel.com/new/clone?repository-url={githubUrl}` |
| apiEndpoint | `https://guild-ai.vercel.app/api/atoa/{listingId}` |
| Dashboard | `/dashboard` へのリンク |

---

## 3パスの収束フロー

```
AiPath     ─┐
VoicePath  ─┼→ onComplete(CompletionData) → CompletionCard
TextPath   ─┘
```

`CompletionData` = `{ deployUrl, apiEndpoint, listingId }`
