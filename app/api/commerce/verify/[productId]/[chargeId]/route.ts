import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import {
  createCharge,
  getChargeById,
  updateChargeStatus,
  createStarterKit,
} from "@/lib/db/queries";
import type { CoinbaseChargeResponse } from "@/lib/types/coinbase";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ chargeId: string; productId: string }> }
) => {
  const { chargeId, productId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.COINBASE_COMMERCE_API_KEY) {
    return NextResponse.json(
      { error: "Commerce API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch charge details from Coinbase
    const response = await fetch(
      `https://api.commerce.coinbase.com/charges/${chargeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CC-Api-Key": process.env.COINBASE_COMMERCE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to verify charge with Coinbase Commerce");
    }

    const data = (await response.json()) as CoinbaseChargeResponse;

    const amount = data.pricing?.settlement?.amount || "1";
    const currency = data.pricing?.settlement?.currency || "USD";

    const latestStatus = data?.timeline?.[data.timeline.length - 1]?.status;
    const successEvent = data?.web3_data?.success_events?.[0];

    // Check if charge exists in our database
    const existingCharge = await getChargeById(chargeId);

    if (!existingCharge || existingCharge.length === 0) {
      // Create new charge if it doesn't exist
      await createCharge({
        id: chargeId,
        userId: session.user.id,
        amount,
        currency,
        product: "STARTERKIT",
      });
    }

    const successStatus = ["COMPLETED", "PENDING"];
    const status = successStatus.includes(latestStatus)
      ? "COMPLETED"
      : latestStatus;

    // If charge is completed and it's a starter kit, create it
    if (status === "COMPLETED") {
      await updateChargeStatus({
        id: chargeId,
        status,
        payerAddress: successEvent?.sender,
        transactionHash: successEvent?.tx_hash,
        confirmedAt: data.confirmed_at
          ? new Date(data.confirmed_at)
          : undefined,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      });
      const value = Number.parseInt(amount, 10);
      const isGift =
        productId ===
        process.env.NEXT_PUBLIC_COINBASE_COMMERCE_PRODUCT_STARTER_KIT_GIFT;

      await createStarterKit({
        value,
        userId: session.user.id,
        chargeId,
        claimerId: isGift ? undefined : session.user.id,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error verifying charge:", error);
    return NextResponse.json(
      { error: "Failed to verify charge" },
      { status: 500 }
    );
  }
};
