import type { Metadata } from "next";
import { ListingsView } from "@/components/portfolio/ListingsView";

export const metadata: Metadata = {
  title: "Listings — Vellichor Portfolio",
};

export default function ListingsPage() {
  return <ListingsView />;
}
