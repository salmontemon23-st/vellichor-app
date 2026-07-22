import { formatUnits } from "viem";
import { PAYMENT_TOKEN_SYMBOL, PAYMENT_TOKEN_DECIMALS } from "@/lib/contracts";
import type { ActivityEntry } from "@/lib/hooks/usePortfolioActivity";

export const ACTIVITY_TYPE_GROUPS = {
  all: "All Types",
  purchases: "Purchases",
  listings: "Listings",
  redemptions: "Redemptions",
} as const;

export type ActivityTypeGroup = keyof typeof ACTIVITY_TYPE_GROUPS;

export function activityTypeGroup(entry: ActivityEntry): Exclude<ActivityTypeGroup, "all"> {
  switch (entry.type) {
    case "buy_primary":
    case "buy_secondary":
      return "purchases";
    case "listed":
    case "listing_cancelled":
    case "listing_updated":
      return "listings";
    case "redemption_requested":
    case "bottle_redeemed":
      return "redemptions";
  }
}

function bottleLabel(bottlesById: Map<string, { name: string }>, bottleId: bigint | null) {
  if (bottleId === null) return "Bottle";
  return bottlesById.get(bottleId.toString())?.name ?? `Bottle #${bottleId.toString()}`;
}

/** Formats an ActivityEntry into the Type | Asset Name | Amount columns shared by the Dashboard preview and the full Activity table. */
export function formatActivityEntry(entry: ActivityEntry, bottlesById: Map<string, { name: string }>) {
  const assetName = bottleLabel(bottlesById, entry.bottleId ?? null);
  switch (entry.type) {
    case "buy_primary":
      return {
        type: "Bought Vault Units",
        assetName,
        amount: `${entry.units.toString()} unit(s) — ${formatUnits(entry.cost, PAYMENT_TOKEN_DECIMALS)} ${PAYMENT_TOKEN_SYMBOL}`,
      };
    case "buy_secondary":
      return {
        type: "Bought on Market",
        assetName,
        amount: `${entry.units.toString()} unit(s) — ${formatUnits(entry.totalPaid, PAYMENT_TOKEN_DECIMALS)} ${PAYMENT_TOKEN_SYMBOL}`,
      };
    case "listed":
      return {
        type: "Listed for resale",
        assetName,
        amount: `${entry.units.toString()} unit(s) @ ${formatUnits(entry.pricePerUnit, PAYMENT_TOKEN_DECIMALS)} ${PAYMENT_TOKEN_SYMBOL}`,
      };
    case "listing_cancelled":
      return { type: "Cancelled listing", assetName, amount: "—" };
    case "listing_updated":
      return {
        type: "Updated listing price",
        assetName,
        amount: `${formatUnits(entry.newPricePerUnit, PAYMENT_TOKEN_DECIMALS)} ${PAYMENT_TOKEN_SYMBOL}`,
      };
    case "redemption_requested":
      return {
        type: "Requested redemption",
        assetName,
        amount: `${entry.unitsBurned.toString()} unit(s) burned`,
      };
    case "bottle_redeemed":
      return { type: "Bottle redeemed", assetName, amount: "—" };
  }
}

export function formatActivityDate(timestamp: bigint) {
  if (timestamp === 0n) return "—";
  return new Date(Number(timestamp) * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
