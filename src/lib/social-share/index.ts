// GUILD AI — Viral Share Engine
// Two-layer policy: provocative SNS copy lives here; concierge UI copy is in microcopy/.
// jargon-lint exception: share text is user-facing SNS content, not internal UI.
// All templates end with the closing question (Final Vision §4):
// 「自分の価値を、自分の手に。あなたはいつまで自分のスキルを誰かに預けておくつもり？」

export type ShareContextType =
  | "listing_published"
  | "purchase_done"
  | "rank_up_s"
  | "atoa_job"
  | "passbook_milestone";

export interface ShareContext {
  type: ShareContextType;
  title?: string;
  price?: number;
  rank?: string;
  assetId?: string;
}

// 5 contexts × 3 provocative templates each
// Under 120 chars per template (leaves room for URL on X).
const CLOSING = "自分の価値を、自分の手に。あなたはいつまで自分のスキルを誰かに預けておくつもり？";

export const SHARE_TEMPLATES: Readonly<Record<ShareContextType, readonly [string, string, string]>> = {
  listing_published: [
    `AIが私のスキルを分身として登録した。\n登録した瞬間から、人間の代わりに働き始める。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
    `スキルを登録したら、AIが勝手に値段をつけた。\n思考の深さと試行回数が、そのまま評価に反映される。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
    `3分で、たからものとして登録が完了した。\n自分の知識に値段がつくとは思っていなかった。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
  ],
  purchase_done: [
    `AI評価済みのたからものを買った。\n値段がつくということは、それだけ希少だということ。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
    `スキルの分身を購入した。\n信用スコアで品質が保証されている安心感が違う。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
    `AIが評価した知識を買う。\n一度作れば、売れるたびに作者に還元される仕組み。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
  ],
  rank_up_s: [
    `お墨付き（★★★★★）を取った。\n評価されることを恐れていた自分が馬鹿みたいだ。\n${CLOSING}\n#GUILDAI #お墨付き`,
    `鑑定★5に昇格した。\n意思を吹き込んだら最高評価になった。\n${CLOSING}\n#GUILDAI #お墨付き`,
    `お墨付き獲得。\n正直、ここまで評価が上がるとは思っていなかった。\n${CLOSING}\n#GUILDAI #お墨付き`,
  ],
  atoa_job: [
    `寝ている間に、AIが私のたからものを使っていた。\n不労所得ではなく「知識が働く」感覚。全然違う。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
    `AIに採用された。\n人間ではなく機械が私の知識を必要とした。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
    `おしごとが完了した。\nスキルを登録してから、ずっと誰かのために動いている。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
  ],
  passbook_milestone: [
    `今月、たからものが勝手に稼いでいた。\n自分が何もしない日も、分身は動いている。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
    `お財布を見た。\n自分のスキルが価値に変わっている事実が、まだ信じられない。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
    `スキルから収益が出た。\n労働なし、売り込みなし。AIが全部やってくれる。\n${CLOSING}\n#GUILDAI #スキルエコノミー`,
  ],
};

export function generateShareText(context: ShareContext, seed?: number): string {
  const templates = SHARE_TEMPLATES[context.type];
  const idx =
    seed !== undefined
      ? Math.abs(Math.trunc(seed)) % templates.length
      : Math.floor(Math.random() * templates.length);
  return templates[idx];
}

// ─── Share URL builders ────────────────────────────────────────────────────────

export function buildXShareUrl(text: string, url?: string): string {
  const full = url ? `${text}\n${url}` : text;
  return `https://x.com/intent/tweet?${new URLSearchParams({ text: full })}`;
}

export function buildLineShareUrl(text: string, url: string): string {
  return `https://social-plugins.line.me/lineit/share?${new URLSearchParams({ url, text })}`;
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function nativeShare(text: string, url: string, title?: string): Promise<boolean> {
  if (!canUseNativeShare()) return false;
  try {
    await navigator.share({ title: title ?? "GUILD AI", text, url });
    return true;
  } catch {
    return false;
  }
}
