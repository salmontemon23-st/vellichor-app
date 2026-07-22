"use client";

import { useEffect, useMemo, useState } from "react";
import { usePublicClient, useReadContract, useReadContracts } from "wagmi";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  VELLICHOR_MARKET_ABI,
  VELLICHOR_MARKET_ADDRESS,
  contractsConfigured,
  type OnChainBottle,
  type OnChainListing,
} from "@/lib/contracts";
import type { BottleActivityEntry } from "./useBottleActivity";

const SEVEN_DAYS_SECONDS = 7n * 24n * 60n * 60n;

/**
 * Unique-holder count has no direct contract read — ERC-1155 doesn't
 * enumerate holders — so this derives candidate addresses from this bottle's
 * TransferSingle/TransferBatch logs, then confirms which still hold a
 * balance > 0 via a batched balanceOf call. Fine at Genesis Vault scale
 * (a handful of transfers per bottle); move to an indexer/subgraph if the
 * catalog and transfer volume grow large enough that this gets expensive.
 */
function useBottleOwnerCount(bottleId: bigint | null) {
  const publicClient = usePublicClient();
  const [candidates, setCandidates] = useState<`0x${string}`[]>([]);

  useEffect(() => {
    if (!publicClient || !contractsConfigured || bottleId === null) {
      setCandidates([]);
      return;
    }
    let cancelled = false;

    (async () => {
      const [singleLogs, batchLogs] = await Promise.all([
        publicClient.getContractEvents({
          address: VELLICHOR_VAULT_ADDRESS!,
          abi: VELLICHOR_VAULT_ABI,
          eventName: "TransferSingle",
          args: { id: bottleId },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        publicClient.getContractEvents({
          address: VELLICHOR_VAULT_ADDRESS!,
          abi: VELLICHOR_VAULT_ABI,
          eventName: "TransferBatch",
          fromBlock: 0n,
          toBlock: "latest",
        }),
      ]);

      const addresses = new Set<string>();
      singleLogs.forEach((log) => {
        const { to } = log.args as { to: `0x${string}` };
        if (to && to !== "0x0000000000000000000000000000000000000000") addresses.add(to);
      });
      batchLogs.forEach((log) => {
        const { to, ids } = log.args as { to: `0x${string}`; ids: readonly bigint[] };
        if (to && to !== "0x0000000000000000000000000000000000000000" && ids.includes(bottleId)) {
          addresses.add(to);
        }
      });
      // The Market contract escrows units while listed — it's not a
      // beneficial owner, just temporary custody, so exclude it.
      const marketLower = VELLICHOR_MARKET_ADDRESS?.toLowerCase();
      const owners = Array.from(addresses).filter((a) => a.toLowerCase() !== marketLower);

      if (!cancelled) setCandidates(owners as `0x${string}`[]);
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient, bottleId]);

  const { data: balances } = useReadContracts({
    contracts: candidates.map((addr) => ({
      address: VELLICHOR_VAULT_ADDRESS,
      abi: VELLICHOR_VAULT_ABI,
      functionName: "balanceOf",
      args: [addr, bottleId ?? 0n],
    })),
    query: { enabled: contractsConfigured && candidates.length > 0 && bottleId !== null },
  });

  return useMemo(() => {
    if (!balances) return candidates.length === 0 ? 0 : undefined;
    return balances.filter((b) => ((b.result as bigint | undefined) ?? 0n) > 0n).length;
  }, [balances, candidates.length]);
}

export function useBottleMarketStats({
  bottleId,
  bottle,
  activityEntries,
}: {
  bottleId: bigint | null;
  bottle: OnChainBottle | null;
  activityEntries: BottleActivityEntry[];
}) {
  const { data: listingData } = useReadContract({
    address: VELLICHOR_MARKET_ADDRESS,
    abi: VELLICHOR_MARKET_ABI,
    functionName: "getActiveListings",
    query: { enabled: contractsConfigured, refetchInterval: 15000 },
  });

  const secondaryListings = useMemo<OnChainListing[]>(() => {
    if (!listingData || bottleId === null) return [];
    const [structs, ids] = listingData as [Omit<OnChainListing, "listingId">[], bigint[]];
    return structs.map((l, i) => ({ ...l, listingId: ids[i] })).filter((l) => l.bottleId === bottleId);
  }, [listingData, bottleId]);

  const ownerCount = useBottleOwnerCount(bottleId);

  return useMemo(() => {
    const primaryAvailable = !!bottle && !bottle.redeemed && bottle.unitsSold < bottle.totalUnits;
    const primaryUnits = bottle ? bottle.totalUnits - bottle.unitsSold : 0n;

    const prices: bigint[] = [];
    if (primaryAvailable && bottle) prices.push(bottle.pricePerUnit);
    secondaryListings.forEach((l) => prices.push(l.pricePerUnit));
    const floorPrice = prices.length > 0 ? prices.reduce((a, b) => (a < b ? a : b)) : null;

    const listedUnits = (primaryAvailable ? primaryUnits : 0n) + secondaryListings.reduce((sum, l) => sum + l.unitsForSale, 0n);
    const totalUnits = bottle?.totalUnits ?? 0n;

    const nowSec = BigInt(Math.floor(Date.now() / 1000));
    const recentBuys = activityEntries.filter(
      (e) => (e.type === "buy_primary" || e.type === "buy_secondary") && nowSec - e.timestamp <= SEVEN_DAYS_SECONDS
    );
    const sevenDaySales = recentBuys.length;
    const sevenDayVolume = recentBuys.reduce((sum, e) => {
      if (e.type === "buy_primary") return sum + e.cost;
      if (e.type === "buy_secondary") return sum + e.totalPaid;
      return sum;
    }, 0n);

    return {
      floorPrice,
      listedUnits,
      totalUnits,
      sevenDaySales,
      sevenDayVolume,
      ownerCount,
      secondaryListings,
    };
  }, [bottle, secondaryListings, activityEntries, ownerCount]);
}
