"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";

export function useWalletModal() {
  const { openConnectModal, connectModalOpen } = useConnectModal();

  return {
    open: () => openConnectModal?.(),
    isOpen: connectModalOpen,
  };
}
