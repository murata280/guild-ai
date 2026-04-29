import type { MarketplaceListing } from "@/types";
import { specToVectorEmbedding, generateEmblemSpec } from "@/lib/asset-emblem";

export function buildAssetJsonLd(item: MarketplaceListing): Record<string, unknown> {
  const { listing, auditResult, trustScore } = item;
  const embedding = specToVectorEmbedding(generateEmblemSpec(listing.id));

  return {
    "@context": "https://schema.org",
    "@type": ["Product", "SoftwareApplication"],
    "@id": `https://guild-ai.vercel.app/asset/${listing.id}`,
    "name": listing.title,
    "description": listing.description,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "API",
    "provider": {
      "@type": "Organization",
      "name": "GUILD AI"
    },
    "offers": {
      "@type": "Offer",
      "price": listing.floorPrice,
      "priceCurrency": "JPY",
      "availability": "https://schema.org/InStock"
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "qualityScore", "value": auditResult.score },
      { "@type": "PropertyValue", "name": "rank", "value": listing.rank },
      { "@type": "PropertyValue", "name": "trustScore", "value": trustScore.score },
      { "@type": "PropertyValue", "name": "agentEndpoint", "value": `https://guild-ai.vercel.app/api/atoa/${listing.id}` },
      { "@type": "PropertyValue", "name": "vectorEmbedding", "value": embedding.slice(0, 5).join(",") },
    ]
  };
}
