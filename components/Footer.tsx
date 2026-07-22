import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-black">
      <div className="container py-16">
        <div className="flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-1">
              <Image src="/vellichor-logo.png" alt="Vellichor" width={48} height={48} className="h-12 w-12" unoptimized />
              <span className="font-display text-lg font-normal text-ink-on-black">Vellichor</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-on-black-dim">
              Own rare whiskey and fine wine as RWAs. Vaulted, insured, and tokenized before a
              single unit is sold.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-4">
            <div>
              <p className="eyebrow mb-4">Market</p>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <Link href="/market" className="text-ink-on-black-dim transition-colors hover:text-ink-on-black">
                    Genesis Collection
                  </Link>
                </li>
                <li>
                  <Link href="/vault" className="text-ink-on-black-dim transition-colors hover:text-ink-on-black">
                    Vault
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio" className="text-ink-on-black-dim transition-colors hover:text-ink-on-black">
                    Portfolio
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow mb-4">Learn</p>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <a
                    href="/vellichor-whitepaper.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-on-black-dim transition-colors hover:text-ink-on-black"
                  >
                    Whitepaper
                  </a>
                </li>
                <li>
                  <Link href="/#how-it-works" className="text-ink-on-black-dim transition-colors hover:text-ink-on-black">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-ink-on-black-dim transition-colors hover:text-ink-on-black">
                    Docs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow mb-4">Company</p>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <Link href="/about" className="text-ink-on-black-dim transition-colors hover:text-ink-on-black">
                    About
                  </Link>
                </li>
                <li>
                  <a
                    href="https://x.com/Vellichor_hood"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-on-black-dim transition-colors hover:text-ink-on-black"
                  >
                    X / Twitter
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@vellichor.org" className="text-ink-on-black-dim transition-colors hover:text-ink-on-black">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow mb-4">Legal</p>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <Link href="/terms" className="text-ink-on-black-dim transition-colors hover:text-ink-on-black">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-ink-on-black-dim transition-colors hover:text-ink-on-black">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="text-ink-on-black-dim transition-colors hover:text-ink-on-black">
                    Compliance Notice
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line-on-black pt-8 text-xs leading-relaxed text-ink-on-black-dim">
          <p>
            Vellichor Vault Units represent a fractional beneficial interest in a specific
            physical bottle held in insured third-party custody. They are not shares, equity, or
            debt of Vellichor, and are not part of any registered securities offering — depending
            on jurisdiction, they may nonetheless be treated as securities.
          </p>
          <p>
            Redemption for the physical bottle requires identity verification and is subject to
            local alcohol import and export regulations. Redemption may not be available in all
            regions.
          </p>
          <p>
            Vellichor is an independent protocol and is not affiliated with, endorsed by, or a
            product of Robinhood Markets, Inc.
          </p>
          <p>
            Smart contracts, custody arrangements, and market prices all carry risk, including
            the risk of loss. Nothing on this site is investment, legal, or tax advice.
          </p>
        </div>

        <div className="mt-6 border-t border-line-on-black pt-6">
          <p className="font-data text-xs tracking-wide text-ink-on-black-dim">© 2026 Vellichor · vellichor.xyz</p>
        </div>
      </div>
    </footer>
  );
}
