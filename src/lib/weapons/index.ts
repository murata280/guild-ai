// GUILD AI — Weapons (武器) model
// Weapons are minted when a user deposits a knowledge note at /bank.
// Stored in localStorage under "guild_weapons".

import type { Weapon, Rank } from "@/types";

const STORAGE_KEY = "guild_weapons";

function generateId(): string {
  return `wpn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getWeapons(): Weapon[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Weapon[];
  } catch {
    return [];
  }
}

export function saveWeapons(weapons: Weapon[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weapons));
  } catch { /* ignore */ }
}

export function mintWeapon(params: {
  title: string;
  noteContent: string;
  rank: Rank;
  score: number;
  tags: string[];
}): Weapon {
  const weapon: Weapon = {
    id: generateId(),
    title: params.title,
    noteContent: params.noteContent,
    rank: params.rank,
    score: params.score,
    tags: params.tags,
    mintedAt: new Date().toISOString(),
    jobsCompleted: [],
  };
  const current = getWeapons();
  saveWeapons([...current, weapon]);
  return weapon;
}

export function recordJobCompletion(weaponId: string, jobId: string): void {
  const weapons = getWeapons();
  const updated = weapons.map((w) =>
    w.id === weaponId
      ? { ...w, jobsCompleted: [...w.jobsCompleted, jobId] }
      : w
  );
  saveWeapons(updated);
}

export function extractTags(noteContent: string): string[] {
  const tagPattern = /#([\w\u3000-\u9fff\u30a0-\u30ff\u3040-\u309f]+)/g;
  const matches = [...noteContent.matchAll(tagPattern)].map((m) => m[1]);
  const autoTags: string[] = [];
  if (/設計|アーキテクチャ|architecture/i.test(noteContent)) autoTags.push("設計");
  if (/コード|実装|code|impl/i.test(noteContent)) autoTags.push("実装");
  if (/テスト|test/i.test(noteContent)) autoTags.push("テスト");
  if (/AI|機械学習|LLM|GPT/i.test(noteContent)) autoTags.push("AI");
  if (/マーケティング|marketing/i.test(noteContent)) autoTags.push("マーケ");
  if (/PM|プロダクト|product/i.test(noteContent)) autoTags.push("PM");
  const all = [...new Set([...matches, ...autoTags])];
  return all.slice(0, 5);
}

export function deriveTitle(noteContent: string): string {
  const firstLine = noteContent.split("\n")[0].replace(/^#+\s*/, "").trim();
  if (firstLine.length > 0 && firstLine.length <= 40) return firstLine;
  return noteContent.slice(0, 30).trim() + "…";
}
