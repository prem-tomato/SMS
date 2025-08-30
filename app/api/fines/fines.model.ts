import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { Fines, HousingFines } from "./fines.types";

export const getFinesList = async (societyId: string): Promise<Fines[]> => {
  try {
    const queryText = `
          SELECT 
            fp.id,
            fp.society_id,
            fp.building_id,
            fp.flat_id,
            fp.amount,
            fp.reason,
            fp.is_paid,
            fp.paid_at,
            b.name       AS building_name,
            f.flat_number AS flat_number,
            s.name       AS society_name
        FROM flat_penalties fp
        LEFT JOIN societies s 
            ON fp.society_id = s.id
        LEFT JOIN buildings b 
            ON fp.building_id = b.id
        LEFT JOIN flats f 
            ON fp.flat_id = f.id
        WHERE fp.society_id = $1
        AND fp.is_deleted = false
        ORDER BY fp.paid_at DESC NULLS LAST, fp.id DESC;

        `;

    const res: QueryResult<Fines> = await query<Fines>(queryText, [societyId]);

    return res.rows;
  } catch (error: any) {
    throw new Error(`Error in getFinesList: ${error}`);
  }
};

export const updateFinePaymentStatusForUnitPenalties = async (
  fineId: string,
  isPaid: boolean,
  paidAt: Date,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  paymentMethod: string
) => {
  try {
    const queryText = `
      UPDATE unit_penalties
      SET is_paid = $1,
          paid_at = $2,
          razorpay_order_id = $3,
          razorpay_payment_id = $4,
          razorpay_signature = $5,
          payment_method = $6
      WHERE id = $7
      AND is_deleted = false
    `;

    await query(queryText, [
      isPaid,
      paidAt,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
      fineId,
    ]);
  } catch (error: any) {
    throw new Error(
      `Error in updateFinePaymentStatusForUnitPenalties: ${error}`
    );
  }
};

export const updateFinePaymentStatus = async (
  fineId: string,
  isPaid: boolean,
  paidAt: Date,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  paymentMethod: string
) => {
  try {
    const queryText = `
      UPDATE flat_penalties
      SET is_paid = $1,
          paid_at = $2,
          razorpay_order_id = $3,
          razorpay_payment_id = $4,
          razorpay_signature = $5,
          payment_method = $6
      WHERE id = $7
      AND is_deleted = false
    `;

    await query(queryText, [
      isPaid,
      paidAt,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
      fineId,
    ]);
  } catch (error: any) {
    throw new Error(`Error in updateFinePaymentStatus: ${error}`);
  }
};

export const getHousingFinesList = async (
  societyId: string
): Promise<HousingFines[]> => {
  try {
    const queryText = `
          SELECT 
            fp.id,
            fp.society_id,
            fp.unit_id,
            fp.amount,
            fp.reason,
            fp.is_paid,
            fp.paid_at,
            s.name       AS society_name,
            h.unit_number
        FROM unit_penalties fp
        LEFT JOIN societies s 
            ON fp.society_id = s.id
        LEFT JOIN housing_units h 
            ON fp.unit_id = h.id
        WHERE fp.society_id = $1
        AND fp.is_deleted = false
        ORDER BY fp.paid_at DESC NULLS LAST, fp.id DESC;
        `;

    const res: QueryResult<HousingFines> = await query<HousingFines>(
      queryText,
      [societyId]
    );

    return res.rows;
  } catch (error: any) {
    throw new Error(`Error in getHousingFinesList: ${error}`);
  }
};
