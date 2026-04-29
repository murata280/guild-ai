import type { MarketplaceListing } from "@/types";

export type Persona = "general" | "pm" | "engineer";

export interface PersonaCard {
  persona: Persona;
  headline: string;
  bullets: string[];
  emotionalTags: string[];
  priceCallout: string;
  ctaLabel: string;
}

export function generatePersonaCards(item: MarketplaceListing): Record<Persona, PersonaCard> {
  const { listing, trustScore } = item;
  const price = `¥${listing.floorPrice.toLocaleString("ja-JP")}`;

  return {
    general: {
      persona: "general",
      headline: `${listing.title}で、もっとラクに`,
      bullets: [
        "すぐ使える — 設定ゼロ",
        `信用スコア ${trustScore.score}／1000 の実績`,
        "困ったときは返金保証",
      ],
      emotionalTags: ["かんたん", "すぐ使える", "安心"],
      priceCallout: `${price} から`,
      ctaLabel: "今すぐ使ってみる →",
    },
    pm: {
      persona: "pm",
      headline: `${listing.title}でチームの生産性を上げる`,
      bullets: [
        `ランク ${listing.rank} — 上位品質保証`,
        `稼働 ${listing.vercelUptimeDays} 日の安定実績`,
        "ROI を数値で確認できる",
      ],
      emotionalTags: ["ROI明確", "稼働安定", "チーム対応"],
      priceCallout: `月額 ${price}`,
      ctaLabel: "チームに導入する →",
    },
    engineer: {
      persona: "engineer",
      headline: `${listing.title} — API直結`,
      bullets: [
        `POST /api/atoa/${listing.id}`,
        `考えの深さ ${listing.ccaf.thoughtDensity}／100`,
        "AES-256 + Schnorr署名（モック）",
      ],
      emotionalTags: ["API対応", "エージェント連携", "技術詳細"],
      priceCallout: `${price} 買い切り`,
      ctaLabel: "APIドキュメントを見る →",
    },
  };
}
