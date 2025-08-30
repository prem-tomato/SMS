// hooks/useRazorpay.ts
import { loadRazorpayScript } from "@/lib/loadRazorpay";
import { createPaymentOrder, verifyPayment } from "@/services/fines";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  fineId: string;
  amount: number;
  reason: string;
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
  society_id: string;
  society_type: string;
}

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);

  const initiatePayment = async (options: PaymentOptions) => {
    try {
      setIsLoading(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay script");
      }

      // Create order
      const orderData = await createPaymentOrder(
        options.fineId,
        options.amount,
        options.society_id
      );
      console.log('orderData', orderData);

      const razorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Society Management",
        description: `Fine Payment - ${options.reason}`,
        order_id: orderData.orderId,
        theme: {
          color: "#3f51b5",
        },
        handler: async (response: any) => {
          console.log('response', response);
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              fineId: options.fineId,
              society_id: options.society_id,
              society_type: options.society_type,
            });

            options.onSuccess?.();
          } catch (error) {
            console.error("Payment verification failed:", error);
            options.onFailure?.(error);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      options.onFailure?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiatePayment,
    isLoading,
  };
};
