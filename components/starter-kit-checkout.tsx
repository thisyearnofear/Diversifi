import {
  Checkout,
  CheckoutButton,
  CheckoutStatus,
  type LifecycleStatus,
} from "@coinbase/onchainkit/checkout";
import { useCallback } from "react";
import useSWRMutation from "swr/mutation";

async function verifyCharge(_url: string, { arg }: { arg: string }) {
  const response = await fetch(`/api/commerce/verify/${arg}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
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

  const statusHandler = useCallback(
    async (status: LifecycleStatus) => {
      const { statusName, statusData } = status;

      try {
        if (statusData?.chargeId) {
          const data = await trigger(statusData.chargeId);

          switch (statusName) {
            case "success":
              console.log("Payment successful!", data);
              onSuccess?.();
              break;
            case "pending":
              console.log("Payment pending...", data);
              break;
            case "error":
              console.error("Payment failed:", data);
              break;
            default:
              console.log("Payment initialized", data);
          }
        }
      } catch (error) {
        console.error("Error handling charge status:", error);
      }
    },
    [trigger, onSuccess]
  );

  return (
    <Checkout
      productId={
        isGift
          ? process.env.NEXT_PUBLIC_COINBASE_COMMERCE_PRODUCT_STARTER_KIT_GIFT
          : process.env.NEXT_PUBLIC_COINBASE_COMMERCE_PRODUCT_STARTER_KIT
      }
      onStatus={statusHandler}
    >
      <CheckoutButton
        text={
          isGift ? "Buy Starter Kit as Gift" : "Buy Starter Kit for Yourself"
        }
      />
      <CheckoutStatus />
    </Checkout>
  );
}
