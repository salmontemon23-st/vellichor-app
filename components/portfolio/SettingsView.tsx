"use client";

import { useState } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { robinhoodChain } from "@/lib/chains";
import { useWalletModal } from "@/lib/wallet-modal";

export function SettingsView() {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { open } = useWalletModal();
  const [truncated, setTruncated] = useState(true);

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-panel px-6 py-24 text-center">
        <p className="font-display text-xl font-normal text-ink">Connect your wallet</p>
        <p className="mt-2 max-w-sm text-sm text-ink-dim">
          Connect a wallet to view your account settings.
        </p>
        <button
          onClick={open}
          className="mt-6 rounded-full bg-amber px-6 py-3 text-sm font-semibold text-white hover:bg-amber-deep"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const wrongNetwork = chainId !== robinhoodChain.id;
  const displayAddress = truncated ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-line bg-panel p-6">
        <p className="eyebrow">Connected wallet</p>
        <p className="mt-2 break-all font-data text-base text-ink">{displayAddress}</p>
        <label className="mt-4 flex items-center gap-2 text-sm text-ink-dim">
          <input
            type="checkbox"
            checked={truncated}
            onChange={(e) => setTruncated(e.target.checked)}
            className="h-4 w-4 rounded border-line"
          />
          Show truncated address
        </label>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-6">
        <p className="eyebrow">Network</p>
        <p className="mt-2 text-base text-ink">
          {wrongNetwork ? "Not connected to Robinhood Chain" : robinhoodChain.name}
        </p>
        {wrongNetwork && (
          <button
            onClick={() => switchChain({ chainId: robinhoodChain.id })}
            disabled={isSwitching}
            className="mt-4 rounded-full bg-wine px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {isSwitching ? "Switching…" : "Switch to Robinhood Chain"}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-panel p-6">
        <p className="eyebrow">Disconnect</p>
        <p className="mt-2 text-sm text-ink-dim">Disconnect this wallet from Vellichor.</p>
        <button
          onClick={() => disconnect()}
          className="mt-4 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-wine hover:border-wine"
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
}
