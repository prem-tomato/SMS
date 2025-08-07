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

export const updateMultipleMaintenanceAsPaid = async (
  maintenance_ids: string[],
  razorpay_payment_id: string
): Promise<void> => {
  try {
    // Create placeholders for the IN clause ($1, $2, $3, etc.)
    const placeholders = maintenance_ids.map((_, index) => `$${index + 2}`).join(', ');
    
    const queryText = `
      UPDATE member_monthly_maintenance_dues
      SET maintenance_paid = true,
          maintenance_paid_at = NOW(),
          razorpay_payment_id = $1
      WHERE id IN (${placeholders})
    `;

    // First parameter is razorpay_payment_id, rest are maintenance_ids
    const queryParams = [razorpay_payment_id, ...maintenance_ids];
    
    await query(queryText, queryParams);
    
    // Log for debugging
    console.log(`Updated ${maintenance_ids.length} maintenance records as paid`);
  } catch (error) {
    throw new Error(`Failed to update multiple maintenances as paid: ${error}`);
  }
};