import type { CrawledRepo } from "@/lib/crawler";

export interface PotentialScore {
  repoUrl: string;
  sPotential: number; // 0-100
  reasoning: string;
}

export interface Invitation {
  guildId: string;
  subject: string;
  markdownBody: string;
  isReserved: boolean; // sPotential >= 70
}

export function evaluatePotential(crawled: CrawledRepo): PotentialScore {
  const { signals } = crawled;
  const starScore = Math.min(40, signals.stars / 10);
  const forkScore = Math.min(20, signals.forks / 5);
  const commitScore = Math.min(30, signals.recentCommits * 2);
  const topicBonus = crawled.topics.includes("ai") || crawled.topics.includes("ml") ? 10 : 0;
  const sPotential = Math.round(starScore + forkScore + commitScore + topicBonus);
  return {
    repoUrl: crawled.repoUrl,
    sPotential,
    reasoning: `Stars: ${starScore}/40, Forks: ${forkScore}/20, Commits: ${commitScore}/30, Topics: ${topicBonus}/10`,
  };
}

export function generateInvitation(crawled: CrawledRepo, guildId: string, pooledJpy: number): Invitation {
  const { sPotential } = evaluatePotential(crawled);
  const isReserved = sPotential >= 70;
  const title = crawled.summaryFromReadme.split(".")[0].trim();
  const claimUrl = `https://guild-ai.vercel.app/sell?claim=${guildId}`;

  const subject = `あなたの作品『${title}』が GUILD AI で高い評価を得ています`;
  const markdownBody = [
    `## ${subject}`,
    "",
    `あなたの作品 **${title}** が GUILD AI の AI 鑑定で高ポテンシャルと評価されました。`,
    "",
    isReserved ? `### S ランク候補 (潜在スコア ${sPotential}/100)` : `### ポテンシャルスコア: ${sPotential}/100`,
    "",
    `このまま登記すれば${isReserved ? " **S ランク** へ昇格し、" : ""}累計 **¥${pooledJpy.toLocaleString("ja-JP")}** の遡及報酬が解禁されます。`,
    "",
    `### 権利を主張する`,
    `[権利主張URL](${claimUrl})`,
    "",
    `\`\`\``,
    claimUrl,
    `\`\`\``,
  ].join("\n");

  return { guildId, subject, markdownBody, isReserved };
}
