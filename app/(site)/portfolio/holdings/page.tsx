import type { Metadata } from "next";
import { HoldingsView } from "@/components/portfolio/HoldingsView";

export const metadata: Metadata = {
  title: "Holdings — Vellichor Portfolio",
};

export default function HoldingsPage() {
  return <HoldingsView />;
}
