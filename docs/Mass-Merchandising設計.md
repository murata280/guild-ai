# Mass Merchandising 設計図（#48）

## Overview: 3x Density Strategy

商品カードを「誰に見せるか」でコンテキストを切り替え、同一資産を最大3種類のメッセージで訴求する戦略。

**目標:**
- 一般ユーザー向け: 簡単さ・安心感・即使用を訴求
- PM・事業担当者向け: ROI・ランク・稼働安定性を訴求
- エンジニア向け: API直結・技術仕様・Agent連携を訴求

---

## Components Created

| コンポーネント / モジュール | パス | 説明 |
|--------------------------|------|------|
| `BeforeAfterHero` | `src/components/BeforeAfterHero.tsx` | Before/After 二分割 SVG ヒーロー画像（純 JSX SVG） |
| `before-after` | `src/lib/before-after/index.ts` | Before/After 仕様生成 + SVG 文字列レンダラー（API 用） |
| `persona-cards` | `src/lib/persona-cards/index.ts` | 3 ペルソナ分のカード仕様を生成する関数 |
| `useLazyMount` | `src/hooks/useLazyMount.ts` | IntersectionObserver ベースの遅延マウントフック |

---

## Architecture Diagram

```
Marketplace Page
│
├── Controls
│   ├── 並び順フィルタ
│   ├── ランクフィルタ
│   ├── 最低信用スコア
│   └── [表示スタイル: 一般 / PM / エンジニア]  ← NEW
│
└── Grid (sm:2col / lg:3col)
    └── LazyMarketplaceCard (×N)
        ├── useLazyMount()
        │   ├── skeleton (未交差時)
        │   └── FlipCard (交差後)
        │       ├── Front: PersonaCard[persona]
        │       │   ├── BeforeAfterHero (HumanThumbnail → rank あり)
        │       │   ├── emotionalTags (persona別)
        │       │   ├── headline (persona別)
        │       │   ├── bullets ×2 (persona別)
        │       │   └── priceCallout / ctaLabel (persona別)
        │       └── Back: 技術仕様 JSON + AtoA エンドポイント
        │
        └── generatePersonaCards(item)[persona]
```

---

## Mascot Whitelist

`AssetSpirit` と `Shimaenaga` の配置ルール（確定版）:

| 場所 | AssetSpirit | Shimaenaga | 理由 |
|------|------------|------------|------|
| 商品カード（marketplace / showcase） | **禁止** | **禁止** | 商品コンテンツが主役。マスコットは競合する |
| 資産詳細ヒーロー（/asset/[id]）| **禁止** | — | BeforeAfterHero に置き換え済み |
| Trust-Lock セクション（/asset/[id]）| — | **許可** (`variant="key"`) | 信頼・セキュリティ文脈での役割 |
| サイドバー / ヘッダー | — | **許可** | ブランドアイデンティティ |
| 売却完了画面（/sell 完了） | — | **許可** (`variant="coin"`) | セレブレーション文脈 |
| ローディング画面 | **許可** | **許可** | コンテンツ不在時のみ |
| 404 / 500 エラー画面 | **許可** | **許可** | コンテンツ不在時のみ |
| 通知ベル | — | **許可** | 小サイズ文脈 |

---

## Performance Notes

- `useLazyMount`: `rootMargin: "200px"` で画面外 200px 手前から先読みマウント
- `delay: 200ms` でマウントを少し遅らせ、スクロール中の描画負荷を軽減
- スケルトンは `aspect-[3/2]` でグリッドの高さを維持し、レイアウトシフトを防止
- `generateBeforeAfterSpec` / `generatePersonaCards` はいずれも djb2 ハッシュで決定論的生成（SSR 安全）
- `renderBeforeAfterSvg` は API 用 SVG 文字列生成（`/api/emblem` 類似エンドポイントへの拡張が可能）
