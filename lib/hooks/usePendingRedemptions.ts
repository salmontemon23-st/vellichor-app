"use client";

import { useCallback, useEffect, useState } from "react";
import type { RedemptionFulfillment } from "@/lib/redemption-types";

/**
 * Off-chain redemption fulfillment records for the connected wallet — a
 * separate, persistent data source from on-chain holdings (see
 * lib/redemption-store.ts), since burned units vanish from getPortfolio()
 * but the fulfillment record must stay reachable until Vellichor marks it
 * shipped. Shared by the Dashboard's "Pending Redemptions" card and the
 * Holdings page.
 */
export function usePendingRedemptions(address: string | undefined) {
  const [pendingRedemptions, setPendingRedemptions] = useState<RedemptionFulfillment[]>([]);

  const refetch = useCallback(async () => {
    if (!address) return;
    const res = await fetch(`/api/redemptions?wallet=${address}`);
    if (res.ok) {
      const { redemptions } = (await res.json()) as { redemptions: RedemptionFulfillment[] };
      setPendingRedemptions(redemptions);
    }
  }, [address]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // "shipped"/"delivered" are treated as fulfillment-complete and dropped
  // from the visible list — everything before that stays visible
  // indefinitely, per the no-expiry requirement.
  const visiblePendingRedemptions = pendingRedemptions.filter(
    (r) => r.status !== "shipped" && r.status !== "delivered"
  );

  return { pendingRedemptions, visiblePendingRedemptions, setPendingRedemptions, refetch };
}
