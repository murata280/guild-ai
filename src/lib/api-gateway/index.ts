// GUILD AI — API Gateway
// Issues API keys to buyers AFTER payment is verified (Verification & Trust Layer).
// Security:
//   - Raw token: 24 random bytes from crypto.randomBytes → ~32 base64url chars,
//     prefixed with "gld_". ~192 bits of entropy.
//   - Storage: SHA-256 hash only. Raw token is returned exactly once at issuance.
//   - DB dump leakage scope: hash only. Raw keys are unrecoverable from a backup.

import { eq, sql } from "drizzle-orm";
import { randomBytes, createHash } from "node:crypto";
import type { ApiKey, GatewayLog } from "@/types";
import { isPaymentSettled } from "@/lib/checkout";
import { db } from "@/db/client";
import { apiKeys, gatewayLogs } from "@/db/schema";

type ApiKeyRow = typeof apiKeys.$inferSelect;
type GatewayLogRow = typeof gatewayLogs.$inferSelect;

function generateRawKey(): string {
  return "gld_" + randomBytes(24).toString("base64url");
}

function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

function rowToApiKey(row: ApiKeyRow, rawKey = ""): ApiKey {
  return {
    id: row.id,
    buyerId: row.buyerId,
    assetId: row.assetId,
    key: rawKey, // empty when read from DB; populated only at issuance time
    issuedAt: row.issuedAt.toISOString(),
    callCount: row.callCount,
  };
}

function rowToLog(row: GatewayLogRow): GatewayLog {
  return {
    apiKeyId: row.apiKeyId,
    requestedAt: row.requestedAt.toISOString(),
    success: row.success,
    latencyMs: row.latencyMs,
  };
}

export async function issueApiKey(buyerId: string, assetId: string): Promise<ApiKey> {
  const id = `key-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const rawKey = generateRawKey();
  const [row] = await db
    .insert(apiKeys)
    .values({ id, buyerId, assetId, keyHash: hashKey(rawKey) })
    .returning();
  return rowToApiKey(row, rawKey);
}

export async function verifyPaymentSettled(sessionId: string): Promise<boolean> {
  return isPaymentSettled(sessionId);
}

export async function issueApiKeyVerified(
  buyerId: string,
  assetId: string,
  sessionId: string
): Promise<ApiKey> {
  if (!(await verifyPaymentSettled(sessionId))) {
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

export async function proxyRequest(apiKeyId: string, _payload: ProxyPayload): Promise<ProxyResult> {
  // Atomic increment + read in one round trip; missing key returns no row.
  const [row] = await db
    .update(apiKeys)
    .set({ callCount: sql`${apiKeys.callCount} + 1` })
    .where(eq(apiKeys.id, apiKeyId))
    .returning();
  if (!row) return { success: false, latencyMs: 0, error: "Invalid API key" };

  const latencyMs = 50 + Math.floor(Math.random() * 200);
  await db.insert(gatewayLogs).values({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    apiKeyId,
    success: true,
    latencyMs,
  });
  return { success: true, latencyMs, output: { status: "ok", callCount: row.callCount } };
}

export async function getApiKey(id: string): Promise<ApiKey | undefined> {
  const [row] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
  return row ? rowToApiKey(row) : undefined;
}

export async function getLogs(apiKeyId: string): Promise<GatewayLog[]> {
  const rows = await db.select().from(gatewayLogs).where(eq(gatewayLogs.apiKeyId, apiKeyId));
  return rows.map(rowToLog);
}

// Test-only. Wipes ALL api_keys + gateway_logs — do not call in production.
export async function _resetStore(): Promise<void> {
  await db.delete(gatewayLogs);
  await db.delete(apiKeys);
}
