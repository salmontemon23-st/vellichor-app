import type { Metadata } from "next";
import { MarketListings } from "@/components/MarketListings";

export const metadata: Metadata = {
  title: "Market — Vellichor",
  description: "Buy and sell Vault Units on Robinhood Chain.",
};

export default function MarketPage() {
  return (
    <div className="container min-h-[70vh] py-16">
      <div>
        <MarketListings />
      </div>
    </div>
  );
}
