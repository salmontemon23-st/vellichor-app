"use client";

import { useEffect, useState, type FormEvent } from "react";
import { formatUnits, parseUnits } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  VELLICHOR_MARKET_ABI,
  VELLICHOR_MARKET_ADDRESS,
  PAYMENT_TOKEN_SYMBOL,
  PAYMENT_TOKEN_DECIMALS,
} from "@/lib/contracts";
import type { OnChainListing, OnChainBottle } from "@/lib/contracts";
import { useBottleMetadata } from "@/components/BottleCardOnChain";
import { ipfsToHttp } from "@/lib/ipfs";

/** Own active resale listing row — Cancel and Reprice actions. */
export function ListingRow({ listing, bottle }: { listing: OnChainListing; bottle: OnChainBottle | undefined }) {
  const meta = useBottleMetadata(bottle?.metadataURI ?? "", bottle?.bottleId);
  const [repricing, setRepricing] = useState(false);
  const [newPrice, setNewPrice] = useState(formatUnits(listing.pricePerUnit, PAYMENT_TOKEN_DECIMALS));

  const {
    writeContract: writeCancel,
    data: cancelHash,
    isPending: isCancelPending,
    error: cancelError,
  } = useWriteContract();
  const { isLoading: isCancelConfirming } = useWaitForTransactionReceipt({ hash: cancelHash });

  const {
    writeContract: writeReprice,
    data: repriceHash,
    isPending: isRepricePending,
    error: repriceError,
  } = useWriteContract();
  const { isLoading: isRepriceConfirming, isSuccess: isRepriceSuccess } = useWaitForTransactionReceipt({
    hash: repriceHash,
  });

  useEffect(() => {
    if (isRepriceSuccess) setRepricing(false);
  }, [isRepriceSuccess]);

  function handleCancel() {
    writeCancel({
      address: VELLICHOR_MARKET_ADDRESS!,
      abi: VELLICHOR_MARKET_ABI,
      functionName: "cancelListing",
      args: [listing.listingId],
    });
  }

  function handleReprice(e: FormEvent) {
    e.preventDefault();
    writeReprice({
      address: VELLICHOR_MARKET_ADDRESS!,
      abi: VELLICHOR_MARKET_ABI,
      functionName: "updateListingPrice",
      args: [listing.listingId, parseUnits(newPrice || "0", PAYMENT_TOKEN_DECIMALS)],
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {meta?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ipfsToHttp(meta.image)}
            alt={bottle?.name ?? "Bottle"}
            className="h-14 w-14 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded-lg bg-panel-2" />
        )}
        <div>
          <p className="font-display text-lg font-normal text-ink">
            {bottle?.name ?? `Bottle #${listing.bottleId.toString()}`}
          </p>
          <p className="mt-1 text-sm text-ink-dim">
            {listing.unitsForSale.toString()} unit(s) @ {formatUnits(listing.pricePerUnit, PAYMENT_TOKEN_DECIMALS)}{" "}
            {PAYMENT_TOKEN_SYMBOL}
          </p>
        </div>
      </div>

      {repricing ? (
        <form onSubmit={handleReprice} className="flex items-center gap-2">
          <input
            required
            type="number"
            min="0"
            step="0.0001"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="w-32 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink font-data"
          />
          <button
            type="submit"
            disabled={isRepricePending || isRepriceConfirming}
            className="rounded-full bg-amber px-4 py-2 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-60"
          >
            {isRepricePending ? "Confirm…" : isRepriceConfirming ? "Updating…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setRepricing(false)}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-amber"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRepricing(true)}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-amber"
            >
              Reprice
            </button>
            <button
              onClick={handleCancel}
              disabled={isCancelPending || isCancelConfirming}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-wine hover:text-wine disabled:opacity-60"
            >
              {isCancelPending ? "Confirm…" : isCancelConfirming ? "Cancelling…" : "Cancel Listing"}
            </button>
          </div>
          {(cancelError || repriceError) && (
            <p className="text-xs text-wine">{(cancelError ?? repriceError)?.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
