const FEATURES = [
  {
    title: "Can you exit before an auction cycle ends? Yes.",
    body: "Vault Units trade on the Market 24/7. There's no waiting on a buyer, a house's calendar, or a settlement window — you list, and it's live.",
  },
  {
    title: "Do you need the price of a full bottle? No.",
    body: "Units are priced individually, so you can hold a stake in a rare bottle at whatever size fits your budget, not the bottle's full market price.",
  },
  {
    title: "Is there a real bottle behind every unit? Always.",
    body: "Each Vault Unit is backed 1:1 by a bottle that's already authenticated and in insured custody before it's ever listed — nothing is sold ahead of the physical asset.",
  },
  {
    title: "Do you carry the storage cost alone? No.",
    body: "Insured, climate-controlled custody is shared across every holder of a bottle's units, instead of falling on one collector to arrange and pay for.",
  },
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

          <p className="mt-5 text-base leading-relaxed text-ink-dim">
            Rare whiskey and fine wine have appreciated meaningfully over the past two decades,
            driven by fixed supply and steady collector demand — that&apos;s the category,
            independent of any platform. What Vellichor changes is what it costs to access and
            exit that value.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl bg-panel-2 p-6">
              <p className="text-base font-semibold text-ink">{feature.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-dim">{feature.body}</p>
            </div>
          ))}
        </div>

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
