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
import type { CCAF, MarketplaceListing, Currency } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const defaultCCAF: CCAF = {
  intentSignals: ["author-statement"],
  thoughtDensity: 72,
  iterations: 14,
  authorId: "me",
  createdAt: "2026-04-28T00:00:00.000Z",
};

// Sell-specific step indicator (within the sell form)
const SELL_STEPS = [
  { num: 1, label: "GitHub連携" },
  { num: 2, label: "こだわりを話す" },
  { num: 3, label: "AIが鑑定" },
  { num: 4, label: "出品確定" },
];

function SellStepBar({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center gap-0 mt-5 mb-6">
      {SELL_STEPS.map((step, i) => (
        <div key={step.num} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step.num === current
                  ? "bg-kaki text-white"
                  : step.num < current
                  ? "bg-accent-green text-white"
                  : "bg-surface-inset text-[#9890A8]"
              }`}
              aria-current={step.num === current ? "step" : undefined}
            >
              {step.num < current ? "✓" : step.num}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${step.num === current ? "text-kaki" : "text-[#9890A8]"}`}>
              {step.label}
            </span>
          </div>
          {i < SELL_STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 ${step.num < current ? "bg-accent-green" : "bg-kuroko/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── GitHub連携 (Step 1) ───────────────────────────────────────────────────────

function GithubConnectStep({
  onRepoSelected,
}: {
  onRepoSelected: (repo: MockRepo) => void;
}) {
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [repos, setRepos] = useState<MockRepo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDirectUrl, setShowDirectUrl] = useState(false);
  const [directUrl, setDirectUrl] = useState("");

  const handleConnect = () => {
    if (!username.trim()) return;
    setConnected(true);
    setRepos(listRepos(username.trim()));
  };

  const handleSelectRepo = (repo: MockRepo) => {
    setSelectedId(repo.id);
    onRepoSelected(repo);
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center text-center px-2 py-6 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-kaki/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-kaki fill-current" aria-hidden>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-bold text-kuroko">GitHubで連携する</h2>
          <p className="mt-2 text-base text-[#9890A8] leading-relaxed">
            リポジトリ一覧から選ぶだけ。URLコピペ不要。
          </p>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            placeholder="GitHubアカウント名（例: octocat）"
            aria-label="GitHubアカウント名"
            className="input-base text-center"
          />
          <button
            type="button"
            onClick={handleConnect}
            disabled={!username.trim()}
            aria-label="GitHubで連携する"
            className="btn-primary w-full !h-16 !text-base gap-2 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHubで連携（1タップ）
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowDirectUrl(!showDirectUrl)}
          className="text-xs text-[#9890A8] underline"
        >
          URLで指定する（上級者向け）
        </button>

        {showDirectUrl && (
          <div className="w-full max-w-xs">
            <input
              type="url"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              aria-label="GitHub URL"
              className="input-base"
            />
            {directUrl && isGithubUrl(directUrl) && (
              <button
                type="button"
                onClick={() => {
                  const parts = directUrl.replace("https://github.com/", "").split("/");
                  const mockRepo: MockRepo = {
                    id: directUrl,
                    name: parts[1] || "repo",
                    fullName: directUrl.replace("https://github.com/", ""),
                    description: "直接入力されたリポジトリ", stars: 0, language: "Unknown",
                    url: directUrl,
                  };
                  handleSelectRepo(mockRepo);
                }}
                className="btn-primary w-full mt-2"
              >
                このURLで進む
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-accent-green/30 bg-accent-green/5 px-4 py-2.5">
        <span className="text-accent-green font-bold">✓</span>
        <span className="text-sm font-medium text-kuroko">{username} — 連携完了</span>
        <button
          type="button"
          onClick={() => { setConnected(false); setUsername(""); setRepos([]); setSelectedId(null); }}
          className="ml-auto text-xs text-[#9890A8] underline"
        >
          変更
        </button>
      </div>

      <p className="text-sm font-semibold text-[#3A3664]">リポジトリを選択</p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {repos.map((repo) => (
          <li key={repo.id}>
            <button
              type="button"
              onClick={() => handleSelectRepo(repo)}
              aria-pressed={selectedId === repo.id}
              aria-label={`リポジトリ ${repo.fullName} を選択`}
              className={`w-full text-left rounded-xl border p-4 min-h-[56px] transition-all active:scale-[0.98] ${
                selectedId === repo.id
                  ? "border-kaki bg-kaki/5 ring-1 ring-kaki/20"
                  : "border-kuroko/10 bg-white hover:border-kaki/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-kuroko leading-snug">{repo.fullName}</p>
                {selectedId === repo.id && (
                  <span className="shrink-0 text-kaki font-bold text-base leading-none" aria-hidden>✓</span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#9890A8] leading-relaxed line-clamp-2">{repo.description}</p>
              <div className="mt-2 flex gap-3 text-xs text-[#9890A8]">
                <span>{repo.language}</span>
                <span>★ {repo.stars}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-kaki/20 bg-kaki/5 px-4 py-2.5">
        <p className="text-xs text-kaki font-medium">
          ⚡ 選択後、静的コード → 稼働 API への自動変換が完了します
        </p>
      </div>
    </div>
  );
}

// ─── こだわり音声入力 (Step 2) ─────────────────────────────────────────────────

function VoiceStep({
  onProofGenerated,
}: {
  onProofGenerated: (signals: string[], description: string, note: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasSpeechApi, setHasSpeechApi] = useState(false);
  const [converted, setConverted] = useState(false);
  const [proof, setProof] = useState<{ signals: string[]; description: string } | null>(null);
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
    const result = voiceLogToProofOfMake(transcript);
    setProof({ signals: result.intentSignals, description: result.refinedDescription });
    onProofGenerated(result.intentSignals, result.refinedDescription, transcript);
    setConverted(true);
  };

  return (
    <div className="flex flex-col items-center space-y-5 py-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-kuroko">この作品のこだわりは？</h2>
        <p className="text-base text-[#9890A8]">声で話すだけで、制作秘話として登記されます</p>
      </div>

      {/* Large mic button */}
      {hasSpeechApi ? (
        <button
          type="button"
          onClick={toggleRecording}
          aria-label={isRecording ? "録音停止" : "録音開始"}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all active:scale-95 shadow-lg ${
            isRecording
              ? "bg-red-500 animate-pulse shadow-red-200"
              : "bg-kaki hover:opacity-90 shadow-kaki/20"
          }`}
        >
          {isRecording ? "⏹" : "🎙️"}
        </button>
      ) : (
        <div className="w-24 h-24 rounded-full bg-surface-inset flex items-center justify-center">
          <span className="text-3xl" aria-hidden>🎙️</span>
        </div>
      )}

      <p className="text-sm text-[#9890A8]">
        {isRecording ? "録音中… タップで停止" : hasSpeechApi ? "タップして録音開始" : "このブラウザは音声入力に対応していません"}
      </p>

      {/* Transcript / manual input */}
      <div className="w-full space-y-2">
        <textarea
          rows={4}
          value={transcript}
          onChange={(e) => { setTranscript(e.target.value); setConverted(false); }}
          placeholder="制作秘話・こだわりをここに入力（音声入力の結果も編集できます）"
          aria-label="制作秘話の入力"
          className="input-base resize-none"
        />

        {transcript.length > 0 && !converted && (
          <button
            type="button"
            onClick={handleConvert}
            className="btn-primary w-full !py-3 !text-base"
          >
            制作の証明に変換する
          </button>
        )}
      </div>

      {/* Success feedback */}
      {converted && proof && (
        <div className="w-full rounded-xl border border-accent-green/30 bg-accent-green/5 px-4 py-4 space-y-3">
          <p className="text-sm font-bold text-accent-green">✓ 制作秘話として登記されました！</p>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#9890A8]">抽出されたストーリー</p>
            <p className="text-sm text-kuroko leading-relaxed">{proof.description}</p>
          </div>
          {proof.signals.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {proof.signals.map((s) => (
                <span key={s} className="text-xs bg-kaki/10 text-kaki px-2.5 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── X Import (supplementary) ─────────────────────────────────────────────────

function XImportCompact({
  onImport,
}: {
  onImport: (title: string, description: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [imported, setImported] = useState(false);
  const result = useMemo(() => (url.length > 0 ? extractFromPostUrl(url) : null), [url]);

  return (
    <div className="space-y-3">
      <input
        type="url"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setImported(false); }}
        placeholder="https://x.com/user/status/..."
        aria-label="XポストURL"
        className="input-base"
      />
      {result && result.suggestedTitle !== "未検出" && (
        <div className="rounded-xl border border-kaki/20 bg-kaki/5 p-4 space-y-2">
          <p className="text-sm font-semibold text-kaki">抽出された内容</p>
          <p className="text-base font-medium text-kuroko">{result.suggestedTitle}</p>
          <p className="text-sm text-[#9890A8]">{result.suggestedDescription}</p>
          <button type="button" onClick={() => { onImport(result.suggestedTitle, result.suggestedDescription); setImported(true); }} className="btn-primary w-full !py-2 !text-sm">
            登記下書きに反映する
          </button>
          {imported && <p className="text-sm text-accent-green">✓ 反映しました</p>}
        </div>
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

  // Step tracking
  const [sellStep, setSellStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [title, setTitle] = useState(remixFrom ? `${remixFrom} — Remix` : "");
  const [githubUrl, setGithubUrl] = useState("");
  const [description, setDescription] = useState(remixFrom ? generateRemixDescription(remixFrom) : "");
  const [proofOfMakeNote, setProofOfMakeNote] = useState("");
  const [inheritApiKey, setInheritApiKey] = useState(remixId !== null);
  const [ccaf, setCcaf] = useState<CCAF>(defaultCCAF);
  const [vercelUptimeDays, setUptime] = useState(30);
  const [basePrice, setBasePrice] = useState(5000);
  const [payoutCurrency, setPayoutCurrency] = useState<Currency>("JPY");
  const [showXImport, setShowXImport] = useState(false);

  const trust = useMemo(
    () => computeTrustScore({ qualityHistory: 70, discordContribution: 55, xAmplification: 40 }),
    []
  );
  const auditResult = useMemo(() => audit({ ccaf, vercelUptimeDays }), [ccaf, vercelUptimeDays]);
  const floor = useMemo(() => computeFloorPrice(basePrice, trust.score), [basePrice, trust.score]);

  const handleRepoSelect = (repo: MockRepo) => {
    setGithubUrl(repo.url);
    if (!title) setTitle(repo.description);
    if (!description) setDescription(repo.description);
    setSellStep(2);
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
      const existing: MarketplaceListing[] = JSON.parse(localStorage.getItem("guild_custom_listings") ?? "[]");
      localStorage.setItem("guild_custom_listings", JSON.stringify([...existing, ml]));
    } catch { /* ignore */ }

    router.push(`/marketplace?highlight=${newId}`);
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">

      <StepIndicator current="register" />

      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-kuroko leading-snug">知能を出品する</h1>
        <p className="mt-1 text-base text-[#9890A8] leading-relaxed">
          Trust Score が高いほど Floor Price と露出が上がる。
        </p>
      </div>

      {remixFrom && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-kaki/30 bg-kaki/10 px-3 py-2">
          <span className="text-sm text-kaki font-medium">Remix元:</span>
          <span className="text-sm text-kuroko font-semibold truncate max-w-[240px]">{remixFrom}</span>
        </div>
      )}

      <SellStepBar current={sellStep} />

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Step 1 — GitHub連携 */}
        <section className="section-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-kuroko">Step 1 · GitHub連携</h2>
            {sellStep > 1 && (
              <span className="text-xs text-accent-green font-semibold">✓ 完了</span>
            )}
          </div>
          {sellStep >= 1 && (
            <div className="mt-4">
              <GithubConnectStep onRepoSelected={handleRepoSelect} />
            </div>
          )}

          {/* X-Import as optional extra */}
          <div className="mt-4 pt-4 border-t border-kuroko/10">
            <button
              type="button"
              onClick={() => setShowXImport(!showXImport)}
              className="text-sm text-[#9890A8] underline"
            >
              Xポストから取り込む（任意）
            </button>
            {showXImport && (
              <div className="mt-3">
                <XImportCompact onImport={handleXImport} />
              </div>
            )}
          </div>
        </section>

        {/* Step 2 — こだわりを話す */}
        <section className="section-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-kuroko">Step 2 · こだわりを話す</h2>
            {sellStep > 2 && <span className="text-xs text-accent-green font-semibold">✓ 完了</span>}
          </div>
          <div className="mt-2">
            <VoiceStep onProofGenerated={(s, d, n) => { handleProofGenerated(s, d, n); setSellStep((prev) => Math.max(prev, 3) as 1|2|3|4); }} />
          </div>
          {sellStep === 2 && (
            <button type="button" onClick={() => setSellStep(3)} className="btn-secondary w-full mt-3">
              スキップしてStep 3へ →
            </button>
          )}
        </section>

        {/* Common info fields */}
        <section className="section-card p-5 space-y-3">
          <h2 className="text-base font-bold text-kuroko">基本情報</h2>
          <label className="flex flex-col gap-1 text-sm text-[#3A3664]">
            タイトル
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="知能資産のタイトル" aria-label="タイトル" className="input-base" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[#3A3664]">
            説明文
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="この知能資産が解決する課題と特徴" aria-label="説明文" className="input-base resize-none" />
          </label>
          {remixId && (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[#3A3664]">
              <input type="checkbox" checked={inheritApiKey} onChange={(e) => setInheritApiKey(e.target.checked)}
                className="rounded border-kuroko/30 text-kaki focus:ring-kaki/30" />
              APIキーを継承する
              <span className="text-xs text-[#9890A8]">（Remix元の認証情報を引き継ぐ）</span>
            </label>
          )}
        </section>

        {/* Step 3 — AI鑑定 */}
        <section className="section-card p-5">
          <h2 className="text-base font-bold text-kuroko">Step 3 · AI鑑定プレビュー</h2>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <label className="flex flex-col gap-1 text-[#3A3664]">
              思考密度 (0–100)
              <input type="number" value={ccaf.thoughtDensity} min={0} max={100}
                onChange={(e) => setCcaf({ ...ccaf, thoughtDensity: Number(e.target.value) })}
                aria-label="思考密度" className="input-base" />
            </label>
            <label className="flex flex-col gap-1 text-[#3A3664]">
              試行回数
              <input type="number" value={ccaf.iterations} min={0}
                onChange={(e) => setCcaf({ ...ccaf, iterations: Number(e.target.value) })}
                aria-label="試行回数" className="input-base" />
            </label>
            <label className="col-span-2 flex flex-col gap-1 text-[#3A3664]">
              Vercel 稼働日数
              <input type="number" value={vercelUptimeDays} min={0}
                onChange={(e) => setUptime(Number(e.target.value) )}
                aria-label="稼働日数" className="input-base" />
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <RankBadge rank={auditResult.rank} large />
            <span className="text-base text-[#3A3664]">鑑定スコア {auditResult.score}</span>
          </div>
          <ul className="mt-2 space-y-1">
            {auditResult.reasons.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-[#3A3664]">
                <span className="text-kaki mt-0.5">·</span>{r}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-[#9890A8]">
            ※ S ランクは意思シグナル必須。最大 +50% プレミアム価格。
          </p>
        </section>

        {/* Step 4 — 出品確定 */}
        <section className="section-card p-5">
          <h2 className="text-base font-bold text-kuroko">Step 4 · 価格と出品確定</h2>

          <label className="mt-4 flex flex-col gap-1 text-sm text-[#3A3664]">
            ベース価格（¥）
            <input type="number" value={basePrice} min={0}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              aria-label="ベース価格" className="input-base" />
          </label>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-[#9890A8]">Floor Price（Trust-Based Pricing 適用後）</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-kuroko">{formatJPY(floor)}</span>
              <span className="ml-2 text-base text-[#9890A8]">（{floor.toLocaleString("ja-JP")} JPYC）</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-[#9890A8]">Trust Score {trust.score} / 1000 に基づき自動算出（¥ = JPYC 1:1）</p>

          {/* Payout currency */}
          <div className="mt-4 pt-4 border-t border-kuroko/10">
            <p className="text-sm font-semibold text-[#3A3664]">報酬の受け取り通貨</p>
            <div className="mt-2 flex gap-5">
              {(["JPY", "JPYC"] as Currency[]).map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payoutCurrency" value={c} checked={payoutCurrency === c}
                    onChange={() => setPayoutCurrency(c)} className="accent-kaki" aria-label={`報酬を${c}で受け取る`} />
                  <span className="text-base font-medium text-kuroko">{c}</span>
                  {c === "JPYC" && (
                    <span className="text-xs text-accent-green bg-accent-green/10 rounded-full px-2 py-0.5">安心の電子マネー</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </section>

        <button type="submit" className="btn-primary w-full !py-4 !text-base" aria-label="AIが鑑定してMarketplaceへ出品する">
          AIが鑑定して Marketplace へ出品する
        </button>

      </form>
    </main>
  );
}

export default function SellPage() {
  return (
    <Suspense fallback={
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
        <div className="mt-12 section-card p-8 text-center">
          <p className="text-base text-[#9890A8]">読み込み中…</p>
        </div>
      </main>
    }>
      <SellContent />
    </Suspense>
  );
}
