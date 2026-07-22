"use client";

import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { VELLICHOR_VAULT_ABI, VELLICHOR_VAULT_ADDRESS } from "@/lib/contracts";
import type { Holding } from "@/lib/hooks/usePortfolioData";

export function RedeemModal({
  holding,
  onClose,
  onRedeemed,
}: {
  holding: Holding;
  onClose: () => void;
  onRedeemed: (txHash?: string) => void;
}) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) onRedeemed(hash);
  }, [isSuccess, onRedeemed, hash]);

  function handleRedeem() {
    // Pass the full held balance — canRedeem() already confirmed it equals
    // 100% of outstanding units, so this consolidates and completes
    // redemption in one call. There is no partial-redemption path.
    writeContract({
      address: VELLICHOR_VAULT_ADDRESS!,
      abi: VELLICHOR_VAULT_ABI,
      functionName: "requestRedemption",
      args: [holding.bottleId, holding.units],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-2xl text-center">
        {isSuccess ? (
          <>
            <p className="font-display text-lg font-normal text-ink">Redemption submitted</p>
            <p className="mt-2 text-sm text-ink-dim">
              {holding.bottle.name} has been redeemed on-chain. Units burned in tx:
            </p>
            <p className="mt-2 break-all font-data text-xs text-ink-dim">{hash}</p>
            <p className="mt-3 text-sm text-ink-dim">
              Opening your shipping &amp; ID verification form — that&apos;s handled off-chain and
              hasn&apos;t started yet.
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-lg font-normal text-ink">Redeem {holding.bottle.name}</p>
            <p className="mt-2 text-sm text-ink-dim">
              You hold 100% of this bottle&apos;s units. This calls requestRedemption() as a real
              transaction on Robinhood Chain, burning your units.
            </p>
            <button
              onClick={handleRedeem}
              disabled={isPending || isConfirming}
              className="mt-5 w-full rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-60"
            >
              {isPending ? "Confirm in wallet…" : isConfirming ? "Redeeming…" : "Start Redemption"}
            </button>
            {error && <p className="mt-3 text-sm text-wine">{error.message}</p>}
          </>
        )}
        <button
          onClick={onClose}
          className="mt-3 w-full rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:border-amber"
        >
          Close
        </button>
      </div>
    </div>
  );
}
