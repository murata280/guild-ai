"use server";

// GUILD AI — Passbook Server Action
// Exposes the DB-enriched passbook snapshot to "use client" pages without
// pulling the Neon driver into the browser bundle.

import type { PassbookSnapshot } from "@/types";
import { getPassbookSnapshotFromDb } from "@/lib/passbook/db";

export async function getPassbookSnapshotAction(userId: string): Promise<PassbookSnapshot> {
  return getPassbookSnapshotFromDb(userId);
}
