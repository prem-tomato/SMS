import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { RazorPayConfig } from "../../socities/socities.types";

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
    const placeholders = maintenance_ids
      .map((_, index) => `$${index + 2}`)
      .join(", ");

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
    console.log(
      `Updated ${maintenance_ids.length} maintenance records as paid`
    );
  } catch (error) {
    throw new Error(`Failed to update multiple maintenances as paid: ${error}`);
  }
};

export const savePaymentDetailsToDB = async (details: any) => {
  const queryText = `
    INSERT INTO razorpay_payments (
      razorpay_payment_id,
      razorpay_order_id,
      bank_rrn,
      invoice_id,
      method,
      payer_upi_id,
      payer_account_type,
      customer_contact,
      customer_email,
      total_fee,
      razorpay_fee,
      gst,
      description,
      maintenance_ids,
      raw_payload
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13,
      $14, $15
    )
  `;

  const values = [
    details.razorpay_payment_id,
    details.razorpay_order_id,
    details.bank_rrn,
    details.invoice_id,
    details.method,
    details.payer_upi_id,
    details.payer_account_type,
    details.customer_contact,
    details.customer_email,
    details.total_fee,
    details.razorpay_fee,
    details.gst,
    details.description,
    details.maintenance_ids,
    details.raw_payload,
  ];

  await query(queryText, values);
};

export const getRazorPayConfigBySocietyId = async (
  societyId: string
): Promise<RazorPayConfig | null> => {
  try {
    const queryText = `
      SELECT *
      FROM society_razorpay_config
      WHERE society_id = $1 AND is_deleted = false
      `;

    const result: QueryResult = await query(queryText, [societyId]);

    return result.rows[0];
  } catch (error) {
    throw new Error(`Error in getRazorPayConfigBySocietyId: ${error}`);
  }
};
