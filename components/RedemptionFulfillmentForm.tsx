"use client";

import { useState, type FormEvent } from "react";
import type { RedemptionFulfillment } from "@/lib/redemption-types";

/**
 * The off-chain redemption fulfillment form (spec Part 2, Step 5). Opened
 * immediately after requestRedemption() confirms on-chain, and reopenable
 * at any later time from Portfolio's "Pending Redemption" section — always
 * prefilled from `existing`, since this cannot be a one-time modal per the
 * spec's persistence requirement.
 *
 * None of this data is ever sent to a smart contract or written on-chain.
 */
export function RedemptionFulfillmentForm({
  wallet,
  bottleId,
  bottleName,
  existing,
  onClose,
  onSubmitted,
}: {
  wallet: string;
  bottleId: string;
  bottleName: string;
  existing: RedemptionFulfillment | null;
  onClose: () => void;
  onSubmitted: (record: RedemptionFulfillment) => void;
}) {
  const [fullName, setFullName] = useState(existing?.fullName ?? "");
  const [addressLine1, setAddressLine1] = useState(existing?.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(existing?.addressLine2 ?? "");
  const [city, setCity] = useState(existing?.city ?? "");
  const [region, setRegion] = useState(existing?.region ?? "");
  const [postalCode, setPostalCode] = useState(existing?.postalCode ?? "");
  const [country, setCountry] = useState(existing?.country ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [idDocumentName, setIdDocumentName] = useState(existing?.idDocumentName ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/redemptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          bottleId,
          fullName,
          addressLine1,
          addressLine2,
          city,
          region,
          postalCode,
          country,
          email,
          phone,
          idDocumentName,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to submit details");
      }
      const { redemption } = await res.json();
      onSubmitted(redemption);
      setIsDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit details");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-8">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <h2 className="font-display text-lg font-normal text-ink">Complete redemption for {bottleName}</h2>
        <p className="mt-2 text-sm text-ink-dim">
          Your units are already redeemed on-chain. Before your bottle can ship we still need
          shipping and identity verification details — this data is stored off-chain in
          Vellichor&apos;s own systems and is never written to the blockchain.
        </p>

        {isDone ? (
          <div className="mt-4 text-center">
            <p className="font-display text-base font-normal text-ink">Details submitted</p>
            <p className="mt-2 text-sm text-ink-dim">
              Vellichor will verify your details before your bottle ships. You can reopen this
              form any time from Portfolio to review or update it.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <input
              required
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
            />
            <input
              required
              placeholder="Address line 1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
            />
            <input
              placeholder="Address line 2 (optional)"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
              />
              <input
                required
                placeholder="State / region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="Postal code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
              />
              <input
                required
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
              />
            </div>
            <input
              required
              type="email"
              placeholder="Contact email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
            />
            <input
              required
              placeholder="Contact phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
            />
            <label className="text-xs text-ink-dim">
              Identity verification document (required for alcohol shipping compliance)
              <input
                required={!idDocumentName}
                type="file"
                onChange={(e) => setIdDocumentName(e.target.files?.[0]?.name ?? "")}
                className="mt-1 block w-full text-sm text-ink-dim"
              />
              {idDocumentName && <span className="mt-1 block text-ink">Selected: {idDocumentName}</span>}
            </label>

            {error && <p className="text-sm text-wine">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : existing && existing.status !== "pending_info" ? "Update details" : "Submit details"}
            </button>
          </form>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:border-amber"
        >
          {isDone ? "Close" : "Cancel — finish later"}
        </button>
      </div>
    </div>
  );
}
