// GUILD AI — Drizzle DB client
// Default driver: @neondatabase/serverless (HTTP). Works in Node + Edge runtimes
// and matches Vercel's Neon-marketplace recommendation.
// To swap to a non-Neon Postgres (RDS, Supabase direct, local docker), replace
// neon/neon-http with drizzle-orm/node-postgres + pg.

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local (dev) or Vercel project env (prod)."
  );
}

const sql = neon(url);

export const db = drizzle(sql, { schema });
export type DB = typeof db;
export { schema };
