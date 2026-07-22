import Link from "next/link";
import Image from "next/image";

export function DocsHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="container flex h-16 items-center">
        <Link href="/docs" className="flex items-center gap-1">
          <Image src="/vellichor-logo.png" alt="Vellichor" width={48} height={48} className="h-12 w-12" unoptimized />
          <span className="font-display text-lg font-normal tracking-tight text-ink">
            Docs
          </span>
        </Link>
      </div>
    </header>
  );
}
