import type { NextConfig } from "next";

// `@x402/*` are optional peer dependencies of `@coinbase/cdp-sdk`, pulled in
// transitively by RainbowKit's `base` (Coinbase Smart Wallet) connector for
// an x402 payment-signing feature Vellichor doesn't use. See lib/x402-stub.ts.
const x402Stub = "./lib/x402-stub.ts";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@x402/core/client": x402Stub,
      "@x402/evm": x402Stub,
      "@x402/evm/exact/client": x402Stub,
      "@x402/evm/upto/client": x402Stub,
      "@x402/svm/exact/client": x402Stub,
    },
  },
};

export default nextConfig;
