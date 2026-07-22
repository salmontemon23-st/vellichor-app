import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contract addresses — Vellichor Docs",
  description: "Vellichor smart contract deployment addresses.",
};

const CONTRACTS = [
  { contract: "VellichorVault", network: "Robinhood Chain mainnet", address: "0x78a3C6BDfc720E7095b3DD561bADA37D97c09645" },
  { contract: "VellichorMarket", network: "Robinhood Chain mainnet", address: "0x98EA3EFCba914496310DcC56F351dDe04995C395" },
  { contract: "USDG (payment token)", network: "Robinhood Chain mainnet", address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168" },
  { contract: "$VELL", network: "Robinhood Chain (via Virtuals)", address: "not yet launched" },
];

export default function ContractsPage() {
  return (
    <div>
      <span className="eyebrow">Reference</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        Contract addresses
      </h1>

      <div className="mt-8 overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-panel-2">
              <th className="px-4 py-3 font-data text-xs font-medium uppercase tracking-wide text-ink-dim">
                Contract
              </th>
              <th className="px-4 py-3 font-data text-xs font-medium uppercase tracking-wide text-ink-dim">
                Network
              </th>
              <th className="px-4 py-3 font-data text-xs font-medium uppercase tracking-wide text-ink-dim">
                Address
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {CONTRACTS.map((row, i) => (
              <tr key={i}>
                <td className="px-4 py-3 font-data text-ink">{row.contract}</td>
                <td className="px-4 py-3 text-ink-dim">{row.network}</td>
                <td className="px-4 py-3 italic text-ink-dim">{row.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-ink-dim">
        This table gets filled in as each deployment actually happens. Don&apos;t publish
        placeholder or guessed addresses here.
      </p>
    </div>
  );
}
