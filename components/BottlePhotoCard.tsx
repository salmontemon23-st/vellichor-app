import Link from "next/link";
import type { ReactNode } from "react";
import { BottleGauge } from "./BottleGauge";

export function BottlePhotoCard({
  href,
  imageUrl,
  fallbackPercent,
  name,
  subtitle,
  priceLabel,
  percentClaimed,
  badge,
  buyNow,
}: {
  href: string;
  imageUrl?: string;
  fallbackPercent: number;
  name: string;
  subtitle?: string;
  priceLabel: string;
  percentClaimed: number;
  badge: ReactNode;
  /** Omit (or pass null) when there's nothing to buy — renders a single full-width "View Details" instead. */
  buyNow?: { onClick: () => void } | null;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-panel">
      <Link href={href} className="block">
        <div className="relative flex h-64 items-center justify-center bg-panel p-6 sm:h-72">
          <div className="absolute left-3 top-3 z-10">{badge}</div>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} className="h-full w-full object-contain" />
          ) : (
            <BottleGauge percent={fallbackPercent} height={180} />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <Link href={href}>
            <h3 className="font-display text-lg font-normal leading-snug text-ink transition-colors group-hover:text-amber-deep">
              {name}
            </h3>
          </Link>
          {subtitle && <p className="mt-1 text-xs text-ink-dim">{subtitle}</p>}
        </div>

        <div>
          <p className="font-data text-base font-semibold text-ink">{priceLabel}</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-panel-2">
            <div className="h-full rounded-full bg-amber" style={{ width: `${percentClaimed}%` }} />
          </div>
          <p className="mt-1 font-data text-xs text-ink-dim">{percentClaimed}% claimed</p>
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          {buyNow ? (
            <>
              <button
                onClick={buyNow.onClick}
                className="flex-1 rounded-full bg-amber px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-deep"
              >
                Buy Now
              </button>
              <Link
                href={href}
                className="flex-1 rounded-full border border-line px-4 py-2 text-center text-sm font-medium text-ink transition-colors hover:border-amber"
              >
                View Details
              </Link>
            </>
          ) : (
            <Link
              href={href}
              className="w-full rounded-full border border-line px-4 py-2 text-center text-sm font-medium text-ink transition-colors hover:border-amber"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
