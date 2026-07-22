import type { Metadata } from "next";
import { SettingsView } from "@/components/portfolio/SettingsView";

export const metadata: Metadata = {
  title: "Settings — Vellichor Portfolio",
};

export default function PortfolioSettingsPage() {
  return <SettingsView />;
}
