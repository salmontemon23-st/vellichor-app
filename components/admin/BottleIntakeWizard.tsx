"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, zeroHash, type Hex } from "viem";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  VELLICHOR_AUTHENTICITY_REGISTRY_ABI,
  VELLICHOR_AUTHENTICITY_REGISTRY_ADDRESS,
  VELLICHOR_ENVIRONMENTAL_ORACLE_ABI,
  VELLICHOR_ENVIRONMENTAL_ORACLE_ADDRESS,
  PAYMENT_TOKEN_DECIMALS,
  PAYMENT_TOKEN_SYMBOL,
  verificationConfigured,
} from "@/lib/contracts";

type AttributeRow = { trait_type: string; value: string };
type Step = 1 | 2 | 3;

const STEP_LABELS: { n: Step; label: string }[] = [
  { n: 1, label: "Details" },
  { n: 2, label: "Authentication" },
  { n: 3, label: "Mint" },
];

function StepIndicator({ current }: { current: Step }) {
  return (
    <ol className="flex items-center gap-2">
      {STEP_LABELS.map((s, i) => (
        <li key={s.n} className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full font-data text-xs font-semibold ${
              s.n === current
                ? "bg-amber text-white"
                : s.n < current
                  ? "bg-amber/15 text-amber-deep"
                  : "bg-panel-2 text-ink-dim"
            }`}
          >
            {s.n < current ? "✓" : s.n}
          </span>
          <span className={`text-sm ${s.n === current ? "font-semibold text-ink" : "text-ink-dim"}`}>
            {s.label}
          </span>
          {i < STEP_LABELS.length - 1 && <span className="mx-1 h-px w-8 bg-line" />}
        </li>
      ))}
    </ol>
  );
}

export function BottleIntakeWizard() {
  const [step, setStep] = useState<Step>(1);

  // Step 1 — bottle details, staged locally, no on-chain call yet.
  const [name, setName] = useState("");
  const [totalUnits, setTotalUnits] = useState("100");
  const [pricePerUnit, setPricePerUnit] = useState("100");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [abv, setAbv] = useState("");
  const [extraAttributes, setExtraAttributes] = useState<AttributeRow[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // The draft bottleId — read once, when the admin advances past Step 1. This is the
  // ID VellichorVault.listBottle() will assign next; using it now for attestation is
  // what lines the two contracts up (see VERIFICATION_STATUS.md for the coordination
  // this depends on and its limits).
  const [draftBottleId, setDraftBottleId] = useState<bigint | null>(null);
  const { refetch: refetchNextId } = useReadContract({
    address: VELLICHOR_VAULT_ADDRESS,
    abi: VELLICHOR_VAULT_ABI,
    functionName: "nextBottleId",
    query: { enabled: false },
  });

  async function goToStep2() {
    const { data } = await refetchNextId();
    setDraftBottleId((data as bigint) ?? null);
    setStep(2);
  }

  // Step 2 — authentication.
  const [certificateURI, setCertificateURI] = useState("");
  const [physicalTagHashInput, setPhysicalTagHashInput] = useState("");
  const [notes, setNotes] = useState("");

  const {
    writeContract: writeAttestation,
    data: attestHash,
    isPending: attestPending,
    error: attestError,
  } = useWriteContract();
  const { isLoading: attestConfirming, isSuccess: attestConfirmed } = useWaitForTransactionReceipt({
    hash: attestHash,
  });

  const { data: isAttestedOnChain, refetch: refetchIsAttested } = useReadContract({
    address: VELLICHOR_AUTHENTICITY_REGISTRY_ADDRESS,
    abi: VELLICHOR_AUTHENTICITY_REGISTRY_ABI,
    functionName: "isAttested",
    args: draftBottleId !== null ? [draftBottleId] : undefined,
    query: { enabled: verificationConfigured && draftBottleId !== null },
  });

  function submitAttestation(e: FormEvent) {
    e.preventDefault();
    if (draftBottleId === null) return;
    const tagHash: Hex = physicalTagHashInput.trim()
      ? (physicalTagHashInput.trim() as Hex)
      : zeroHash;
    writeAttestation({
      address: VELLICHOR_AUTHENTICITY_REGISTRY_ADDRESS!,
      abi: VELLICHOR_AUTHENTICITY_REGISTRY_ABI,
      functionName: "recordAttestation",
      args: [draftBottleId, certificateURI, tagHash, notes],
    });
  }

  // Step 2b (optional) — environmental baseline reading.
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [envNotes, setEnvNotes] = useState("");
  const {
    writeContract: writeReading,
    data: readingHash,
    isPending: readingPending,
  } = useWriteContract();
  const { isLoading: readingConfirming, isSuccess: readingConfirmed } = useWaitForTransactionReceipt({
    hash: readingHash,
  });

  function submitReading(e: FormEvent) {
    e.preventDefault();
    if (draftBottleId === null || !temperature || !humidity) return;
    writeReading({
      address: VELLICHOR_ENVIRONMENTAL_ORACLE_ADDRESS!,
      abi: VELLICHOR_ENVIRONMENTAL_ORACLE_ABI,
      functionName: "recordReading",
      args: [draftBottleId, Math.round(Number(temperature) * 10), Number(humidity), envNotes],
    });
  }

  // Step 3 — mint / list.
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { writeContract: writeMint, data: mintHash, isPending: mintPending, error: mintError, reset: resetMint } =
    useWriteContract();
  const { isLoading: mintConfirming, isSuccess: mintConfirmed } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleMint(e: FormEvent) {
    e.preventDefault();
    setUploadError(null);
    if (!imageFile) {
      setUploadError("A bottle photo is required.");
      return;
    }
    const attributes: AttributeRow[] = [
      category.trim() && { trait_type: "Category", value: category.trim() },
      size.trim() && { trait_type: "Size", value: size.trim() },
      abv.trim() && { trait_type: "ABV", value: abv.trim() },
      ...extraAttributes,
    ].filter((a): a is AttributeRow => !!a && !!a.trait_type.trim() && !!a.value.trim());

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("image", imageFile);
      form.append("name", name);
      form.append("description", description);
      form.append("attributes", JSON.stringify(attributes));

      const res = await fetch("/api/upload-bottle-metadata", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed.");

      resetMint();
      writeMint({
        address: VELLICHOR_VAULT_ADDRESS!,
        abi: VELLICHOR_VAULT_ABI,
        functionName: "listBottle",
        args: [name, BigInt(totalUnits || "0"), parseUnits(pricePerUnit || "0", PAYMENT_TOKEN_DECIMALS), json.metadataURI],
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  const attested = attestConfirmed || !!isAttestedOnChain;
  const mintBusy = isUploading || mintPending || mintConfirming;

  return (
    <div className="mx-auto max-w-2xl">
      <StepIndicator current={step} />

      {/* STEP 1 — DETAILS */}
      {step === 1 && (
        <div className="mt-8 rounded-2xl border border-line bg-panel p-6">
          <p className="eyebrow">Step 1 — Bottle details</p>
          <p className="mt-1 text-sm text-ink-dim">
            Staged locally — nothing is submitted on-chain at this step.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Bottle name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
            />
            <input
              required
              type="number"
              min="1"
              placeholder="Total units"
              value={totalUnits}
              onChange={(e) => setTotalUnits(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink font-data"
            />
            <input
              required
              type="number"
              min="0"
              step="0.0001"
              placeholder={`Price per unit (${PAYMENT_TOKEN_SYMBOL})`}
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink font-data sm:col-span-2"
            />
          </div>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
          />

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input
              placeholder="Category (e.g. Bourbon)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
            />
            <input
              placeholder="Size (e.g. 750 ml)"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
            />
            <input
              placeholder="ABV (e.g. 45%)"
              value={abv}
              onChange={(e) => setAbv(e.target.value)}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-ink-dim">Additional attributes</p>
              <button
                type="button"
                onClick={() => setExtraAttributes((rows) => [...rows, { trait_type: "", value: "" }])}
                className="text-xs font-medium text-amber-deep hover:underline"
              >
                + Add attribute
              </button>
            </div>
            {extraAttributes.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {extraAttributes.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      placeholder="Name (e.g. Producer)"
                      value={row.trait_type}
                      onChange={(e) =>
                        setExtraAttributes((rows) =>
                          rows.map((r, idx) => (idx === i ? { ...r, trait_type: e.target.value } : r))
                        )
                      }
                      className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
                    />
                    <input
                      placeholder="Value"
                      value={row.value}
                      onChange={(e) =>
                        setExtraAttributes((rows) =>
                          rows.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r))
                        )
                      }
                      className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
                    />
                    <button
                      type="button"
                      onClick={() => setExtraAttributes((rows) => rows.filter((_, idx) => idx !== i))}
                      aria-label="Remove attribute"
                      className="rounded-lg border border-line px-3 text-sm text-ink-dim hover:border-wine hover:text-wine"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-ink-dim">Bottle photo</p>
            <div className="mt-2 flex items-center gap-4">
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="" className="h-20 w-20 rounded-lg object-cover" />
              )}
              <input
                required
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-ink-dim file:mr-3 file:rounded-full file:border-0 file:bg-panel-2 file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-line"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!name || !imageFile}
            onClick={goToStep2}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-40"
          >
            Next: Authentication →
          </button>
        </div>
      )}

      {/* STEP 2 — AUTHENTICATION */}
      {step === 2 && (
        <div className="mt-8 rounded-2xl border border-line bg-panel p-6">
          <p className="eyebrow">Step 2 — Authentication</p>
          <p className="mt-1 text-sm text-ink-dim">
            Draft bottleId: <span className="font-data text-ink">{draftBottleId?.toString() ?? "—"}</span>. Required
            before minting can proceed.
          </p>

          {!verificationConfigured ? (
            <p className="mt-4 rounded-lg border border-dashed border-line p-4 text-sm text-ink-dim">
              VellichorAuthenticityRegistry is not deployed yet — set
              NEXT_PUBLIC_AUTHENTICITY_REGISTRY_ADDRESS to enable this step.
            </p>
          ) : (
            <form onSubmit={submitAttestation} className="mt-4 flex flex-col gap-3">
              <input
                required
                placeholder="Certificate URI (ipfs://…)"
                value={certificateURI}
                onChange={(e) => setCertificateURI(e.target.value)}
                className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
              />
              <input
                placeholder="Physical tag hash (optional — no hardware yet)"
                value={physicalTagHashInput}
                onChange={(e) => setPhysicalTagHashInput(e.target.value)}
                className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink font-data"
              />
              <textarea
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
              />
              <button
                type="submit"
                disabled={attestPending || attestConfirming || attested}
                className="inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-60"
              >
                {attested
                  ? "Attestation confirmed ✓"
                  : attestPending
                    ? "Confirm in wallet…"
                    : attestConfirming
                      ? "Recording attestation…"
                      : "Record Attestation"}
              </button>
              {attestError && <p className="text-sm text-wine">{attestError.message}</p>}
            </form>
          )}

          {/* Step 2b — optional environmental baseline */}
          {verificationConfigured && (
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-xs font-medium text-ink-dim">
                Optional — baseline environmental reading
              </p>
              <form onSubmit={submitReading} className="mt-3 grid gap-3 sm:grid-cols-3">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Temp °C"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink font-data"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Humidity %"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink font-data"
                />
                <input
                  placeholder="Notes"
                  value={envNotes}
                  onChange={(e) => setEnvNotes(e.target.value)}
                  className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
                />
                <button
                  type="submit"
                  disabled={readingPending || readingConfirming || !temperature || !humidity}
                  className="inline-flex items-center justify-center rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-amber disabled:opacity-60 sm:col-span-3"
                >
                  {readingConfirmed
                    ? "Baseline recorded ✓"
                    : readingPending || readingConfirming
                      ? "Recording…"
                      : "Record Baseline Reading"}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
            <button type="button" onClick={() => setStep(1)} className="text-sm text-ink-dim hover:text-ink">
              ← Back
            </button>
            <div title={attested ? undefined : "Complete authentication first"}>
              <button
                type="button"
                disabled={!attested}
                onClick={() => {
                  refetchIsAttested();
                  setStep(3);
                }}
                className="inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next: Mint →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 — MINT */}
      {step === 3 && (
        <div className="mt-8 rounded-2xl border border-line bg-panel p-6">
          <p className="eyebrow">Step 3 — Mint / list</p>
          <p className="mt-1 text-sm text-ink-dim">
            {name} — {totalUnits} units @ {pricePerUnit} {PAYMENT_TOKEN_SYMBOL}/unit. Attestation confirmed for
            bottleId {draftBottleId?.toString()}.
          </p>

          <form onSubmit={handleMint} className="mt-4">
            <div title={attested ? undefined : "Complete authentication first"}>
              <button
                type="submit"
                disabled={mintBusy || !attested}
                className="inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {!attested
                  ? "Complete authentication first"
                  : isUploading
                    ? "Uploading to IPFS…"
                    : mintPending
                      ? "Confirm in wallet…"
                      : mintConfirming
                        ? "Minting…"
                        : "List Bottle On-Chain"}
              </button>
            </div>
            {mintConfirmed && <p className="mt-3 text-sm text-amber-deep">Bottle minted. Tx: {mintHash}</p>}
            {uploadError && <p className="mt-3 text-sm text-wine">{uploadError}</p>}
            {mintError && <p className="mt-3 text-sm text-wine">{mintError.message}</p>}
          </form>

          <button type="button" onClick={() => setStep(2)} className="mt-5 text-sm text-ink-dim hover:text-ink">
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
