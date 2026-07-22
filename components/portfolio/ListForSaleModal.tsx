"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  VELLICHOR_MARKET_ABI,
  VELLICHOR_MARKET_ADDRESS,
  PAYMENT_TOKEN_SYMBOL,
  PAYMENT_TOKEN_DECIMALS,
  contractsConfigured,
} from "@/lib/contracts";
import type { Holding } from "@/lib/hooks/usePortfolioData";

export function ListForSaleModal({ holding, onClose }: { holding: Holding; onClose: () => void }) {
  const [units, setUnits] = useState("1");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const { address } = useAccount();

  const { data: approvedForAll, refetch: refetchApprovedForAll } = useReadContract({
    address: VELLICHOR_VAULT_ADDRESS,
    abi: VELLICHOR_VAULT_ABI,
    functionName: "isApprovedForAll",
    args: address && VELLICHOR_MARKET_ADDRESS ? [address, VELLICHOR_MARKET_ADDRESS] : undefined,
    query: { enabled: contractsConfigured && !!address },
  });

  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const {
    writeContract: writeList,
    data: listHash,
    isPending: isListPending,
    error: listError,
  } = useWriteContract();
  const { isLoading: isListConfirming, isSuccess: isListSuccess } = useWaitForTransactionReceipt({
    hash: listHash,
  });

  useEffect(() => {
    if (isApproveSuccess) refetchApprovedForAll();
  }, [isApproveSuccess, refetchApprovedForAll]);

  function handleApprove() {
    writeApprove({
      address: VELLICHOR_VAULT_ADDRESS!,
      abi: VELLICHOR_VAULT_ABI,
      functionName: "setApprovalForAll",
      args: [VELLICHOR_MARKET_ADDRESS, true],
    });
  }

  function handleList(e: FormEvent) {
    e.preventDefault();
    writeList({
      address: VELLICHOR_MARKET_ADDRESS!,
      abi: VELLICHOR_MARKET_ABI,
      functionName: "listForSale",
      args: [holding.bottleId, BigInt(units || "0"), parseUnits(pricePerUnit || "0", PAYMENT_TOKEN_DECIMALS)],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <h2 className="font-display text-lg font-normal text-ink">List {holding.bottle.name} for resale</h2>
        <p className="mt-2 text-sm text-ink-dim">You hold {holding.units.toString()} unit(s).</p>

        {isListSuccess ? (
          <div className="mt-4 text-center">
            <p className="font-display text-base font-normal text-ink">Listed on the Market</p>
            <p className="mt-2 break-all font-data text-xs text-ink-dim">Tx: {listHash}</p>
          </div>
        ) : (
          <form onSubmit={handleList} className="mt-4 flex flex-col gap-3">
            <input
              required
              type="number"
              min="1"
              max={holding.units.toString()}
              placeholder="Units to list"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink font-data"
            />
            <input
              required
              type="number"
              min="0"
              step="0.0001"
              placeholder={`Price per unit (${PAYMENT_TOKEN_SYMBOL})`}
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink font-data"
            />

            {!approvedForAll ? (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApprovePending || isApproveConfirming}
                className="rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-60"
              >
                {isApprovePending ? "Confirm in wallet…" : isApproveConfirming ? "Approving…" : "Approve Market"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isListPending || isListConfirming}
                className="rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-60"
              >
                {isListPending ? "Confirm in wallet…" : isListConfirming ? "Listing…" : "List for Sale"}
              </button>
            )}
            {(approveError || listError) && (
              <p className="text-sm text-wine">{(approveError ?? listError)?.message}</p>
            )}
          </form>
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
