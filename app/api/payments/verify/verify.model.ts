import { query } from "@/db/database-connect";

export const updateMaintenanceAsPaid = async (
  maintenance_id: string,
  razorpay_payment_id: string
): Promise<void> => {
  try {
    const queryText = `
            UPDATE member_monthly_maintenance_dues
            SET maintenance_paid = true,
                maintenance_paid_at = NOW(),
                razorpay_payment_id = $1
            WHERE id = $2
        `;

    await query(queryText, [razorpay_payment_id, maintenance_id]);
  } catch (error) {
    throw new Error(`Failed to update maintenance as paid: ${error}`);
  }
};
