// GUILD AI — Micro-Copy Dictionary
// Sweet Spot tone: concierge/butler style — professional yet warm.
// Two-layer policy: UI-layer only (Japanese). API docs/routes use English.

export const messages = {
  // ─── Error pages ────────────────────────────────────────────────────────────
  notFound: {
    heading: "申し訳ございません。お探しの資産は見つかりませんでした。",
    body: "URLをご確認のうえ、もう一度お試しください。",
    ctaMarketplace: "マーケットへ",
    ctaHome: "トップへ戻る",
  },
  serverError: {
    heading: "ご不便をおかけしております。少々お時間をいただけますでしょうか。",
    body: "一時的なエラーが発生しました。しばらくしてからもう一度お試しください。",
    ctaRetry: "もう一度試す",
    ctaHome: "トップへ",
  },

  // ─── Transaction outcomes ────────────────────────────────────────────────────
  listingPublished:
    "あなたのスキルが、資産として登録されました。これより、世界中のお客様にお届け可能です。",
  purchaseDone:
    "お取引が無事に完了いたしました。心よりお礼申し上げます。",
  auditDone: "評価が完了いたしました。お墨付きをご確認ください。",
  rankUpToS:
    "おめでとうございます。お墨付きが上位ランクへ昇格しました。",
  atoaJobDone:
    "あなたのスキルが、別のAIによって採用されました。",
  transferComplete:
    "所有権の移転が完了いたしました。新しいオーナーへお届けしました。",
  odachin:
    "還元（リワード）が加算されました。",
  coinDrop:
    "収益が加算されました。",

  // ─── Contextual help (HelpHint ポップオーバー) ──────────────────────────────
  helpDigitalYen:
    "デジタル上の日本円です。1デジタル円 = 1円で、いつでも現金化できます。",
  helpTrustScore:
    "AIが出品実績をもとに算出する信用スコアです（0〜1000）。",
  helpSRank:
    "実績と評価が認められた最高ランクです。お墨付きの証明となります。",
  helpEndpoint:
    "AIが直接このスキルを呼び出すための利用窓口（API）のアドレスです。",
  helpFloorPrice:
    "AIが信用スコアをもとに算出した、この資産の最低価格です。",
  helpProofOfMake:
    "制作時の思考プロセスや試行回数を記録した、あなたのこだわり（実績ログ）です。",
  helpRankRadar:
    "思考の深さ・スピード・安定性の3軸でAIが評価したレーダーチャートです。",
  helpRoyalty:
    "この資産が再利用されるたびに、あなたへ自動で還元（リワード）が分配されます。",

  // ─── Loading / progress ─────────────────────────────────────────────────────
  loadingAssets: "読み込み中です…",
  processingPayment: "お支払い処理中です。少々お待ちください。",
  auditInProgress: "ただいま、評価担当のAIが拝見しております。少々お待ちください。",

  // ─── UI labels ──────────────────────────────────────────────────────────────
  ui: {
    dashboard: "マイページ（ダッシュボード）",
    marketplace: "マーケット",
    sell: "登録する",
    buy: "購入する",
    next: "次へ進む",
    done: "保存する",
    cancel: "キャンセル",
    decide: "保存する",
    publish: "資産として登録する",
    deposit: "収益ウォレット",
    passbook: "収益明細",
    trustScore: "信用スコア",
    proofOfMake: "こだわり（実績ログ）",
    thoughtDensity: "思考の深さ（Depth）",
    uptimeDays: "稼働日数",
    royalty: "還元（リワード）",
    accessKey: "利用キー",
    endpoint: "利用窓口（API）",
    atoaSection: "AI連携窓口",
    rankS: "お墨付き（最高評価）",
    rankA: "高評価",
    rankB: "標準",
    assetSection: "登録済み資産",
    listingCount: "登録数",
    ownedCount: "保有資産数",
    aiVerified: "AI評価済み",
    uptime: "稼働日数",
    liveEarnings: "リアルタイム収益",
    monthlyTotal: "今月の収益合計",
  },
} as const;

export type MicrocopyKey = keyof typeof messages;
