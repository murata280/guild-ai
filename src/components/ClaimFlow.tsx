"use client";
import { useState } from "react";
import { Shimaenaga } from "@/components/Shimaenaga";

type ClaimMethod = "commit" | "file";
type ClaimStep = "select" | "instructions" | "verifying" | "result";

interface ClaimFlowProps {
  assetId: string;
}

export function ClaimFlow({ assetId }: ClaimFlowProps) {
  const [method, setMethod] = useState<ClaimMethod>("commit");
  const [step, setStep] = useState<ClaimStep>("select");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleVerify = async () => {
    setStep("verifying");
    try {
      const payload =
        method === "commit"
          ? { message: `GUILD-CLAIM:mock-token-${assetId}`, verified: true }
          : { path: ".guild/claim.json", contents: { token: `mock-token-${assetId}` } };

      const res = await fetch("/api/claim/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Verify": "true",
        },
        body: JSON.stringify({ repoUrl: `https://github.com/example/${assetId}`, method, payload }),
      });
      const data = await res.json() as { success?: boolean };
      if (data.success) {
        setResult({ success: true, message: "権利が確認されました。遡及報酬が解禁されます。" });
      } else {
        setResult({ success: false, message: "確認に失敗しました。手順を確認してもう一度お試しください。" });
      }
    } catch {
      setResult({ success: false, message: "通信エラーが発生しました。" });
    }
    setStep("result");
  };

  return (
    <div className="mt-4 section-card p-5 border-2 border-[#FFCC00]/40 bg-[#FFFBEA]">
      <div className="flex items-center gap-3 mb-4">
        <div className="shrink-0">
          {step === "instructions" || step === "verifying" ? (
            <Shimaenaga variant="key" size="sm" mode="guardian" />
          ) : (
            <Shimaenaga variant="trust" size="sm" />
          )}
        </div>
        <div>
          <h2 className="text-base font-bold text-kuroko">この作品の権利を主張する</h2>
          <p className="text-xs text-[#9890A8]">アセット ID: {assetId}</p>
        </div>
      </div>

      {/* Step 1: Method selection */}
      {step === "select" && (
        <div className="space-y-4">
          <p className="text-sm text-[#4A4464]">権利を主張する方法を選んでください。</p>
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-widest text-[#9890A8] mb-2">確認方法</legend>
            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-kuroko/15 p-3 hover:border-kaki/40 transition-colors">
              <input
                type="radio"
                name={`claim-method-${assetId}`}
                value="commit"
                checked={method === "commit"}
                onChange={() => setMethod("commit")}
                className="accent-kaki mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-kuroko">署名コミット</p>
                <p className="text-xs text-[#9890A8]">特定のメッセージを含むコミットをリポジトリにプッシュする</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-kuroko/15 p-3 hover:border-kaki/40 transition-colors">
              <input
                type="radio"
                name={`claim-method-${assetId}`}
                value="file"
                checked={method === "file"}
                onChange={() => setMethod("file")}
                className="accent-kaki mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-kuroko">隠しファイル</p>
                <p className="text-xs text-[#9890A8]">.guild/claim.json をリポジトリに追加する</p>
              </div>
            </label>
          </fieldset>
          <button
            type="button"
            onClick={() => setStep("instructions")}
            className="btn-primary w-full !py-3"
            aria-label="次のステップへ"
          >
            次へ →
          </button>
        </div>
      )}

      {/* Step 2: Instructions */}
      {step === "instructions" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-[#4A4464]">
            <Shimaenaga variant="key" size="xs" mode="guardian" />
            <p>以下の手順でリポジトリに変更を加えてください。</p>
          </div>
          {method === "commit" ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#9890A8]">1. 以下のメッセージでコミットを作成する</p>
              <code className="block rounded-lg bg-kuroko px-3 py-2 text-xs font-mono text-accent-green break-all">
                git commit --allow-empty -m &quot;GUILD-CLAIM:mock-token-{assetId}&quot;
              </code>
              <p className="text-xs font-semibold text-[#9890A8]">2. リポジトリにプッシュする</p>
              <code className="block rounded-lg bg-kuroko px-3 py-2 text-xs font-mono text-accent-green break-all">
                git push origin main
              </code>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#9890A8]">1. 以下のファイルを作成する: .guild/claim.json</p>
              <pre className="rounded-lg bg-kuroko px-3 py-2 text-xs font-mono text-accent-green overflow-x-auto">
                {JSON.stringify({ token: `mock-token-${assetId}`, claimerHandle: "your-github-handle" }, null, 2)}
              </pre>
              <p className="text-xs font-semibold text-[#9890A8]">2. コミットしてプッシュする</p>
              <code className="block rounded-lg bg-kuroko px-3 py-2 text-xs font-mono text-accent-green break-all">
                git add .guild/claim.json && git commit -m &quot;Add GUILD claim file&quot; && git push
              </code>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("select")}
              className="btn-secondary flex-1 !py-2 !text-sm"
            >
              戻る
            </button>
            <button
              type="button"
              onClick={handleVerify}
              className="btn-primary flex-1 !py-2 !text-sm"
              aria-label="権利を確認する"
            >
              確認する
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Verifying */}
      {step === "verifying" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="animate-pulse">
            <Shimaenaga variant="key" size="md" mode="guardian" />
          </div>
          <p className="text-sm text-[#4A4464]">確認中です…しばらくお待ちください</p>
        </div>
      )}

      {/* Step 4: Result */}
      {step === "result" && result && (
        <div className={`rounded-xl p-4 ${result.success ? "bg-accent-green/10 border border-accent-green/30" : "bg-red-50 border border-red-200"}`}>
          <div className="flex items-center gap-3">
            <Shimaenaga variant={result.success ? "coin" : "trust"} size="sm" />
            <div>
              <p className={`text-sm font-bold ${result.success ? "text-accent-green" : "text-red-600"}`}>
                {result.success ? "権利の確認に成功しました" : "確認に失敗しました"}
              </p>
              <p className="text-xs text-[#4A4464] mt-0.5">{result.message}</p>
            </div>
          </div>
          {!result.success && (
            <button
              type="button"
              onClick={() => { setStep("select"); setResult(null); }}
              className="mt-3 btn-secondary w-full !py-2 !text-sm"
            >
              もう一度試す
            </button>
          )}
        </div>
      )}
    </div>
  );
}
