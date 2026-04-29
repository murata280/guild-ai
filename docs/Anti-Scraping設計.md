# Anti-Scraping 設計

GUILD AI はクリエイターの知能資産を AI 大企業による大量スクレイピングから保護する
多層防衛を実装しています。

---

## 1. robots.txt ブロックリスト

`public/robots.txt` は以下のボットを全 URL からブロックします：

| Bot | 運営 |
|-----|------|
| GPTBot | OpenAI |
| Google-Extended | Google (Gemini 学習用) |
| ClaudeBot | Anthropic |
| CCBot | Common Crawl |
| anthropic-ai | Anthropic |
| Bytespider | ByteDance / TikTok |
| PerplexityBot | Perplexity AI |
| Diffbot | Diffbot |
| Amazonbot | Amazon |
| Applebot-Extended | Apple (AI 学習用) |

すべてに `Disallow: /` を設定し、一般検索クローラー（Googlebot 等）は許可します。

---

## 2. X-Robots-Tag レスポンスヘッダー

`next.config.js` の `async headers()` で以下を設定：

| パス | X-Robots-Tag 値 |
|------|----------------|
| `/` | `index, noarchive` |
| `/api/catalog` | `noindex, nofollow` |
| `/api/match` | `noindex, nofollow` |
| `/api/atoa/:path*` | `noindex, nofollow` |
| `/asset/:path*` | `index, noarchive, max-snippet:140` |

- API エンドポイントは `noindex, nofollow` でクローラーの収集を防止
- 資産詳細は `noarchive` でキャッシュを禁止、`max-snippet:140` でスニペットを制限

---

## 3. CCAF 難読化（Shield）

`src/lib/shield/index.ts` が実装する公開 API 向け値のバケット化：

| フィールド | 公開値（バケット） | 完全値の例 |
|-----------|-----------------|-----------|
| `thoughtDensity` | `high` / `medium` / `low` | `73` |
| `iterations` | `15+` / `8-14` / `1-7` | `18` |
| `note` | `フルスペックは決済後に閲覧できます` | — |

完全仕様へのアクセス条件：`isFullCcafAccessible(bearer)` が `true`
（= Authorization ヘッダーが `gld_` で始まる有効なキー）

---

## 4. API ライセンス（CallerType）

`src/lib/api-licensing/index.ts` が定義する呼び出し元分類と価格乗数：

| CallerType | 説明 | 価格乗数 | premiumApplied |
|------------|------|---------|---------------|
| `agent` | AI エージェント | 1.0x（ベース） | `false` |
| `human` | 人間ユーザー | 1.0x（ベース） | `false` |
| `big-ai` | AI 大企業 | 1.3x | `true` |

- `big-ai` は `X-Caller-Type: big-ai` ヘッダーで識別
- `perCallJpyc` は `Math.round(base * 1.3 * 10) / 10` で小数点1位に丸め
- `note` フィールドに `1.3` の記載が必須

---

## 5. Human-Verified バッジ

詳細は `docs/Human-Verified設計.md` 参照。

3レベル（`gold` / `human-claimed` / `ai-generated`）で資産の人間性を可視化し、
AI 大企業が学習素材として狙いやすい高品質コンテンツに価格プレミアムを付加します。
