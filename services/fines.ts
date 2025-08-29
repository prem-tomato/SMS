import { getAccessToken } from "@/lib/auth";

export async function fetchFinesBySocietyId(societyId: string) {
  const token = getAccessToken();
  const res = await fetch(`/api/fines/${societyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch flats");
  return json.data;
}

// services/fines.ts (updated)
export interface Fine {
  id: string;
  building_name: string;
  flat_number: string;
  amount: number;
  reason: string;
  is_paid: boolean;
  paid_at?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export const createPaymentOrder = async (fineId: string, amount: number) => {
  const response = await fetch('/api/fines/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fineId, amount }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create payment order');
  }
  
  return response.json();
};

export const verifyPayment = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  fineId: string;
}) => {
  const response = await fetch('/api/fines/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });
  
  if (!response.ok) {
    throw new Error('Payment verification failed');
  }
  
  return response.json();
};
