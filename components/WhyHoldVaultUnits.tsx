import Link from "next/link";

const FEATURES = [
  "Exit anytime — trade 24/7, no auction calendar.",
  "Buy at any size — priced per unit, not per bottle.",
  "Always backed — every unit tied to a bottle already in custody.",
  "Shared cost — storage and insurance split across holders, not carried alone.",
];

export function WhyHoldVaultUnits() {
  return (
    <section className="border-b border-line">
      <div className="container py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
            Why Hold Vault Units
          </h2>

          <p className="mt-3 font-display text-lg italic text-amber-deep">
            The bottle drives the value. Vellichor removes the friction.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <p key={feature} className="rounded-2xl bg-panel-2 p-5 text-sm leading-relaxed text-ink">
              {feature}
            </p>
          ))}
        </div>

        <Link
          href="/docs/why-hold-vault-units"
          className="mt-6 inline-block text-sm font-semibold text-amber-deep hover:underline"
        >
          Read more →
        </Link>

        <div className="mt-10 border-t border-line pt-6">
          <p className="max-w-2xl text-xs leading-relaxed text-ink-dim">
            This is not a promise of return. Past category performance does not guarantee future
            results, and Vault Unit prices can fall as well as rise.
          </p>
          <a
            href="/vellichor-whitepaper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-amber-deep hover:underline"
          >
            Read the full risk disclosure in the whitepaper →
          </a>
        </div>
      </div>
    </section>
  );
}
