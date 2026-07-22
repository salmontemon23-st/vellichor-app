import type { Metadata } from "next";
import { PortfolioSidebar } from "@/components/PortfolioSidebar";

export const metadata: Metadata = {
  title: "Portfolio — Vellichor",
  description: "Your Vault Unit holdings, redemption progress, and transaction history.",
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container min-h-[70vh] py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr] lg:items-stretch">
        <PortfolioSidebar />
        <div className="flex min-h-[560px] min-w-0 flex-col justify-center">{children}</div>
      </div>
    </div>
  );
}
