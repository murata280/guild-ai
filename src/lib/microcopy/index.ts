// GUILD AI — Micro-Copy Dictionary
// All user-facing system messages in warm, polite Japanese.
// Two-layer policy: this file is UI-layer only. API docs use English.
// Ultra-Simple Language (#25): hiragana/katakana main, kanji <= 30%.

export const messages = {
  // ─── Error pages ────────────────────────────────────────────────────────────
  notFound: {
    heading: "さがしている「とくいわざ」は、まだ できていないみたい。",
    body: "URLを もう一度 たしかめてみてください。",
    ctaMarketplace: "みんなの お店へ",
    ctaHome: "トップに もどる",
  },
  serverError: {
    heading: "ごめんなさい、ちょっと まちがえました。",
    body: "もう一度 ためしてみてください。",
    ctaRetry: "もう一度",
    ctaHome: "トップへ",
  },

  // ─── Transaction outcomes ────────────────────────────────────────────────────
  listingPublished:
    "ぶじに お店に ならびました！だれかの やくに たちますように。",
  purchaseDone:
    "ぶじに お買いものが おわりました！",
  auditDone: "みおわりました！スコアを みてみよう。",
  rankUpToS:
    "すごい！「お墨付き（おすみつき）」が あがりました！",
  atoaJobDone:
    "あなたの「とくいわざ」が、だれかを 助けました！",
  transferComplete:
    "おわたし できました！あたらしい おもちぬしに とどきました。",
  odachin:
    "おだちん（デジタル円）が たまりました！",
  coinDrop:
    "チャリン！",

  // ─── Contextual help (50% kanji tolerance — HelpHint补足) ──────────────────
  helpDigitalYen:
    "デジタル上の日本円です。1デジタル円 = 1円で、いつでも現金化できます。",
  helpTrustScore:
    "AIが出品実績をもとに計算する しんよう ポイントです（0〜1000）。",
  helpSRank:
    "あなたが 作った しょうこが みとめられた、いちばん すごい ランクです。",
  helpEndpoint:
    "AIが この「とくいわざ」を 直接 よびだす ための アドレスです。",
  helpFloorPrice:
    "AIが 計算した、この「とくいわざ」の いちばん やすい お値段です。",
  helpProofOfMake:
    "作るときの おもいや 試行回数を 記録した「あなたが 作った しょうこ」です。",
  helpRankRadar:
    "かしこさ・はやさ・あんていの 3つで AIが みた レーダーチャートです。",
  helpRoyalty:
    "だれかに つかってもらうたびに、あなたに おすそわけ が はいります。",

  // ─── Loading / progress ─────────────────────────────────────────────────────
  loadingAssets: "よみこんでいます...",
  processingPayment: "お会計 しています。すこし まってください。",
  auditInProgress: "いま、AIが ていねいに みています...",

  // ─── UI labels ──────────────────────────────────────────────────────────────
  ui: {
    dashboard: "わたしのページ",
    marketplace: "みんなの お店",
    sell: "だす",
    buy: "買う",
    next: "つぎへ",
    done: "おわる",
    cancel: "やめる",
    decide: "きめる",
    publish: "お店に だす",
    deposit: "おこづかい貯金箱",
    passbook: "おこづかい帳",
    trustScore: "しんよう ポイント",
    proofOfMake: "あなたが 作った しょうこ",
    thoughtDensity: "かしこさレベル",
    uptimeDays: "がんばった 日数",
    royalty: "おすそわけ",
    accessKey: "あいことば",
    endpoint: "お仕事の うけつけ",
    atoaSection: "AIどうしの おしごと",
    rankS: "すごい！",
    rankA: "いい かんじ",
    rankB: "これから",
    assetSection: "あなたの ぶんしん",
    listingCount: "お店に だした かず",
    ownedCount: "もっている ぶんしん",
    aiVerified: "AIが みとめました",
    uptime: "がんばった 日数",
    liveEarnings: "いまの おだちん",
    monthlyTotal: "今月の おだちん",
  },
} as const;

export type MicrocopyKey = keyof typeof messages;
