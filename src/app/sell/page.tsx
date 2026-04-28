"use client";

import { Suspense, useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { audit, computeFloorPrice } from "@/lib/ai-auditor";
import { computeTrustScore } from "@/lib/trust-score";
import { autoList } from "@/lib/marketplace";
import { RankBadge } from "@/components/RankBadge";
import { StepIndicator } from "@/components/StepIndicator";
import { formatJPY, isGithubUrl } from "@/utils/format";
import { generateRemixDescription } from "@/lib/listing-generator";
import { listRepos } from "@/lib/github-picker";
import type { MockRepo } from "@/lib/github-picker";
import { voiceLogToProofOfMake } from "@/lib/proof-of-make";
import { extractFromPostUrl } from "@/lib/x-import";
import type { CCAF, MarketplaceListing } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type InputTab = "github" | "voice" | "xpost";

const defaultCCAF: CCAF = {
  intentSignals: ["author-statement"],
  thoughtDensity: 72,
  iterations: 14,
  authorId: "me",
  createdAt: "2026-04-28T00:00:00.000Z",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-kuroko/20 bg-white px-3 py-2 text-sm text-kuroko placeholder-[#9890A8] focus:border-kaki focus:outline-none focus:ring-1 focus:ring-kaki/30";

const TAB_LABELS: { id: InputTab; label: string }[] = [
  { id: "github", label: "GitHub から選ぶ" },
  { id: "voice",  label: "こだわり音声入力" },
  { id: "xpost",  label: "X ポストから取り込む" },
];

// ─── GitHub Picker Tab ────────────────────────────────────────────────────────

function GithubPickerTab({
  onSelect,
}: {
  onSelect: (repo: MockRepo) => void;
}) {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<MockRepo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (username.length > 0) {
      setRepos(listRepos(username));
    }
  }, [username]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="GitHub ユーザー名を入力"
        className={inputClass}
      />
      {repos.length > 0 && (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto">
          {repos.map((repo) => (
            <li key={repo.id}>
              <button
                type="button"
                onClick={() => {
                  setSelected(repo.id);
                  onSelect(repo);
                }}
                className={`w-full text-left rounded-xl border px-4 py-3.5 min-h-[56px] transition-all active:scale-[0.98] ${
                  selected === repo.id
                    ? "border-kaki bg-kaki/5"
                    : "border-kuroko/10 bg-white hover:border-kaki/40"
                }`}
              >
                <p className="text-sm font-semibold text-kuroko truncate">{repo.fullName}</p>
                <p className="mt-0.5 text-xs text-[#9890A8] truncate">{repo.description}</p>
                <div className="mt-1 flex gap-2 text-[11px] text-[#9890A8]">
                  <span>{repo.language}</span>
                  <span>★ {repo.stars}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {username.length === 0 && (
        <p className="text-xs text-[#9890A8]">GitHub ユーザー名を入力するとリポジトリ一覧が表示されます</p>
      )}
    </div>
  );
}

// ─── Voice Input Tab ──────────────────────────────────────────────────────────

function VoiceInputTab({
  onProofGenerated,
}: {
  onProofGenerated: (signals: string[], description: string, note: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasSpeechApi, setHasSpeechApi] = useState(false);
  const [converted, setConverted] = useState(false);
  const recogRef = useRef<unknown>(null);

  useEffect(() => {
    setHasSpeechApi(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);

  const toggleRecording = useCallback(() => {
    if (!hasSpeechApi) return;

    if (isRecording) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recogRef.current as any)?.stop();
      setIsRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recog = new SR();
    recog.lang = "ja-JP";
    recog.continuous = true;
    recog.interimResults = true;
    recog.onresult = (event: Event & { results: SpeechRecognitionResultList }) => {
      const text = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join("");
      setTranscript(text);
    };
    recog.onerror = () => setIsRecording(false);
    recog.onend = () => setIsRecording(false);
    recog.start();
    recogRef.current = recog;
    setIsRecording(true);
  }, [isRecording, hasSpeechApi]);

  const handleConvert = () => {
    const proof = voiceLogToProofOfMake(transcript);
    onProofGenerated(proof.intentSignals, proof.refinedDescription, transcript);
    setConverted(true);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#9890A8]">
        制作秘話・こだわりを話してください。AI が「制作の証明」に変換します。
      </p>

      {hasSpeechApi ? (
        <button
          type="button"
          onClick={toggleRecording}
          className={`w-full rounded-xl border py-4 text-sm font-semibold transition-all ${
            isRecording
              ? "border-kaki bg-kaki text-white animate-pulse"
              : "border-kuroko/20 text-[#4A4464] hover:border-kaki/40"
          }`}
        >
          {isRecording ? "● 録音中（タップで停止）" : "録音開始"}
        </button>
      ) : (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          このブラウザは音声入力に対応していません。下のテキストエリアに直接入力してください。
        </p>
      )}

      <textarea
        rows={5}
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="制作秘話・こだわりをここに入力（音声入力の結果も編集できます）"
        className={`${inputClass} resize-none`}
      />

      {transcript.length > 0 && (
        <button
          type="button"
          onClick={handleConvert}
          className="btn-primary w-full !py-2.5"
        >
          制作の証明に変換する
        </button>
      )}

      {converted && (
        <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          ✓ 意思シグナルを抽出し、フォームに反映しました
        </p>
      )}
    </div>
  );
}

// ─── X Import Tab ─────────────────────────────────────────────────────────────

function XImportTab({
  onImport,
}: {
  onImport: (title: string, description: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [imported, setImported] = useState(false);

  const result = useMemo(() => (url.length > 0 ? extractFromPostUrl(url) : null), [url]);

  const handleImport = () => {
    if (!result || result.suggestedTitle === "未検出") return;
    onImport(result.suggestedTitle, result.suggestedDescription);
    setImported(true);
  };

  return (
    <div className="space-y-3">
      <input
        type="url"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setImported(false); }}
        placeholder="https://x.com/user/status/1234567890"
        className={inputClass}
      />

      {result && result.suggestedTitle !== "未検出" && (
        <div className="rounded-xl border border-kaki/20 bg-kaki/5 p-4 space-y-1.5">
          <p className="text-xs font-semibold text-kaki">AI が抽出した内容</p>
          <p className="text-sm font-medium text-kuroko">{result.suggestedTitle}</p>
          <p className="text-xs text-[#9890A8] leading-relaxed">{result.suggestedDescription}</p>
          <div className="flex flex-wrap gap-1 pt-1">
            {result.hashtags.map((tag) => (
              <span key={tag} className="text-[11px] text-kaki bg-kaki/10 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={handleImport}
            className="btn-primary w-full !py-2 !text-xs mt-1"
          >
            登記下書きに反映する
          </button>
        </div>
      )}

      {result && result.suggestedTitle === "未検出" && url.length > 10 && (
        <p className="text-xs text-red-500">{result.suggestedDescription}</p>
      )}

      {imported && (
        <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          ✓ タイトルと説明文をフォームに反映しました
        </p>
      )}
    </div>
  );
}

// ─── Main sell form ───────────────────────────────────────────────────────────

function SellContent() {
  const params = useSearchParams();
  const router = useRouter();
  const remixId = params.get("remix");
  const remixFrom = params.get("from");

  // Input source
  const [activeTab, setActiveTab] = useState<InputTab>("github");

  // Form state
  const [title, setTitle] = useState(remixFrom ? `${remixFrom} — Remix` : "");
  const [githubUrl, setGithubUrl] = useState("");
  const [description, setDescription] = useState(
    remixFrom ? generateRemixDescription(remixFrom) : ""
  );
  const [proofOfMakeNote, setProofOfMakeNote] = useState("");
  const [inheritApiKey, setInheritApiKey] = useState(remixId !== null);
  const [ccaf, setCcaf] = useState<CCAF>(defaultCCAF);
  const [vercelUptimeDays, setUptime] = useState(30);
  const [basePrice, setBasePrice] = useState(5000);

  const trust = useMemo(
    () => computeTrustScore({ qualityHistory: 70, discordContribution: 55, xAmplification: 40 }),
    []
  );
  const auditResult = useMemo(() => audit({ ccaf, vercelUptimeDays }), [ccaf, vercelUptimeDays]);
  const floor = useMemo(() => computeFloorPrice(basePrice, trust.score), [basePrice, trust.score]);
  const githubOk = githubUrl.length === 0 || isGithubUrl(githubUrl);

  // Tab callbacks
  const handleRepoSelect = (repo: MockRepo) => {
    setGithubUrl(repo.url);
    if (!title) setTitle(repo.description);
    if (!description) setDescription(repo.description);
  };

  const handleProofGenerated = (signals: string[], desc: string, note: string) => {
    setCcaf((prev) => ({ ...prev, intentSignals: signals }));
    if (!description) setDescription(desc);
    setProofOfMakeNote(note);
  };

  const handleXImport = (importedTitle: string, importedDesc: string) => {
    if (!title) setTitle(importedTitle);
    setDescription(importedDesc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || "新しい知能資産";
    const newId = `listing_${Date.now()}`;

    const ml: MarketplaceListing = autoList(
      {
        id: newId,
        ownerId: "demo-user",
        title: finalTitle,
        description: description || "説明なし",
        ccaf: { ...ccaf, createdAt: new Date().toISOString() },
        vercelUptimeDays,
        basePrice,
        githubUrl: githubUrl || undefined,
        remixedFrom: remixId || undefined,
        proofOfMakeNote: proofOfMakeNote || undefined,
      },
      { qualityHistory: 70, discordContribution: 55, xAmplification: 40 },
      new Date().toISOString()
    );

    try {
      const existing: MarketplaceListing[] = JSON.parse(
        localStorage.getItem("guild_custom_listings") ?? "[]"
      );
      localStorage.setItem(
        "guild_custom_listings",
        JSON.stringify([...existing, ml])
      );
    } catch {
      // ignore
    }

    router.push(`/marketplace?highlight=${newId}`);
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">

      {/* Step indicator */}
      <StepIndicator current="register" />

      {/* Header */}
      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-kuroko">知能を出品する</h1>
        <p className="mt-1 text-sm text-[#9890A8]">
          Trust Score が高いほど Floor Price と露出が上がる。良質な出品が、売れる。
        </p>
      </div>

      {/* Remix chip */}
      {remixFrom && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-kaki/30 bg-kaki/10 px-3 py-2">
          <span className="text-xs text-kaki font-medium">Remix元:</span>
          <span className="text-xs text-kuroko font-semibold truncate max-w-[240px]">{remixFrom}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">

        {/* Step 1 — Input source tabs */}
        <section className="section-card p-5">
          <h2 className="text-sm font-semibold text-kuroko">Step 1 · 入力ソースを選ぶ</h2>

          {/* Tab bar */}
          <div className="mt-3 flex gap-1 border-b border-kuroko/10 overflow-x-auto">
            {TAB_LABELS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`shrink-0 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? "border-kaki text-kaki"
                    : "border-transparent text-[#9890A8] hover:text-[#4A4464]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {activeTab === "github" && <GithubPickerTab onSelect={handleRepoSelect} />}
            {activeTab === "voice" && <VoiceInputTab onProofGenerated={handleProofGenerated} />}
            {activeTab === "xpost" && <XImportTab onImport={handleXImport} />}
          </div>

          {/* Common fields below tabs */}
          <div className="mt-4 space-y-3 border-t border-kuroko/10 pt-4">
            <label className="flex flex-col text-sm text-[#4A4464]">
              タイトル
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="知能資産のタイトル"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col text-sm text-[#4A4464]">
              GitHub URL（任意）
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col text-sm text-[#4A4464]">
              説明文
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="この知能資産が解決する課題と特徴"
                className={`${inputClass} resize-none`}
              />
            </label>

            {remixId && (
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[#4A4464]">
                <input
                  type="checkbox"
                  checked={inheritApiKey}
                  onChange={(e) => setInheritApiKey(e.target.checked)}
                  className="rounded border-kuroko/30 text-kaki focus:ring-kaki/30"
                />
                API キーを継承する
                <span className="text-xs text-[#9890A8]">（Remix 元の認証情報を引き継ぐ）</span>
              </label>
            )}
          </div>
        </section>

        {/* Step 2 — 制作の証明 */}
        <section className="section-card p-5">
          <h2 className="text-sm font-semibold text-kuroko">Step 2 · 制作の証明</h2>
          <p className="mt-0.5 text-xs text-[#9890A8]">
            あなたのこだわり・思考プロセスが深いほどランクと価格が上がる
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <label className="flex flex-col text-[#4A4464]">
              思考密度 (0-100)
              <input
                type="number"
                value={ccaf.thoughtDensity}
                min={0} max={100}
                onChange={(e) => setCcaf({ ...ccaf, thoughtDensity: Number(e.target.value) })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col text-[#4A4464]">
              試行回数
              <input
                type="number"
                value={ccaf.iterations}
                min={0}
                onChange={(e) => setCcaf({ ...ccaf, iterations: Number(e.target.value) })}
                className={inputClass}
              />
            </label>
            <label className="col-span-2 flex flex-col text-[#4A4464]">
              意思シグナル（カンマ区切り）
              <input
                type="text"
                value={ccaf.intentSignals.join(", ")}
                onChange={(e) =>
                  setCcaf({
                    ...ccaf,
                    intentSignals: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className={inputClass}
                placeholder="設計レビュー済み, ユーザーインタビュー反映"
              />
            </label>
            <label className="col-span-2 flex flex-col text-[#4A4464]">
              Vercel 稼働日数
              <input
                type="number"
                value={vercelUptimeDays}
                min={0}
                onChange={(e) => setUptime(Number(e.target.value))}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        {/* Step 3 — AI preview */}
        <section className="section-card p-5">
          <h2 className="text-sm font-semibold text-kuroko">Step 3 · AI 鑑定プレビュー</h2>
          <div className="mt-3 flex items-center gap-3">
            <RankBadge rank={auditResult.rank} />
            <span className="text-sm text-[#4A4464]">composite score {auditResult.score}</span>
          </div>
          <ul className="mt-2 space-y-1">
            {auditResult.reasons.map((r) => (
              <li key={r} className="flex gap-2 text-xs text-[#4A4464]">
                <span className="text-kaki mt-0.5">·</span>
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[#9890A8]">
            ※ S ランクは最大 +50% プレミアム価格。意思シグナルが必要。
          </p>
        </section>

        {/* Step 4 — Pricing */}
        <section className="section-card p-5">
          <h2 className="text-sm font-semibold text-kuroko">Step 4 · 価格設定</h2>
          <label className="mt-3 flex flex-col text-sm text-[#4A4464]">
            ベース価格 (JPY)
            <input
              type="number"
              value={basePrice}
              min={0}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xs text-[#9890A8]">Floor Price（Trust-Based Pricing 適用後）</span>
            <span className="text-xl font-bold text-kuroko">{formatJPY(floor)}</span>
          </div>
          <p className="mt-1 text-xs text-[#9890A8]">
            Trust Score {trust.score} / 1000 に基づき自動算出
          </p>
        </section>

        <button
          type="submit"
          className="btn-primary w-full !py-3 text-base"
        >
          AI 鑑定して Marketplace へ出品する
        </button>

      </form>
    </main>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function SellPage() {
  return (
    <Suspense fallback={
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
        <div className="mt-12 section-card p-8 text-center">
          <p className="text-sm text-[#9890A8]">読み込み中…</p>
        </div>
      </main>
    }>
      <SellContent />
    </Suspense>
  );
}
