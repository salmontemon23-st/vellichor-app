import { NextRequest, NextResponse } from "next/server";
import { createPendingRedemption, listRedemptionsByWallet, submitRedemptionDetails } from "@/lib/redemption-store";

// GET /api/redemptions?wallet=0x... — scoped strictly to the requesting
// wallet's own records. Never returns another wallet's shipping/ID data.
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "wallet query param required" }, { status: 400 });
  }
  return NextResponse.json({ redemptions: listRedemptionsByWallet(wallet) });
}

// POST { wallet, bottleId, txHash } — called immediately after
// requestRedemption() confirms on-chain, to open a pending fulfillment
// record. Idempotent, see createPendingRedemption().
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const wallet = body?.wallet;
  const bottleId = body?.bottleId;
  if (!wallet || !bottleId) {
    return NextResponse.json({ error: "wallet and bottleId are required" }, { status: 400 });
  }
  const record = createPendingRedemption(wallet, String(bottleId), body?.txHash ?? null);
  return NextResponse.json({ redemption: record });
}

// PATCH { wallet, bottleId, ...RedemptionFormFields } — submits/updates the
// shipping + contact + ID details for an existing pending record.
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const wallet = body?.wallet;
  const bottleId = body?.bottleId;
  if (!wallet || !bottleId) {
    return NextResponse.json({ error: "wallet and bottleId are required" }, { status: 400 });
  }
  const { wallet: _wallet, bottleId: _bottleId, ...fields } = body;
  const record = submitRedemptionDetails(wallet, String(bottleId), fields);
  if (!record) {
    return NextResponse.json(
      { error: "no pending redemption found for this wallet + bottle" },
      { status: 404 }
    );
  }
  return NextResponse.json({ redemption: record });
}
