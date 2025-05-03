import {
  Checkout,
  CheckoutButton,
  CheckoutStatus,
  type LifecycleStatus,
} from '@coinbase/onchainkit/checkout';
import { useCallback, useRef } from 'react';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';

async function verifyCharge(
  _url: string,
  { arg }: { arg: { chargeId: string; productId: string } },
) {
  const response = await fetch(
    `/api/commerce/verify/${arg.productId}/${arg.chargeId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    },
  );
  if (!response.ok) throw new Error('Failed to verify charge');
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
  const { trigger } = useSWRMutation('/api/commerce/verify', verifyCharge);

  const productId = isGift
    ? process.env.NEXT_PUBLIC_COINBASE_COMMERCE_PRODUCT_STARTER_KIT_GIFT
    : process.env.NEXT_PUBLIC_COINBASE_COMMERCE_PRODUCT_STARTER_KIT;

  // Add a ref to track the last processed charge status
  const processedChargeRef = useRef<{
    chargeId?: string;
    status?: string;
    lastProcessed?: number;
  }>({});

  const statusHandler = useCallback(
    async (status: LifecycleStatus) => {
      const { statusName, statusData } = status;

      try {
        if (statusName !== 'error' && statusData?.chargeId && productId) {
          // Check if we've recently processed this charge
          const now = Date.now();
          const minInterval = 2000; // 2 seconds between calls
          const lastProcessed = processedChargeRef.current.lastProcessed || 0;

          // Skip if:
          // 1. It's the same charge we just processed within minInterval
          // 2. Or if we've already seen this charge completed successfully
          if (
            (statusData.chargeId === processedChargeRef.current.chargeId &&
              now - lastProcessed < minInterval) ||
            (statusData.chargeId === processedChargeRef.current.chargeId &&
              processedChargeRef.current.status === 'success')
          ) {
            return;
          }

          // Update our tracking ref
          processedChargeRef.current = {
            chargeId: statusData.chargeId,
            status: statusName,
            lastProcessed: now,
          };

          await trigger({
            productId,
            chargeId: statusData.chargeId,
          });
        }

        switch (statusName) {
          case 'success':
            toast.success('Payment successful!');
            onSuccess?.();
            break;
          case 'pending':
            console.log('Payment pending...');
            break;
          case 'error':
            toast.error('Something went wrong');
            break;
          default:
            console.log('Payment initialized');
        }
      } catch (error) {
        console.error('Error handling charge status:', error);
      }
    },
    [trigger, onSuccess, productId],
  );

  if (!productId) {
    console.error('Product ID is not defined in environment variables');
    return null;
  }

  return (
    <div>
      <Checkout productId={productId} onStatus={statusHandler}>
        <CheckoutButton
          text={
            isGift ? 'Buy Starter Kit as Gift' : 'Buy Starter Kit for Yourself'
          }
        />
        <CheckoutStatus />
      </Checkout>
    </div>
  );
}
