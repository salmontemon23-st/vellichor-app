import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RedemptionFormFields, RedemptionFulfillment, RedemptionStatus } from "./redemption-types";

/**
 * Server-only store for off-chain redemption fulfillment records (spec
 * Part 2, Step 5). Backs the "Pending Redemption" flow: once a wallet's
 * requestRedemption() confirms on-chain, a record is created here to track
 * shipping/contact/ID details until Vellichor marks the bottle shipped.
 *
 * This project has no existing database/ORM dependency, so a JSON file is
 * used as a minimal persistence layer. Now that Vault/Market are live on
 * mainnet, this is a real gap, not a hypothetical one: swap this for a real
 * access-controlled database before any real shipping/ID data lands here.
 *
 * Do not import this module from a "use client" component — it uses Node's
 * fs module and must only run in Route Handlers / server code.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "redemptions.json");

function readAll(): RedemptionFulfillment[] {
  if (!existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8")) as RedemptionFulfillment[];
  } catch {
    return [];
  }
}

function writeAll(records: RedemptionFulfillment[]) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), "utf-8");
}

function recordId(wallet: string, bottleId: string) {
  return `${wallet.toLowerCase()}:${bottleId}`;
}

/** Only ever returns records for the requested wallet — callers (API
 * routes) must not expose another wallet's shipping/ID data. */
export function listRedemptionsByWallet(wallet: string): RedemptionFulfillment[] {
  const w = wallet.toLowerCase();
  return readAll().filter((r) => r.wallet === w);
}

export function getRedemption(wallet: string, bottleId: string): RedemptionFulfillment | undefined {
  return readAll().find((r) => r.id === recordId(wallet, bottleId));
}

/**
 * Called the moment requestRedemption() confirms on-chain. Idempotent — if
 * a record already exists for this wallet+bottle (e.g. the tab was closed
 * and reopened before the form was completed), the existing record is
 * returned unchanged instead of being reset, so no submitted data is ever
 * lost and the pending state survives across sessions.
 */
export function createPendingRedemption(
  wallet: string,
  bottleId: string,
  txHash: string | null
): RedemptionFulfillment {
  const records = readAll();
  const id = recordId(wallet, bottleId);
  const existing = records.find((r) => r.id === id);
  if (existing) return existing;

  const now = new Date().toISOString();
  const record: RedemptionFulfillment = {
    id,
    wallet: wallet.toLowerCase(),
    bottleId,
    status: "pending_info",
    txHash,
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    email: "",
    phone: "",
    idDocumentName: "",
    createdAt: now,
    updatedAt: now,
  };
  records.push(record);
  writeAll(records);
  return record;
}

/**
 * Records shipping/contact/ID details submitted from the fulfillment form.
 * Never moves status backwards — re-editing a "verified" submission stays
 * "verified", it doesn't regress to "submitted". Returns null if no pending
 * record exists yet for this wallet+bottle (the wallet must first go
 * through createPendingRedemption() via a confirmed on-chain redemption).
 */
export function submitRedemptionDetails(
  wallet: string,
  bottleId: string,
  fields: Partial<RedemptionFormFields>
): RedemptionFulfillment | null {
  const records = readAll();
  const id = recordId(wallet, bottleId);
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const current = records[idx];
  const nextStatus: RedemptionStatus = current.status === "pending_info" ? "submitted" : current.status;

  const updated: RedemptionFulfillment = {
    ...current,
    ...fields,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
  records[idx] = updated;
  writeAll(records);
  return updated;
}
