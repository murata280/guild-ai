// Vitest setup — loads .env.local so DB-backed integration tests can connect.
// Optional file: missing .env.local is silently ignored (CI without DB).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

try {
  const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(?:"([^"]*)"|(.*))\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2] ?? m[3] ?? "";
  }
} catch {
  // .env.local absent — tests that require DATABASE_URL will skipIf-skip themselves.
}
