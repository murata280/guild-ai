// GUILD AI — Micro-Copy Dictionary
// All user-facing system messages in warm, polite Japanese.
// Two-layer policy: this file is UI-layer only. API docs use English.

export const messages = {
  // ─── Error pages ────────────────────────────────────────────────────────────
  notFound: {
    heading: "お探しの柿（知能）は、まだ実っていないようです。",
    body: "URLをご確認のうえ、もう一度お試しください。もしかすると、まだ登記されていないのかもしれません。",
    ctaMarketplace: "お店を見てみる",
    ctaHome: "ホームに戻る",
  },
  serverError: {
    heading: "ご不便をおかけしています。少しだけ時間をください。",
    body: "サーバー側で一時的なエラーが発生しました。しばらくしてからもう一度お試しください。",
    ctaRetry: "もう一度試す",
    ctaHome: "ホームへ",
  },

  // ─── Transaction outcomes ────────────────────────────────────────────────────
  listingPublished:
    "無事にお店に並びました。あなたの知能が、これから誰かの役に立ち始めます。",
  purchaseDone:
    "無事にお取引が完了しました。あなたの知能の柿、大切にお育てください。",
  auditDone: "鑑定が終わりました。スコアをご確認ください。",
  rankUpToS:
    "おめでとうございます！Sランクに昇格しました。魂の登記が完了です。",
  atoaJobDone:
    "AIがお仕事を完了しました。収益がデジタル円残高に加算されます。",
  transferComplete:
    "所有権の移転が完了しました。新しいオーナーへの引き渡しが済みました。",

  // ─── Contextual help ────────────────────────────────────────────────────────
  helpDigitalYen:
    "デジタル上の日本円です。1デジタル円 = 1円で、いつでも現金化できます。",
  helpTrustScore:
    "出品実績・鑑定結果・コミュニティ貢献をもとにAIが算出する信頼指標（0〜1000）です。",
  helpSRank:
    "制作の証明と人間の意思シグナルが確認された最高ランク。「魂の登記」とも呼ばれます。",
  helpEndpoint:
    "AIエージェントがこの知能を直接呼び出せる窓口のアドレスです。自動化やシステム連携に使います。",
  helpFloorPrice:
    "信用スコアをもとにAIが算出した、この知能資産の最低お値段です。",
  helpProofOfMake:
    "制作中の思考や試行回数を記録した「制作の証明」です。作品の誠実さをAIが確認します。",
  helpRankRadar:
    "考えの深さ・仕事の速さ・安定感の3軸でAIが評価したレーダーチャートです。",
  helpRoyalty:
    "この知能が誰かに再利用されるたびに、あなたへ自動で収益が分配されます。",

  // ─── Loading / progress ─────────────────────────────────────────────────────
  loadingAssets: "知能資産を読み込んでいます...",
  processingPayment: "お支払いを処理しています。少々お待ちください。",
} as const;

export type MicrocopyKey = keyof typeof messages;
