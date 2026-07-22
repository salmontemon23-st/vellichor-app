import { createConfig, createConnector, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { connectorsForWallets, type Wallet } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rabbyWallet,
  coinbaseWallet,
  base,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { robinhoodChain } from "./chains";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// RainbowKit ships no bundled connector for Robinhood Wallet. Built directly
// on wagmi's public `injected()` connector and public `createConnector()`
// factory — the same browser-provider-flag detection approach and
// `walletDetails`-merging pattern RainbowKit's internal, non-exported
// `getInjectedConnector` helper uses for its own injected wallets.
const robinhoodWallet = (): Wallet => ({
  id: "robinhoodWallet",
  name: "Robinhood Wallet",
  iconUrl: "/wallets/robinhood-wallet.svg",
  iconBackground: "#221C15",
  // Mirrors RainbowKit's own internal `getInjectedConnector` helper: the
  // resulting connector must be built via wagmi's `createConnector` and have
  // `walletDetails` (which carries `rkDetails`) spread onto it, or RainbowKit's
  // UI won't recognize it as a RainbowKit connector and will silently drop it
  // from the Connect Wallet modal.
  createConnector: (walletDetails) =>
    createConnector((config) => ({
      ...injected({
        target: {
          id: "robinhoodWallet",
          name: "Robinhood Wallet",
          provider(window) {
            if (typeof window === "undefined") return undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ethereum = (window as any).ethereum;
            if (!ethereum) return undefined;
            if (ethereum.isRobinhoodWallet) return ethereum;
            return ethereum.providers?.find((p: { isRobinhoodWallet?: boolean }) => p?.isRobinhoodWallet);
          },
        },
        shimDisconnect: true,
      })(config),
      ...walletDetails,
    })),
});

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, rabbyWallet, coinbaseWallet, base, rainbowWallet, robinhoodWallet, walletConnectWallet],
    },
  ],
  {
    appName: "Vellichor",
    projectId: walletConnectProjectId,
  }
);

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors,
  transports: {
    [robinhoodChain.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
