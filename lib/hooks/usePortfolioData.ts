"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  VELLICHOR_MARKET_ABI,
  VELLICHOR_MARKET_ADDRESS,
  contractsConfigured,
  type OnChainBottle,
  type OnChainListing,
} from "@/lib/contracts";

export interface Holding {
  bottleId: bigint;
  units: bigint;
  bottle: OnChainBottle;
}

/**
 * Shared on-chain read layer for the whole /portfolio section — one set of
 * getPortfolio()/getAllBottles()/getListingsBySeller() reads, reused by the
 * Dashboard, Holdings, and Listings pages instead of each page re-fetching
 * the same data independently.
 */
export function usePortfolioData() {
  const { address, isConnected } = useAccount();

  const {
    data: portfolioData,
    isLoading: isPortfolioLoading,
    refetch: refetchPortfolio,
  } = useReadContract({
    address: VELLICHOR_VAULT_ADDRESS,
    abi: VELLICHOR_VAULT_ABI,
    functionName: "getPortfolio",
    args: address ? [address] : undefined,
    query: { enabled: contractsConfigured && !!address },
  });

  const { data: allBottlesData } = useReadContract({
    address: VELLICHOR_VAULT_ADDRESS,
    abi: VELLICHOR_VAULT_ABI,
    functionName: "getAllBottles",
    query: { enabled: contractsConfigured },
  });

  const {
    data: sellerListingsData,
    refetch: refetchSellerListings,
  } = useReadContract({
    address: VELLICHOR_MARKET_ADDRESS,
    abi: VELLICHOR_MARKET_ABI,
    functionName: "getListingsBySeller",
    args: address ? [address] : undefined,
    query: { enabled: contractsConfigured && !!address },
  });

  const bottlesById = useMemo(() => {
    const map = new Map<string, OnChainBottle>();
    if (allBottlesData) {
      const [structs, ids] = allBottlesData as [Omit<OnChainBottle, "bottleId">[], bigint[]];
      structs.forEach((b, i) => map.set(ids[i].toString(), { ...b, bottleId: ids[i] }));
    }
    return map;
  }, [allBottlesData]);

  const holdings = useMemo<Holding[]>(() => {
    if (!portfolioData) return [];
    const [bottleIds, balances] = portfolioData as [bigint[], bigint[]];
    return bottleIds
      .map((id, i) => ({ bottleId: id, units: balances[i], bottle: bottlesById.get(id.toString()) }))
      .filter((h): h is Holding => !!h.bottle && h.units > 0n);
  }, [portfolioData, bottlesById]);

  const allSellerListings = useMemo<OnChainListing[]>(() => {
    if (!sellerListingsData) return [];
    const [structs, ids] = sellerListingsData as [Omit<OnChainListing, "listingId">[], bigint[]];
    return structs.map((l, i) => ({ ...l, listingId: ids[i] }));
  }, [sellerListingsData]);

  const activeSellerListings = useMemo(
    () => allSellerListings.filter((l) => l.active),
    [allSellerListings]
  );

  return {
    address,
    isConnected,
    isPortfolioLoading,
    holdings,
    bottlesById,
    allSellerListings,
    activeSellerListings,
    refetchPortfolio,
    refetchSellerListings,
  };
}
