import type { Metadata } from "next";
import { VaultGridOnChain } from "@/components/VaultGridOnChain";

export const metadata: Metadata = {
  title: "Vault — Vellichor",
  description: "Every bottle currently held in Vellichor custody, with provenance and storage detail.",
};

export default function VaultPage() {
  return (
    <div className="container min-h-[70vh] py-16">
      <div>
        <VaultGridOnChain />
      </div>
    </div>
  );
}
