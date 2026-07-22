"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  VELLICHOR_MARKET_ABI,
  VELLICHOR_MARKET_ADDRESS,
  contractsConfigured,
} from "@/lib/contracts";

/**
 * For each given bottleId, finds the most recent recorded trade price —
 * whichever happened more recently on-chain between a primary buyUnits()
 * purchase (Vault's UnitsPurchased) or a secondary buyListing() purchase
 * (Market's Purchased, cross-referenced to its bottle via the Listed event,
 * since Purchased itself only indexes listingId). No oracle, no stored
 * index — just event history, per the Portfolio spec. Falls back to the
 * bottle's current listed pricePerUnit if it has no recorded trade yet.
 */
export function useLatestTradePrices(bottleIds: bigint[]) {
  const publicClient = usePublicClient();
  const [prices, setPrices] = useState<Map<string, bigint>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const key = bottleIds.map((id) => id.toString()).sort().join(",");

  useEffect(() => {
    if (!publicClient || !contractsConfigured || bottleIds.length === 0) {
      setPrices(new Map());
      return;
    }
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      const next = new Map<string, bigint>();

      await Promise.all(
        bottleIds.map(async (bottleId) => {
          let bestPrice: bigint | null = null;
          let bestBlock = -1n;

          const unitsPurchasedLogs = await publicClient.getContractEvents({
            address: VELLICHOR_VAULT_ADDRESS!,
            abi: VELLICHOR_VAULT_ABI,
            eventName: "UnitsPurchased",
            args: { bottleId: [bottleId] },
            fromBlock: 0n,
            toBlock: "latest",
          });
          for (const log of unitsPurchasedLogs) {
            const { units, cost } = log.args as { units: bigint; cost: bigint };
            const block = log.blockNumber ?? 0n;
            if (units > 0n && block > bestBlock) {
              bestBlock = block;
              bestPrice = cost / units;
            }
          }

          const listedLogs = await publicClient.getContractEvents({
            address: VELLICHOR_MARKET_ADDRESS!,
            abi: VELLICHOR_MARKET_ABI,
            eventName: "Listed",
            args: { bottleId: [bottleId] },
            fromBlock: 0n,
            toBlock: "latest",
          });
          const listingIds = listedLogs.map((l) => (l.args as { listingId: bigint }).listingId);

          if (listingIds.length > 0) {
            const purchasedLogs = await publicClient.getContractEvents({
              address: VELLICHOR_MARKET_ADDRESS!,
              abi: VELLICHOR_MARKET_ABI,
              eventName: "Purchased",
              args: { listingId: listingIds },
              fromBlock: 0n,
              toBlock: "latest",
            });
            for (const log of purchasedLogs) {
              const { units, totalPaid } = log.args as { units: bigint; totalPaid: bigint };
              const block = log.blockNumber ?? 0n;
              if (units > 0n && block > bestBlock) {
                bestBlock = block;
                bestPrice = totalPaid / units;
              }
            }
          }

          if (bestPrice !== null) next.set(bottleId.toString(), bestPrice);
        })
      );

      if (!cancelled) {
        setPrices(next);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, key]);

  return { prices, isLoading };
}
