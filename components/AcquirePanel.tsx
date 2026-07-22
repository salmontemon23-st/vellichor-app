"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { useWalletModal } from "@/lib/wallet-modal";
import { robinhoodChain } from "@/lib/chains";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  PAYMENT_TOKEN_ADDRESS,
  PAYMENT_TOKEN_SYMBOL,
  PAYMENT_TOKEN_DECIMALS,
  ERC20_ABI,
  contractsConfigured,
  type OnChainBottle,
} from "@/lib/contracts";
import { percentClaimedOnChain } from "./BottleCardOnChain";

export function AcquirePanel({
  bottle,
  onClose,
}: {
  bottle: OnChainBottle;
  onClose: () => void;
}) {
  const { address, isConnected, chainId } = useAccount();
  const { open } = useWalletModal();
  const [units, setUnits] = useState(1);

  const maxUnits = bottle.totalUnits - bottle.unitsSold;
  const total = BigInt(units) * bottle.pricePerUnit;
  const wrongNetwork = isConnected && chainId !== robinhoodChain.id;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: PAYMENT_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && VELLICHOR_VAULT_ADDRESS ? [address, VELLICHOR_VAULT_ADDRESS] : undefined,
    query: { enabled: contractsConfigured && !!address },
  });

  const needsApproval = useMemo(() => {
    if (allowance === undefined) return true;
    return (allowance as bigint) < total;
  }, [allowance, total]);

  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const {
    writeContract: writeBuy,
    data: buyHash,
    isPending: isBuyPending,
    error: buyError,
    reset: resetBuy,
  } = useWriteContract();
  const { isLoading: isBuyConfirming, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  useEffect(() => {
    if (isApproveSuccess) refetchAllowance();
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleApprove() {
    if (!VELLICHOR_VAULT_ADDRESS || !PAYMENT_TOKEN_ADDRESS) return;
    resetApprove();
    writeApprove({
      address: PAYMENT_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [VELLICHOR_VAULT_ADDRESS, total],
    });
  }

  function handleBuy() {
    if (!VELLICHOR_VAULT_ADDRESS) return;
    resetBuy();
    writeBuy({
      address: VELLICHOR_VAULT_ADDRESS,
      abi: VELLICHOR_VAULT_ABI,
      functionName: "buyUnits",
      args: [bottle.bottleId, BigInt(units)],
    });
  }

  const isBusy = isApprovePending || isApproveConfirming || isBuyPending || isBuyConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <span className="eyebrow">Vault Unit</span>
            <h2 className="mt-1 font-display text-xl font-normal text-ink">{bottle.name}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-ink-dim hover:text-ink">
            ✕
          </button>
        </div>

        {isBuySuccess ? (
          <div className="mt-6 rounded-xl border border-line bg-panel-2 p-5 text-center">
            <p className="font-display text-lg font-normal text-ink">Purchase confirmed</p>
            <p className="mt-1 text-sm text-ink-dim">
              {units} unit{units > 1 ? "s" : ""} of {bottle.name} added to your portfolio.
            </p>
            <p className="mt-2 break-all font-data text-xs text-ink-dim">Tx: {buyHash}</p>
            <button
              onClick={onClose}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5 flex items-center justify-between rounded-xl border border-line bg-panel-2 px-4 py-3">
              <span className="text-sm text-ink-dim">Units</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUnits((u) => Math.max(1, u - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink"
                >
                  −
                </button>
                <span className="w-8 text-center font-data text-ink">{units}</span>
                <button
                  onClick={() => setUnits((u) => Math.min(Number(maxUnits), u + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-ink-dim">
                <span>Price / unit</span>
                <span className="font-data text-ink">
                  {formatUnits(bottle.pricePerUnit, PAYMENT_TOKEN_DECIMALS)} {PAYMENT_TOKEN_SYMBOL}
                </span>
              </div>
              <div className="flex justify-between text-ink-dim">
                <span>Units available</span>
                <span className="font-data text-ink">{maxUnits.toString()}</span>
              </div>
              <div className="flex justify-between text-ink-dim">
                <span>% claimed after purchase</span>
                <span className="font-data text-ink">
                  {percentClaimedOnChain({
                    ...bottle,
                    unitsSold: bottle.unitsSold + BigInt(units),
                  })}
                  %
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold text-ink">
                <span>Total</span>
                <span className="font-data">
                  {formatUnits(total, PAYMENT_TOKEN_DECIMALS)} {PAYMENT_TOKEN_SYMBOL}
                </span>
              </div>
            </div>

            {!contractsConfigured ? (
              <p className="mt-6 rounded-xl bg-wine/10 px-4 py-3 text-center text-sm text-wine">
                Vault contract not configured yet.
              </p>
            ) : !isConnected ? (
              <button
                onClick={open}
                className="mt-6 w-full rounded-full bg-amber px-5 py-3 text-sm font-semibold text-white hover:bg-amber-deep"
              >
                Connect Wallet to Buy
              </button>
            ) : wrongNetwork ? (
              <p className="mt-6 rounded-xl bg-wine/10 px-4 py-3 text-center text-sm text-wine">
                Switch to Robinhood Chain to continue.
              </p>
            ) : needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isBusy || maxUnits === 0n}
                className="mt-6 w-full rounded-full bg-amber px-5 py-3 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-60"
              >
                {isApprovePending
                  ? "Confirm approval in wallet…"
                  : isApproveConfirming
                    ? "Approving…"
                    : `Approve ${PAYMENT_TOKEN_SYMBOL}`}
              </button>
            ) : (
              <button
                onClick={handleBuy}
                disabled={isBusy || maxUnits === 0n}
                className="mt-6 w-full rounded-full bg-amber px-5 py-3 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-60"
              >
                {isBuyPending
                  ? "Confirm in wallet…"
                  : isBuyConfirming
                    ? "Confirming…"
                    : `Buy ${units} Unit${units > 1 ? "s" : ""}`}
              </button>
            )}

            {(approveError || buyError) && (
              <p className="mt-3 text-sm text-wine">{(approveError ?? buyError)?.message}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
