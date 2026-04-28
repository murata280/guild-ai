"use client";

import {
  Suspense, useMemo, useState, useEffect, useRef, useCallback,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { audit, computeFloorPrice } from "@/lib/ai-auditor";
import { computeTrustScore } from "@/lib/trust-score";
import { autoList } from "@/lib/marketplace";
import { RankBadge } from "@/components/RankBadge";
import { RankRadar } from "@/components/RankRadar";
import { WillSignalTrigger } from "@/components/WillSignalTrigger";
import { StepIndicator } from "@/components/StepIndicator";
import { formatJPY, isGithubUrl } from "@/utils/format";
import { generateRemixDescription, extractFromReadme } from "@/lib/listing-generator";
import { listRepos, fetchReadme } from "@/lib/github-picker";
import type { MockRepo } from "@/lib/github-picker";
import { voiceLogToProofOfMake } from "@/lib/proof-of-make";
import type { CCAF, MarketplaceListing, Currency, Rank } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type RegistrationPath = "ai" | "voice" | "text";

interface CompletionData {
  listingId: string;
  title: string;
  rank: Rank;
  floorPrice: number;
  deployUrl: string;
  apiEndpoint: string;
}

const defaultCCAF: CCAF = {
  intentSignals: ["author-statement"],
  thoughtDensity: 72,
  iterations: 14,
  authorId: "me",
  createdAt: "2026-04-28T00:00:00.000Z",
};

const trust = computeTrustScore({ qualityHistory: 70, discordContribution: 55, xAmplification: 40 });

// ─── 3-minute timer ────────────────────────────────────────────────────────────

function TimerBar({ startAt }: { startAt: number }) {
  const [elapsed, setElapsed] = useState(0);
  const LIMIT = 180;

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startAt) / 1000)), 500);
    return () => clearInterval(t);
  }, [startAt]);

  const pct = Math.min(100, (elapsed / LIMIT) * 100);
  const remaining = Math.max(0, LIMIT - elapsed);
  const isOver = elapsed >= LIMIT;

  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between text-xs text-[#9890A8]">
        <span>Fast-Path 3分保証</span>
        <span className={isOver ? "text-red-500 font-semibold" : ""}>
          {isOver ? "時間超過" : `残り ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
        </span>
      </div>
      <div className="h-1 rounded-full bg-kuroko/10">
        <div
          className={`h-1 rounded-full transition-all ${isOver ? "bg-red-400" : "bg-accent-green"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Progress steps overlay ────────────────────────────────────────────────────

const AUTO_STEPS = [
  "README を取得中…",
  "セールスポイントを抽出中…",
  "最適価格を算出中…",
  "AI 鑑定中…",
  "Marketplace に出品中…",
  "デプロイ URL を発行中…",
];

function AutoProgress({
  steps,
  currentStep,
  overlay = false,
}: {
  steps: string[];
  currentStep: number;
  overlay?: boolean;
}) {
  return (
    <div
      className={overlay
        ? "fixed inset-0 z-50 bg-white/90 flex flex-col items-center justify-center gap-3 px-8"
        : "mt-4 space-y-2"
      }
    >
      {overlay && (
        <div className="text-4xl mb-2 animate-spin">✨</div>
      )}
      {overlay && (
        <p className="text-base font-bold text-kuroko mb-4 text-center">
          あなたは何もしなくてOK。AIがすべて代行します
        </p>
      )}
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-3">
          {i < currentStep
            ? <span className="text-accent-green font-bold text-lg">✓</span>
            : i === currentStep
            ? <span className="text-kaki animate-pulse font-bold text-lg">⟳</span>
            : <span className="text-kuroko/20 font-bold text-lg">○</span>
          }
          <span className={`text-sm ${i === currentStep ? "text-kaki font-semibold" : i < currentStep ? "text-accent-green" : "text-[#9890A8]"}`}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Completion card ───────────────────────────────────────────────────────────

function CompletionCard({ data }: { data: CompletionData }) {
  const [copied, setCopied] = useState<"deploy" | "api" | null>(null);
  const router = useRouter();

  const copy = (text: string, key: "deploy" | "api") => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Success header */}
      <div className="rounded-2xl bg-accent-green/10 border border-accent-green/30 p-5 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-xl font-bold text-kuroko">登記完了！デプロイURLが発行されました</h2>
        <p className="mt-1 text-sm text-[#9890A8]">
          ランク <RankBadge rank={data.rank} /> ·
          Floor Price <span className="font-bold text-kuroko">¥{data.floorPrice.toLocaleString("ja-JP")}</span>
        </p>
      </div>

      {/* 3 parallel links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Deploy URL */}
        <div className="section-card p-4">
          <p className="text-xs text-[#9890A8] font-semibold mb-2">デプロイ URL</p>
          <p className="font-mono text-xs text-kaki truncate">{data.deployUrl.slice(0, 40)}…</p>
          <button
            type="button"
            onClick={() => copy(data.deployUrl, "deploy")}
            aria-label="デプロイURLをコピー"
            className="btn-secondary w-full !py-1.5 !text-xs mt-2"
          >
            {copied === "deploy" ? "✓ コピー済み" : "URLをコピー"}
          </button>
        </div>

        {/* API Endpoint */}
        <div className="section-card p-4">
          <p className="text-xs text-[#9890A8] font-semibold mb-2">API エンドポイント</p>
          <p className="font-mono text-xs text-kaki truncate">{data.apiEndpoint.slice(0, 40)}…</p>
          <button
            type="button"
            onClick={() => copy(data.apiEndpoint, "api")}
            aria-label="APIエンドポイントをコピー"
            className="btn-secondary w-full !py-1.5 !text-xs mt-2"
          >
            {copied === "api" ? "✓ コピー済み" : "エンドポイントをコピー"}
          </button>
        </div>

        {/* Dashboard link */}
        <div className="section-card p-4 flex flex-col">
          <p className="text-xs text-[#9890A8] font-semibold mb-2">Dashboard</p>
          <p className="text-sm text-kuroko leading-relaxed flex-1">資産を管理・デプロイできます</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            aria-label="Dashboardへ移動"
            className="btn-primary w-full !py-1.5 !text-xs mt-2"
          >
            Dashboardへ →
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push(`/marketplace?highlight=${data.listingId}`)}
        aria-label="Marketplaceで確認"
        className="btn-secondary w-full"
      >
        Marketplace で確認 →
      </button>
    </div>
  );
}

// ─── Path 1: AI にお任せ ────────────────────────────────────────────────────────

function AiPath({
  onComplete,
  onReset,
}: {
  onComplete: (data: CompletionData) => void;
  onReset: () => void;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [repos, setRepos] = useState<MockRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<MockRepo | null>(null);
  const [autoFillChip, setAutoFillChip] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);

  const handleConnect = () => {
    if (!username.trim()) return;
    setConnected(true);
    setRepos(listRepos(username.trim()));
  };

  const handleSelectRepo = (repo: MockRepo) => {
    setSelectedRepo(repo);
    setAutoFillChip(true);
  };

  const handleAutoRun = useCallback(async () => {
    if (!selectedRepo) return;
    setIsProcessing(true);

    const steps = AUTO_STEPS;
    for (let i = 0; i < steps.length; i++) {
      setProcessStep(i);
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    }
    setProcessStep(steps.length);

    // Build listing from README
    const readmeText = fetchReadme(selectedRepo);
    const extract = extractFromReadme(readmeText);
    const newId = `listing_${Date.now()}`;
    const ccaf: CCAF = { intentSignals: ["author-statement"], thoughtDensity: 75, iterations: 10, authorId: "demo-user", createdAt: new Date().toISOString() };
    const auditResult = audit({ ccaf, vercelUptimeDays: 30 });
    const floor = computeFloorPrice(extract.suggestedPrice, trust.score);

    const ml: MarketplaceListing = autoList(
      { id: newId, ownerId: "demo-user", title: extract.title, description: extract.description, ccaf, vercelUptimeDays: 30, basePrice: extract.suggestedPrice, githubUrl: selectedRepo.url },
      { qualityHistory: 70, discordContribution: 55, xAmplification: 40 },
      new Date().toISOString()
    );

    try {
      const existing: MarketplaceListing[] = JSON.parse(localStorage.getItem("guild_custom_listings") ?? "[]");
      localStorage.setItem("guild_custom_listings", JSON.stringify([...existing, ml]));
    } catch { /* ignore */ }

    onComplete({
      listingId: newId,
      title: extract.title,
      rank: auditResult.rank,
      floorPrice: floor,
      deployUrl: `https://vercel.com/new/clone?repository-url=${encodeURIComponent(selectedRepo.url)}`,
      apiEndpoint: `https://guild-ai.vercel.app/api/atoa/${newId}`,
    });
  }, [selectedRepo, onComplete]);

  return (
    <div className="space-y-4">
      {isProcessing && processStep < AUTO_STEPS.length && (
        <AutoProgress steps={AUTO_STEPS} currentStep={processStep} overlay={false} />
      )}

      {!isProcessing && !connected && (
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-14 h-14 rounded-2xl bg-kaki/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-kaki fill-current" aria-hidden>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-kuroko">GitHubアカウントを連携</h2>
            <p className="mt-1 text-sm text-[#9890A8]">リポジトリを選ぶだけ。URLコピペ不要。</p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <input
              type="text" value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              placeholder="GitHubアカウント名（例: octocat）"
              aria-label="GitHubアカウント名"
              className="input-base text-center"
            />
            <button
              type="button" onClick={handleConnect} disabled={!username.trim()}
              aria-label="GitHubで連携する"
              className="btn-primary w-full !h-16 !text-base disabled:opacity-50"
            >
              GitHubで連携（1タップ）
            </button>
          </div>
        </div>
      )}

      {!isProcessing && connected && !selectedRepo && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-accent-green/30 bg-accent-green/5 px-4 py-2.5">
            <span className="text-accent-green font-bold">✓</span>
            <span className="text-sm font-medium text-kuroko">{username} — 連携完了</span>
          </div>
          <p className="text-sm font-semibold text-[#3A3664]">リポジトリを選択</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {repos.map((repo) => (
              <li key={repo.id}>
                <button
                  type="button" onClick={() => handleSelectRepo(repo)}
                  aria-label={`${repo.fullName}を選択`}
                  className="w-full text-left rounded-xl border p-4 min-h-[56px] border-kuroko/10 bg-white hover:border-kaki/30 transition-all active:scale-[0.98]"
                >
                  <p className="text-sm font-semibold text-kuroko">{repo.fullName}</p>
                  <p className="mt-1 text-xs text-[#9890A8] line-clamp-1">{repo.description}</p>
                  <div className="mt-1 flex gap-2 text-xs text-[#9890A8]">
                    <span>{repo.language}</span><span>★ {repo.stars}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isProcessing && selectedRepo && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-kaki/30 bg-kaki/5 px-4 py-2.5">
            <span className="text-kaki font-bold">✓</span>
            <span className="text-sm font-medium text-kuroko">{selectedRepo.fullName}</span>
            {autoFillChip && (
              <span className="ml-auto text-xs bg-accent-green/10 text-accent-green rounded-full px-2 py-0.5 font-semibold">READMEから自動入力されました</span>
            )}
          </div>

          <button
            type="button" onClick={handleAutoRun}
            aria-label="AIが全自動で出品する"
            className="btn-primary w-full !py-4 !text-base"
          >
            ✨ AIが全自動で出品する
          </button>

          <button type="button" onClick={() => { setSelectedRepo(null); }} className="text-sm text-[#9890A8] underline w-full text-center">
            別のリポジトリを選ぶ
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Path 2: 音声で登記 ────────────────────────────────────────────────────────

function VoicePath({
  onComplete,
}: {
  onComplete: (data: CompletionData) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasSpeechApi, setHasSpeechApi] = useState(false);
  const [step, setStep] = useState<"record" | "processing" | "confirm">("record");
  const [processStep, setProcessStep] = useState(0);
  const [proofNote, setProofNote] = useState("");
  const recogRef = useRef<unknown>(null);

  const VOICE_STEPS = ["音声を解析中…", "AI 鑑定中…", "出品中…", "デプロイ URL 発行中…"];

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
    recog.lang = "ja-JP"; recog.continuous = true; recog.interimResults = true;
    recog.onresult = (event: Event & { results: SpeechRecognitionResultList }) => {
      const text = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript).join("");
      setTranscript(text);
    };
    recog.onerror = () => setIsRecording(false);
    recog.onend = () => setIsRecording(false);
    recog.start();
    recogRef.current = recog;
    setIsRecording(true);
  }, [isRecording, hasSpeechApi]);

  const handleProcess = useCallback(async () => {
    const proof = voiceLogToProofOfMake(transcript || "制作へのこだわりと思いを込めました");
    setProofNote(proof.refinedDescription);
    setStep("processing");

    for (let i = 0; i < VOICE_STEPS.length; i++) {
      setProcessStep(i);
      await new Promise((r) => setTimeout(r, 600));
    }
    setProcessStep(VOICE_STEPS.length);

    const newId = `listing_${Date.now()}`;
    const ccaf: CCAF = { intentSignals: proof.intentSignals, thoughtDensity: 72, iterations: 14, authorId: "demo-user", createdAt: new Date().toISOString() };
    const auditResult = audit({ ccaf, vercelUptimeDays: 30 });
    const floor = computeFloorPrice(5000, trust.score);
    const title = `音声登記 — ${new Date().toLocaleDateString("ja-JP")}`;

    const ml: MarketplaceListing = autoList(
      { id: newId, ownerId: "demo-user", title, description: proof.refinedDescription, ccaf, vercelUptimeDays: 30, basePrice: 5000, proofOfMakeNote: transcript },
      { qualityHistory: 70, discordContribution: 55, xAmplification: 40 },
      new Date().toISOString()
    );
    try {
      const existing: MarketplaceListing[] = JSON.parse(localStorage.getItem("guild_custom_listings") ?? "[]");
      localStorage.setItem("guild_custom_listings", JSON.stringify([...existing, ml]));
    } catch { /* ignore */ }

    onComplete({
      listingId: newId, title, rank: auditResult.rank, floorPrice: floor,
      deployUrl: `https://vercel.com/new/clone?repository-url=https://github.com/demo/voice-asset`,
      apiEndpoint: `https://guild-ai.vercel.app/api/atoa/${newId}`,
    });
  }, [transcript, onComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {step === "record" && (
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-kuroko">この作品のこだわりは？</h2>
            <p className="mt-1 text-sm text-[#9890A8]">声で話すだけで制作秘話として登記されます</p>
          </div>

          <button
            type="button" onClick={toggleRecording}
            aria-label={isRecording ? "録音停止" : "録音開始"}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all active:scale-95 shadow-lg ${isRecording ? "bg-red-500 animate-pulse shadow-red-200" : "bg-kaki hover:opacity-90 shadow-kaki/20"}`}
          >
            {isRecording ? "⏹" : "🎙️"}
          </button>

          <p className="text-sm text-[#9890A8]">{isRecording ? "録音中… タップで停止" : hasSpeechApi ? "タップして録音開始" : "ブラウザが音声入力非対応です"}</p>

          <textarea
            rows={4} value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="制作秘話・こだわりをここに入力（音声入力の結果も編集できます）"
            aria-label="制作秘話"
            className="input-base resize-none w-full"
          />

          {transcript.length > 0 && (
            <button type="button" onClick={handleProcess} className="btn-primary w-full !py-3 !text-base">
              AIが整形 → 鑑定 → 出品する
            </button>
          )}
        </div>
      )}

      {step === "processing" && (
        <AutoProgress steps={VOICE_STEPS} currentStep={processStep} />
      )}
    </div>
  );
}

// ─── Path 3: テキストで登記 ────────────────────────────────────────────────────

function TextPath({
  onComplete,
  remixId,
  remixFrom,
}: {
  onComplete: (data: CompletionData) => void;
  remixId: string | null;
  remixFrom: string | null;
}) {
  const [title, setTitle] = useState(remixFrom ? `${remixFrom} — Remix` : "");
  const [githubUrl, setGithubUrl] = useState("");
  const [description, setDescription] = useState(remixFrom ? generateRemixDescription(remixFrom) : "");
  const [proofOfMakeNote, setProofOfMakeNote] = useState("");
  const [ccaf, setCcaf] = useState<CCAF>(defaultCCAF);
  const [vercelUptimeDays, setUptime] = useState(30);
  const [basePrice, setBasePrice] = useState(5000);
  const [payoutCurrency, setPayoutCurrency] = useState<Currency>("JPY");
  const [promotedPrice, setPromotedPrice] = useState<number | null>(null);

  const auditResult = useMemo(() => audit({ ccaf, vercelUptimeDays }), [ccaf, vercelUptimeDays]);
  const floor = useMemo(() => promotedPrice ?? computeFloorPrice(basePrice, trust.score), [basePrice, promotedPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || "新しい知能資産";
    const newId = `listing_${Date.now()}`;

    const ml: MarketplaceListing = autoList(
      { id: newId, ownerId: "demo-user", title: finalTitle, description: description || "説明なし", ccaf: { ...ccaf, createdAt: new Date().toISOString() }, vercelUptimeDays, basePrice, githubUrl: githubUrl || undefined, remixedFrom: remixId || undefined, proofOfMakeNote: proofOfMakeNote || undefined },
      { qualityHistory: 70, discordContribution: 55, xAmplification: 40 },
      new Date().toISOString()
    );

    try {
      const existing: MarketplaceListing[] = JSON.parse(localStorage.getItem("guild_custom_listings") ?? "[]");
      localStorage.setItem("guild_custom_listings", JSON.stringify([...existing, ml]));
    } catch { /* ignore */ }

    onComplete({
      listingId: newId, title: finalTitle,
      rank: auditResult.rank, floorPrice: floor,
      deployUrl: `https://vercel.com/new/clone?repository-url=${githubUrl || "https://github.com/demo/repo"}`,
      apiEndpoint: `https://guild-ai.vercel.app/api/atoa/${newId}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic info */}
      <div className="section-card p-5 space-y-3">
        <h2 className="text-base font-bold text-kuroko">基本情報</h2>
        <label className="flex flex-col gap-1 text-sm text-[#3A3664]">
          タイトル
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="知能資産のタイトル" aria-label="タイトル" className="input-base" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[#3A3664]">
          GitHub URL（任意）
          <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/owner/repo" aria-label="GitHub URL" className="input-base" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[#3A3664]">
          説明文
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="この知能資産が解決する課題と特徴" aria-label="説明文" className="input-base resize-none" />
        </label>
      </div>

      {/* CCAF */}
      <div className="section-card p-5 space-y-3">
        <h2 className="text-base font-bold text-kuroko">制作の証明</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm text-[#3A3664]">
            思考密度 (0–100)
            <input type="number" value={ccaf.thoughtDensity} min={0} max={100}
              onChange={(e) => setCcaf({ ...ccaf, thoughtDensity: Number(e.target.value) })}
              aria-label="思考密度" className="input-base" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[#3A3664]">
            試行回数
            <input type="number" value={ccaf.iterations} min={0}
              onChange={(e) => setCcaf({ ...ccaf, iterations: Number(e.target.value) })}
              aria-label="試行回数" className="input-base" />
          </label>
          <label className="col-span-2 flex flex-col gap-1 text-sm text-[#3A3664]">
            稼働日数
            <input type="number" value={vercelUptimeDays} min={0}
              onChange={(e) => setUptime(Number(e.target.value))}
              aria-label="稼働日数" className="input-base" />
          </label>
        </div>
      </div>

      {/* AI鑑定プレビュー + Radar */}
      <div className="section-card p-5">
        <h2 className="text-base font-bold text-kuroko mb-4">AI 鑑定プレビュー</h2>
        <div className="flex flex-col items-center sm:flex-row gap-6">
          <RankRadar thoughtDensity={ccaf.thoughtDensity} iterations={ccaf.iterations} uptimeDays={vercelUptimeDays} />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <RankBadge rank={auditResult.rank} large />
              <span className="text-base text-[#3A3664]">スコア {auditResult.score}</span>
            </div>
            <ul className="space-y-1">
              {auditResult.reasons.map((r) => (
                <li key={r} className="flex gap-2 text-sm text-[#3A3664]">
                  <span className="text-kaki mt-0.5">·</span>{r}
                </li>
              ))}
            </ul>
            {auditResult.justification && (
              <div className="rounded-xl border border-kaki/20 bg-kaki/5 px-3 py-2.5">
                <p className="text-xs font-semibold text-kaki mb-1">💬 AIの解説</p>
                <p className="text-sm text-[#3A3664] leading-relaxed">{auditResult.justification}</p>
              </div>
            )}
            <WillSignalTrigger
              currentRank={auditResult.rank}
              floorPrice={floor}
              onPromoted={(p) => { setPromotedPrice(p); setCcaf((c) => ({ ...c, intentSignals: [...c.intentSignals, "voice-intent"] })); }}
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="section-card p-5 space-y-3">
        <h2 className="text-base font-bold text-kuroko">価格設定</h2>
        <label className="flex flex-col gap-1 text-sm text-[#3A3664]">
          ベース価格（¥）
          <input type="number" value={basePrice} min={0}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            aria-label="ベース価格" className="input-base" />
        </label>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#9890A8]">Floor Price</span>
          <div>
            <span className="text-2xl font-bold text-kuroko">{formatJPY(floor)}</span>
            <span className="ml-2 text-sm text-[#9890A8]">({floor.toLocaleString("ja-JP")} JPYC)</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#3A3664] mb-2">報酬の受け取り通貨</p>
          <div className="flex gap-4">
            {(["JPY", "JPYC"] as Currency[]).map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payoutCurrency" value={c} checked={payoutCurrency === c}
                  onChange={() => setPayoutCurrency(c)} className="accent-kaki" aria-label={`${c}で受け取る`} />
                <span className="text-base font-medium text-kuroko">{c}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" aria-label="Marketplaceへ出品する" className="btn-primary w-full !py-4 !text-base">
        AIが鑑定して Marketplace へ出品する
      </button>
    </form>
  );
}

// ─── Main SellContent ─────────────────────────────────────────────────────────

function SellContent() {
  const params = useSearchParams();
  const remixId = params.get("remix");
  const remixFrom = params.get("from");

  const [activePath, setActivePath] = useState<RegistrationPath>("ai");
  const [completion, setCompletion] = useState<CompletionData | null>(null);
  const [timerStart] = useState(() => Date.now());
  const [doItForMeActive, setDoItForMeActive] = useState(false);
  const [doItForMeStep, setDoItForMeStep] = useState(0);
  const router = useRouter();

  const handleDoItForMe = useCallback(async () => {
    setDoItForMeActive(true);
    const steps = AUTO_STEPS;
    for (let i = 0; i < steps.length; i++) {
      setDoItForMeStep(i);
      await new Promise((r) => setTimeout(r, 900));
    }
    setDoItForMeStep(steps.length);

    const newId = `listing_${Date.now()}`;
    const ccaf: CCAF = { intentSignals: ["author-statement", "auto-generated"], thoughtDensity: 78, iterations: 12, authorId: "demo-user", createdAt: new Date().toISOString() };
    const auditResult = audit({ ccaf, vercelUptimeDays: 30 });
    const floor = computeFloorPrice(7000, trust.score);

    const ml: MarketplaceListing = autoList(
      { id: newId, ownerId: "demo-user", title: "AI自動登記 — 知能資産", description: "AIが全自動で生成した知能資産。高品質なコードとドキュメントを自動最適化。", ccaf, vercelUptimeDays: 30, basePrice: 7000 },
      { qualityHistory: 70, discordContribution: 55, xAmplification: 40 },
      new Date().toISOString()
    );
    try {
      const existing: MarketplaceListing[] = JSON.parse(localStorage.getItem("guild_custom_listings") ?? "[]");
      localStorage.setItem("guild_custom_listings", JSON.stringify([...existing, ml]));
    } catch { /* ignore */ }

    setDoItForMeActive(false);
    setCompletion({
      listingId: newId, title: "AI自動登記 — 知能資産",
      rank: auditResult.rank, floorPrice: floor,
      deployUrl: `https://vercel.com/new/clone?repository-url=https://github.com/demo/ai-asset`,
      apiEndpoint: `https://guild-ai.vercel.app/api/atoa/${newId}`,
    });
  }, []);

  const PATH_TABS: Array<{ id: RegistrationPath; label: string; time: string; desc: string }> = [
    { id: "ai",    label: "AIにお任せ",   time: "1分", desc: "GitHub連携→自動出品" },
    { id: "voice", label: "音声で登記",    time: "2分", desc: "話すだけでOK" },
    { id: "text",  label: "テキストで登記", time: "3分", desc: "詳細を自分で入力" },
  ];

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">

      {/* Do It For Me overlay */}
      {doItForMeActive && (
        <AutoProgress steps={AUTO_STEPS} currentStep={doItForMeStep} overlay={true} />
      )}

      <StepIndicator current="register" />

      {/* Header */}
      <div className="mt-4 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kuroko leading-snug">知能を出品する</h1>
          <p className="mt-1 text-sm text-[#9890A8]">3分以内に登記→デプロイURL発行まで Fast-Path 完了</p>
        </div>
        <button
          type="button"
          onClick={handleDoItForMe}
          aria-label="全自動でAIにお任せ"
          className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98] hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #1A6BB5 0%, #0FA968 100%)" }}
        >
          ✨ 全自動でAIにお任せ
        </button>
      </div>

      {remixFrom && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-kaki/30 bg-kaki/10 px-3 py-2">
          <span className="text-sm text-kaki font-medium">Remix元:</span>
          <span className="text-sm text-kuroko font-semibold truncate max-w-[240px]">{remixFrom}</span>
        </div>
      )}

      {/* Timer */}
      {!completion && <TimerBar startAt={timerStart} />}

      {/* Completion screen */}
      {completion ? (
        <CompletionCard data={completion} />
      ) : (
        <>
          {/* 3-path tabs */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {PATH_TABS.map(({ id, label, time, desc }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActivePath(id)}
                aria-pressed={activePath === id}
                aria-label={`${label}（${time}）`}
                className={`rounded-xl border p-3 text-center transition-all active:scale-[0.97] ${
                  activePath === id
                    ? "border-kaki bg-kaki/5 ring-1 ring-kaki/20"
                    : "border-kuroko/15 bg-white hover:border-kaki/30"
                }`}
              >
                <p className={`text-sm font-bold ${activePath === id ? "text-kaki" : "text-kuroko"}`}>{label}</p>
                <p className="text-xs text-accent-green font-semibold">{time}</p>
                <p className="text-xs text-[#9890A8] mt-0.5 hidden sm:block">{desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-5">
            {activePath === "ai" && (
              <div className="section-card p-5">
                <AiPath
                  onComplete={setCompletion}
                  onReset={() => setActivePath("ai")}
                />
              </div>
            )}
            {activePath === "voice" && (
              <div className="section-card p-5">
                <VoicePath onComplete={setCompletion} />
              </div>
            )}
            {activePath === "text" && (
              <TextPath onComplete={setCompletion} remixId={remixId} remixFrom={remixFrom} />
            )}
          </div>
        </>
      )}
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
