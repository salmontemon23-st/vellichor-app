"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  PAYMENT_TOKEN_DECIMALS,
  PAYMENT_TOKEN_SYMBOL,
  contractsConfigured,
} from "@/lib/contracts";

type AttributeRow = { trait_type: string; value: string };

// Owner-only mint UI — uploads the bottle photo + metadata to IPFS (server
// route, so the Pinata key never reaches the browser), then calls
// VellichorVault.listBottle() directly as a real transaction on Robinhood
// Chain mainnet. Hidden unless the connected wallet matches the deployed
// Vault's owner() address.
export function ListBottleForm() {
  const { address, isConnected } = useAccount();

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

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: owner } = useReadContract({
    address: VELLICHOR_VAULT_ADDRESS,
    abi: VELLICHOR_VAULT_ABI,
    functionName: "owner",
    query: { enabled: contractsConfigured },
  });

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isOwner =
    contractsConfigured &&
    isConnected &&
    !!owner &&
    !!address &&
    (owner as string).toLowerCase() === address.toLowerCase();

  if (!isOwner) return null;

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function updateExtraAttribute(index: number, field: keyof AttributeRow, value: string) {
    setExtraAttributes((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function removeExtraAttribute(index: number) {
    setExtraAttributes((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
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

      reset();
      writeContract({
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

  const busy = isUploading || isPending || isConfirming;

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-10 rounded-2xl border border-dashed border-amber/50 bg-panel p-6"
    >
      <p className="eyebrow">Vault Owner — Mint New Bottle</p>
      <p className="mt-1 text-sm text-ink-dim">
        Uploads the photo and metadata to IPFS, then calls listBottle() as a real transaction on
        Robinhood Chain. Confirm bottle photo usage rights are cleared before listing anything
        here — nothing about this form checks that.
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
                  onChange={(e) => updateExtraAttribute(i, "trait_type", e.target.value)}
                  className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
                />
                <input
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => updateExtraAttribute(i, "value", e.target.value)}
                  className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink"
                />
                <button
                  type="button"
                  onClick={() => removeExtraAttribute(i)}
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
        type="submit"
        disabled={busy}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-60"
      >
        {isUploading
          ? "Uploading to IPFS…"
          : isPending
            ? "Confirm in wallet…"
            : isConfirming
              ? "Minting…"
              : "Upload & Mint Bottle On-Chain"}
      </button>

      {isSuccess && <p className="mt-3 text-sm text-amber-deep">Bottle minted. Tx: {hash}</p>}
      {uploadError && <p className="mt-3 text-sm text-wine">{uploadError}</p>}
      {error && <p className="mt-3 text-sm text-wine">{error.message}</p>}
    </form>
  );
}
