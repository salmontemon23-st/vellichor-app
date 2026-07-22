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

export type ActivityEntry =
  | { type: "buy_primary"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; bottleId: bigint; units: bigint; cost: bigint }
  | { type: "buy_secondary"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; bottleId: bigint | null; units: bigint; totalPaid: bigint }
  | { type: "listed"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; bottleId: bigint; units: bigint; pricePerUnit: bigint }
  | { type: "listing_cancelled"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; bottleId: bigint | null; listingId: bigint }
  | { type: "listing_updated"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; bottleId: bigint | null; listingId: bigint; newPricePerUnit: bigint }
  | { type: "redemption_requested"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; bottleId: bigint; unitsBurned: bigint }
  | { type: "bottle_redeemed"; key: string; blockNumber: bigint; timestamp: bigint; txHash: `0x${string}`; bottleId: bigint };

/**
 * Builds the wallet's full transaction history straight from on-chain event
 * logs — no separate activity-tracking contract feature, per the spec.
 * ListingCancelled/ListingUpdated only index listingId (not seller), so
 * "the wallet's own listing activity" is derived by first collecting this
 * wallet's own Listed listingIds, then filtering those two events down to
 * that set.
 */
export function usePortfolioActivity(address: `0x${string}` | undefined) {
  const publicClient = usePublicClient();
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicClient || !contractsConfigured || !address) {
      setEntries([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      const [unitsPurchasedLogs, redemptionRequestedLogs, bottleRedeemedLogs, listedLogs, purchasedAsBuyerLogs] =
        await Promise.all([
          publicClient.getContractEvents({
            address: VELLICHOR_VAULT_ADDRESS!,
            abi: VELLICHOR_VAULT_ABI,
            eventName: "UnitsPurchased",
            args: { buyer: [address] },
            fromBlock: 0n,
            toBlock: "latest",
          }),
          publicClient.getContractEvents({
            address: VELLICHOR_VAULT_ADDRESS!,
            abi: VELLICHOR_VAULT_ABI,
            eventName: "RedemptionRequested",
            args: { redeemer: [address] },
            fromBlock: 0n,
            toBlock: "latest",
          }),
          publicClient.getContractEvents({
            address: VELLICHOR_VAULT_ADDRESS!,
            abi: VELLICHOR_VAULT_ABI,
            eventName: "BottleRedeemed",
            args: { redeemer: [address] },
            fromBlock: 0n,
            toBlock: "latest",
          }),
          publicClient.getContractEvents({
            address: VELLICHOR_MARKET_ADDRESS!,
            abi: VELLICHOR_MARKET_ABI,
            eventName: "Listed",
            args: { seller: [address] },
            fromBlock: 0n,
            toBlock: "latest",
          }),
          publicClient.getContractEvents({
            address: VELLICHOR_MARKET_ADDRESS!,
            abi: VELLICHOR_MARKET_ABI,
            eventName: "Purchased",
            args: { buyer: [address] },
            fromBlock: 0n,
            toBlock: "latest",
          }),
        ]);

      const ownListingIds = listedLogs.map((l) => (l.args as { listingId: bigint }).listingId);
      const listingBottleMap = new Map<string, bigint>();
      listedLogs.forEach((l) => {
        const { listingId, bottleId } = l.args as { listingId: bigint; bottleId: bigint };
        listingBottleMap.set(listingId.toString(), bottleId);
      });

      const [cancelledLogs, updatedLogs] = await Promise.all([
        ownListingIds.length > 0
          ? publicClient.getContractEvents({
              address: VELLICHOR_MARKET_ADDRESS!,
              abi: VELLICHOR_MARKET_ABI,
              eventName: "ListingCancelled",
              args: { listingId: ownListingIds },
              fromBlock: 0n,
              toBlock: "latest",
            })
          : Promise.resolve([]),
        ownListingIds.length > 0
          ? publicClient.getContractEvents({
              address: VELLICHOR_MARKET_ADDRESS!,
              abi: VELLICHOR_MARKET_ABI,
              eventName: "ListingUpdated",
              args: { listingId: ownListingIds },
              fromBlock: 0n,
              toBlock: "latest",
            })
          : Promise.resolve([]),
      ]);

      const result: ActivityEntry[] = [];

      unitsPurchasedLogs.forEach((log) => {
        const { bottleId, units, cost } = log.args as { bottleId: bigint; units: bigint; cost: bigint };
        result.push({
          type: "buy_primary",
          key: `bp-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          bottleId,
          units,
          cost,
        });
      });

      purchasedAsBuyerLogs.forEach((log) => {
        const { listingId, units, totalPaid } = log.args as { listingId: bigint; units: bigint; totalPaid: bigint };
        result.push({
          type: "buy_secondary",
          key: `bs-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          bottleId: listingBottleMap.get(listingId.toString()) ?? null,
          units,
          totalPaid,
        });
      });

      listedLogs.forEach((log) => {
        const { bottleId, units, pricePerUnit } = log.args as {
          bottleId: bigint;
          units: bigint;
          pricePerUnit: bigint;
        };
        result.push({
          type: "listed",
          key: `l-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          bottleId,
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
          bottleId: listingBottleMap.get(listingId.toString()) ?? null,
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
          bottleId: listingBottleMap.get(listingId.toString()) ?? null,
          listingId,
          newPricePerUnit,
        });
      });

      redemptionRequestedLogs.forEach((log) => {
        const { bottleId, unitsBurned } = log.args as { bottleId: bigint; unitsBurned: bigint };
        result.push({
          type: "redemption_requested",
          key: `rr-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          bottleId,
          unitsBurned,
        });
      });

      bottleRedeemedLogs.forEach((log) => {
        const { bottleId } = log.args as { bottleId: bigint };
        result.push({
          type: "bottle_redeemed",
          key: `br-${log.transactionHash}-${log.logIndex}`,
          blockNumber: log.blockNumber ?? 0n,
          timestamp: 0n,
          txHash: log.transactionHash!,
          bottleId,
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
      })) as ActivityEntry[];

      if (!cancelled) {
        setEntries(withTimestamps);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient, address]);

  return { entries, isLoading };
}
