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
                  <a
                    href="https://github.com/vellichorprotocol/vellichor-app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-on-black-dim transition-colors hover:text-ink-on-black"
                  >
                    GitHub
                  </a>
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

      </div>
    </footer>
  );
}
