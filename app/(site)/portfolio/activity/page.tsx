import type { Metadata } from "next";
import { ActivityView } from "@/components/portfolio/ActivityView";

export const metadata: Metadata = {
  title: "Activity — Vellichor Portfolio",
};

export default function ActivityPage() {
  return <ActivityView />;
}
