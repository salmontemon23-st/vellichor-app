/**
 * Stub for the `@x402/*` packages.
 *
 * They're optional peer dependencies of `@coinbase/cdp-sdk`, which is itself
 * a transitive dependency of RainbowKit's `base` (Coinbase Smart Wallet)
 * connector, pulled in only for x402 payment signing — a feature Vellichor
 * never uses. `@coinbase/cdp-sdk` already loads them lazily via dynamic
 * `import()` and handles a missing module gracefully at runtime, but
 * Turbopack still needs every import specifier to resolve to build its
 * module graph. This stub satisfies that resolution without requiring the
 * real (unused) packages to be installed.
 */
export function toClientEvmSigner(): never {
  throw new Error("x402 payment signing is not supported in Vellichor.");
}
