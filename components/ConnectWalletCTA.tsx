"use client";

import { useAccount } from "wagmi";
import { useWalletModal } from "@/lib/wallet-modal";
import Link from "next/link";

export function ConnectWalletCTA() {
  const { isConnected } = useAccount();
  const { open } = useWalletModal();

  if (isConnected) {
    return (
      <Link
        href="/portfolio"
        className="inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-amber"
      >
        View Portfolio
      </Link>
    );
  }

  return (
    <button
      onClick={open}
      className="inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-amber"
    >
      Connect Wallet
    </button>
  );
}
