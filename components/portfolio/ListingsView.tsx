"use client";

import { usePortfolioData } from "@/lib/hooks/usePortfolioData";
import { useWalletModal } from "@/lib/wallet-modal";
import { contractsConfigured } from "@/lib/contracts";
import { PortfolioEmptyState } from "@/components/PortfolioEmptyState";
import { ListingRow } from "@/components/portfolio/ListingRow";

export function ListingsView() {
  const { isConnected, activeSellerListings, bottlesById } = usePortfolioData();
  const { open } = useWalletModal();

  if (!contractsConfigured) {
    return (
      <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
        Market contract address is not configured yet.
      </p>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-panel px-6 py-24 text-center">
        <p className="font-display text-xl font-normal text-ink">Connect your wallet to see your listings</p>
        <button
          onClick={open}
          className="mt-6 rounded-full bg-amber px-6 py-3 text-sm font-semibold text-white hover:bg-amber-deep"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (activeSellerListings.length === 0) {
    return (
      <PortfolioEmptyState
        title="No active listings"
        body="List some of your Vault Units for resale from your Holdings."
        ctaLabel="Go to Holdings"
        ctaHref="/portfolio/holdings"
        variant="list"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {activeSellerListings.map((l) => (
        <ListingRow key={l.listingId.toString()} listing={l} bottle={bottlesById.get(l.bottleId.toString())} />
      ))}
    </div>
  );
}
