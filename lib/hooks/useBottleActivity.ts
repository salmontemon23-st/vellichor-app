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

export type BottleActivityEntry =
  | { type: "buy_primary"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; buyer: `0x${string}`; units: bigint; cost: bigint }
  | { type: "buy_secondary"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; buyer: `0x${string}`; units: bigint; totalPaid: bigint }
  | { type: "listed"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; seller: `0x${string}`; units: bigint; pricePerUnit: bigint }
  | { type: "listing_cancelled"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; listingId: bigint }
  | { type: "listing_updated"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; listingId: bigint; newPricePerUnit: bigint }
  | { type: "redemption_requested"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; redeemer: `0x${string}`; unitsBurned: bigint }
  | { type: "bottle_redeemed"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; redeemer: `0x${string}` };

/**
 * Same event-log-derived approach as usePortfolioActivity, scoped to one
 * bottleId instead of one wallet. Purchased/ListingCancelled/ListingUpdated
 * only index listingId (not bottleId), so this bottle's own Listed events
 * are read first to collect the listingIds that belong to it, then those
 * three events are filtered down to that set.
 */
export function useBottleActivity(bottleId: bigint | null) {
  const publicClient = usePublicClient();
  const [entries, setEntries] = useState<BottleActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicClient || !contractsConfigured || bottleId === null) {
      setEntries([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      const [unitsPurchasedLogs, redemptionRequestedLogs, bottleRedeemedLogs, listedLogs] = await Promise.all([
        publicClient.getContractEvents({
          address: VELLICHOR_VAULT_ADDRESS!,
          abi: VELLICHOR_VAULT_ABI,
          eventName: "UnitsPurchased",
          args: { bottleId: [bottleId] },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        publicClient.getContractEvents({
          address: VELLICHOR_VAULT_ADDRESS!,
          abi: VELLICHOR_VAULT_ABI,
          eventName: "RedemptionRequested",
          args: { bottleId: [bottleId] },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        publicClient.getContractEvents({
          address: VELLICHOR_VAULT_ADDRESS!,
          abi: VELLICHOR_VAULT_ABI,
          eventName: "BottleRedeemed",
          args: { bottleId: [bottleId] },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        publicClient.getContractEvents({
          address: VELLICHOR_MARKET_ADDRESS!,
          abi: VELLICHOR_MARKET_ABI,
          eventName: "Listed",
          args: { bottleId: [bottleId] },
          fromBlock: 0n,
          toBlock: "latest",
        }),
      ]);

      const bottleListingIds = listedLogs.map((l) => (l.args as { listingId: bigint }).listingId);

      const [purchasedLogs, cancelledLogs, updatedLogs] =
        bottleListingIds.length > 0
          ? await Promise.all([
              publicClient.getContractEvents({
                address: VELLICHOR_MARKET_ADDRESS!,
                abi: VELLICHOR_MARKET_ABI,
                eventName: "Purchased",
                args: { listingId: bottleListingIds },
                fromBlock: 0n,
                toBlock: "latest",
              }),
              publicClient.getContractEvents({
                address: VELLICHOR_MARKET_ADDRESS!,
                abi: VELLICHOR_MARKET_ABI,
                eventName: "ListingCancelled",
                args: { listingId: bottleListingIds },
                fromBlock: 0n,
                toBlock: "latest",
              }),
              publicClient.getContractEvents({
                address: VELLICHOR_MARKET_ADDRESS!,
                abi: VELLICHOR_MARKET_ABI,
                eventName: "ListingUpdated",
                args: { listingId: bottleListingIds },
                fromBlock: 0n,
                toBlock: "latest",
              }),
            ])
          : [[], [], []];

      const result: BottleActivityEntry[] = [];

      unitsPurchasedLogs.forEach((log) => {
        const { buyer, units, cost } = log.args as { buyer: `0x${string}`; units: bigint; cost: bigint };
        result.push({
          type: "buy_primary",
          key: `bp-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          buyer,
          units,
          cost,
        });
      });

      purchasedLogs.forEach((log) => {
        const { buyer, units, totalPaid } = log.args as { buyer: `0x${string}`; units: bigint; totalPaid: bigint };
        result.push({
          type: "buy_secondary",
          key: `bs-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          buyer,
          units,
          totalPaid,
        });
      });

      listedLogs.forEach((log) => {
        const { seller, units, pricePerUnit } = log.args as { seller: `0x${string}`; units: bigint; pricePerUnit: bigint };
        result.push({
          type: "listed",
          key: `l-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          seller,
          units,
          pricePerUnit,
        });
      });

      cancelledLogs.forEach((log) => {
        const { listingId } = log.args as { listingId: bigint };
        result.push({
          type: "listing_cancelled",
          key: `lc-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          listingId,
        });
      });

      updatedLogs.forEach((log) => {
        const { listingId, newPricePerUnit } = log.args as { listingId: bigint; newPricePerUnit: bigint };
        result.push({
          type: "listing_updated",
          key: `lu-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          listingId,
          newPricePerUnit,
        });
      });

      redemptionRequestedLogs.forEach((log) => {
        const { redeemer, unitsBurned } = log.args as { redeemer: `0x${string}`; unitsBurned: bigint };
        result.push({
          type: "redemption_requested",
          key: `rr-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          redeemer,
          unitsBurned,
        });
      });

      bottleRedeemedLogs.forEach((log) => {
        const { redeemer } = log.args as { redeemer: `0x${string}` };
        result.push({
          type: "bottle_redeemed",
          key: `br-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          redeemer,
        });
      });

      result.sort((a, b) => (b.blockNumber > a.blockNumber ? 1 : b.blockNumber < a.blockNumber ? -1 : 0));

      const uniqueBlocks = Array.from(new Set(result.map((e) => e.blockNumber)));
      const timestampByBlock = new Map<string, bigint>();
      await Promise.all(
        uniqueBlocks.map(async (blockNumber) => {
          try {
            const block = await publicClient.getBlock({ blockNumber });
            timestampByBlock.set(blockNumber.toString(), block.timestamp);
          } catch {
            // leave unresolved timestamps at 0n
          }
        })
      );
      const withTimestamps = result.map((e) => ({
        ...e,
        timestamp: timestampByBlock.get(e.blockNumber.toString()) ?? 0n,
      })) as BottleActivityEntry[];

      if (!cancelled) {
        setEntries(withTimestamps);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient, bottleId]);

  return { entries, isLoading };
}
