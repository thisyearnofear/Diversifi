import {
  Checkout,
  CheckoutButton,
  CheckoutStatus,
  type LifecycleStatus,
} from "@coinbase/onchainkit/checkout";
import { useCallback } from "react";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

async function verifyCharge(
  _url: string,
  { arg }: { arg: { chargeId: string; productId: string } }
) {
  const response = await fetch(
    `/api/commerce/verify/${arg.productId}/${arg.chargeId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  if (!response.ok) throw new Error("Failed to verify charge");
  return response.json();
}

interface StarterKitCheckoutProps {
  onSuccess?: () => void;
  isGift?: boolean;
}

export function StarterKitCheckout({
  onSuccess,
  isGift = false,
}: StarterKitCheckoutProps) {
  const { trigger } = useSWRMutation("/api/commerce/verify", verifyCharge);

  const productId = isGift
    ? process.env.NEXT_PUBLIC_COINBASE_COMMERCE_PRODUCT_STARTER_KIT_GIFT
    : process.env.NEXT_PUBLIC_COINBASE_COMMERCE_PRODUCT_STARTER_KIT;

  const statusHandler = useCallback(
    async (status: LifecycleStatus) => {
      const { statusName, statusData } = status;

      try {
        if (statusName !== "error" && statusData?.chargeId && productId) {
          await trigger({
            productId,
            chargeId: statusData.chargeId,
          });
        }

        switch (statusName) {
          case "success":
            toast.success("Payment successful!");
            onSuccess?.();
            break;
          case "pending":
            console.log("Payment pending...");
            break;
          case "error":
            toast.error("Something went wrong");
            break;
          default:
            console.log("Payment initialized");
        }
      } catch (error) {
        console.error("Error handling charge status:", error);
      }
    },
    [trigger, onSuccess, productId]
  );

  if (!productId) {
    console.error("Product ID is not defined in environment variables");
    return null;
  }

  return (
    <div>
      <Checkout
        productId={productId}
        onStatus={statusHandler}
        isSponsored={false}
      >
        <CheckoutButton
          text={
            isGift ? "Buy Starter Kit as Gift" : "Buy Starter Kit for Yourself"
          }
        />
        <CheckoutStatus />
      </Checkout>
    </div>
  );
}
