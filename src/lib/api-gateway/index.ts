// GUILD AI — API Gateway
// Issues API keys to buyers after payment is verified.
// Verification & Trust Layer: no settled payment → no API key.

import type { ApiKey, GatewayLog } from "@/types";
import { isPaymentSettled } from "@/lib/checkout";

const keyStore = new Map<string, ApiKey>();
const logStore: GatewayLog[] = [];

function generateKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "gld_";
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function issueApiKey(buyerId: string, assetId: string): ApiKey {
  const existing = [...keyStore.values()].find(
    (k) => k.buyerId === buyerId && k.assetId === assetId
  );
  if (existing) return existing;

  const apiKey: ApiKey = {
    id: `key-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    buyerId,
    assetId,
    key: generateKey(),
    issuedAt: new Date().toISOString(),
    callCount: 0,
  };
  keyStore.set(apiKey.id, apiKey);
  return apiKey;
}

export function verifyPaymentSettled(sessionId: string): boolean {
  return isPaymentSettled(sessionId);
}

export function issueApiKeyVerified(
  buyerId: string,
  assetId: string,
  sessionId: string
): ApiKey {
  if (!verifyPaymentSettled(sessionId)) {
    throw new Error("GUILD-E401: Payment not settled. API Key issuance denied.");
  }
  return issueApiKey(buyerId, assetId);
}

export interface ProxyPayload { input: unknown }
export interface ProxyResult {
  success: boolean;
  latencyMs: number;
  output?: unknown;
  error?: string;
}

export function proxyRequest(apiKeyId: string, _payload: ProxyPayload): ProxyResult {
  const key = keyStore.get(apiKeyId);
  if (!key) return { success: false, latencyMs: 0, error: "Invalid API key" };

  key.callCount += 1;
  const latencyMs = 50 + Math.floor(Math.random() * 200);
  logStore.push({ apiKeyId, requestedAt: new Date().toISOString(), success: true, latencyMs });

  return { success: true, latencyMs, output: { status: "ok", callCount: key.callCount } };
}

export function getApiKey(id: string): ApiKey | undefined {
  return keyStore.get(id);
}

export function getLogs(apiKeyId: string): GatewayLog[] {
  return logStore.filter((l) => l.apiKeyId === apiKeyId);
}

export function _resetStore(): void {
  keyStore.clear();
  logStore.length = 0;
}
