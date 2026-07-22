"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { useWalletModal } from "@/lib/wallet-modal";
import { robinhoodChain } from "@/lib/chains";

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectWalletButton({ full }: { full?: boolean }) {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { open } = useWalletModal();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!isConnected || !address) {
    return (
      <button
        onClick={open}
        className={`inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-deep ${
          full ? "w-full" : ""
        }`}
      >
        Connect Wallet
      </button>
    );
  }

  const wrongNetwork = chainId !== robinhoodChain.id;

  if (wrongNetwork) {
    return (
      <button
        onClick={() => switchChain({ chainId: robinhoodChain.id })}
        disabled={isSwitching}
        className={`inline-flex items-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60 ${
          full ? "w-full justify-center" : ""
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-white" />
        {isSwitching ? "Switching…" : "Switch to Robinhood Chain"}
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-amber font-data ${
          full ? "w-full justify-center" : ""
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        {truncate(address)}
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-panel p-2 shadow-xl z-50">
          <div className="px-3 py-2 text-xs text-ink-dim">
            <div className="font-data">{truncate(address)}</div>
            <div className="mt-0.5">Robinhood Chain</div>
          </div>
          <button
            onClick={() => {
              disconnect();
              setDropdownOpen(false);
            }}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-wine hover:bg-panel-2 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
