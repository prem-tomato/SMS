import { query } from "@/db/database-connect";
import { GetMemberMaintenance } from "./member-maintenances.types";

// export const listMemberMaintenances = async (
//   societyId: string,
//   monthYear: string
// ): Promise<GetMemberMaintenance[]> => {
//   try {
//     const queryText = `
//         SELECT
//           mmmd.*,
//           s.name as society_name,
//           json_agg(
//             concat(u.first_name, ' ', u.last_name)
//           ) as member_names,
//           b.name as building_name,
//           f.flat_number,
//           hu.unit_number as housing_unit_number,
//           json_agg(
//             u.id
//           ) as user_ids
//         FROM
//           member_monthly_maintenance_dues mmmd
//           LEFT JOIN societies s ON mmmd.society_id = s.id
//           LEFT JOIN members m ON m.id = ANY(mmmd.member_ids)
//           LEFT JOIN users u ON u.id = m.user_id
//           LEFT JOIN buildings b ON b.id = m.building_id
//           LEFT JOIN flats f ON f.id = m.flat_id
//           LEFT JOIN housing_units hu ON hu.id = m.housing_id
//         WHERE
//           mmmd.society_id = $1
//           AND mmmd.month_year = $2
//         GROUP BY
//           mmmd.id, s.name, b.name, f.flat_number, hu.unit_number;
//     `;

//     const { rows } = await query<GetMemberMaintenance>(queryText, [
//       societyId,
//       monthYear,
//     ]);

//     return rows;
//   } catch (error) {
//     throw new Error(`Error in listMemberMaintenances ${error}`);
//   }
// };

// export const listMemberMaintenances = async (
//   societyId: string,
//   monthYear: string
// ): Promise<GetMemberMaintenance[]> => {
//   try {
//     const queryText = `
//         SELECT
//           mmmd.*,
//           s.name as society_name,
//           json_agg(
//             concat(u.first_name, ' ', u.last_name)
//           ) as member_names,
//           b.name as building_name,
//           f.flat_number,
//           hu.unit_number as housing_unit_number,
//           json_agg(
//             u.id
//           ) as user_ids,
//           -- Razorpay payment details
//           rp.razorpay_payment_id as razorpay_payment_id_full,
//           rp.razorpay_order_id,
//           rp.bank_rrn,
//           rp.invoice_id,
//           rp.method as payment_method,
//           rp.payer_upi_id,
//           rp.payer_account_type,
//           rp.customer_contact,
//           rp.customer_email,
//           rp.total_fee,
//           rp.razorpay_fee,
//           rp.gst,
//           rp.description as payment_description,
//           rp.created_at as payment_created_at
//         FROM
//           member_monthly_maintenance_dues mmmd
//           LEFT JOIN societies s ON mmmd.society_id = s.id
//           LEFT JOIN members m ON m.id = ANY(mmmd.member_ids)
//           LEFT JOIN users u ON u.id = m.user_id
//           LEFT JOIN buildings b ON b.id = m.building_id
//           LEFT JOIN flats f ON f.id = m.flat_id
//           LEFT JOIN housing_units hu ON hu.id = m.housing_id
//           LEFT JOIN razorpay_payments rp ON rp.razorpay_payment_id = mmmd.razorpay_payment_id
//         WHERE
//           mmmd.society_id = $1
//           AND mmmd.month_year = $2
//         GROUP BY
//           mmmd.id, s.name, b.name, f.flat_number, hu.unit_number,
//           rp.razorpay_payment_id, rp.razorpay_order_id, rp.bank_rrn,
//           rp.invoice_id, rp.method, rp.payer_upi_id, rp.payer_account_type,
//           rp.customer_contact, rp.customer_email, rp.total_fee,
//           rp.razorpay_fee, rp.gst, rp.description, rp.created_at;
//     `;

//     const { rows } = await query<GetMemberMaintenance>(queryText, [
//       societyId,
//       monthYear,
//     ]);

//     return rows;
//   } catch (error) {
//     throw new Error(`Error in listMemberMaintenances ${error}`);
//   }
// };

export const listMemberMaintenances = async (
  societyId: string,
  monthYear: string
): Promise<GetMemberMaintenance[]> => {
  try {
    const queryText = `
        WITH latest_payments AS (
          SELECT 
            rp.*,
            ROW_NUMBER() OVER (
              PARTITION BY rp.razorpay_payment_id 
              ORDER BY rp.created_at DESC
            ) as rn
          FROM razorpay_payments rp
        )
        SELECT 
          mmmd.*,
          s.name as society_name,
          json_agg(
            DISTINCT concat(u.first_name, ' ', u.last_name)
          ) as member_names,
          b.name as building_name,
          f.flat_number,
          hu.unit_number as housing_unit_number,
          json_agg(
            DISTINCT u.id
          ) as user_ids,
          -- Razorpay payment details from latest payment record
          lp.razorpay_payment_id as razorpay_payment_id_full,
          lp.razorpay_order_id,
          lp.bank_rrn,
          lp.invoice_id,
          lp.method as payment_method,
          lp.payer_upi_id,
          lp.payer_account_type,
          lp.customer_contact,
          lp.customer_email,
          lp.total_fee,
          lp.razorpay_fee,
          lp.gst,
          lp.description as payment_description,
          lp.created_at as payment_created_at
        FROM 
          member_monthly_maintenance_dues mmmd 
          LEFT JOIN societies s ON mmmd.society_id = s.id
          LEFT JOIN members m ON m.id = ANY(mmmd.member_ids)
          LEFT JOIN users u ON u.id = m.user_id
          LEFT JOIN buildings b ON b.id = m.building_id
          LEFT JOIN flats f ON f.id = m.flat_id
          LEFT JOIN housing_units hu ON hu.id = m.housing_id
          LEFT JOIN latest_payments lp ON lp.razorpay_payment_id = mmmd.razorpay_payment_id AND lp.rn = 1
        WHERE 
          mmmd.society_id = $1 
          AND mmmd.month_year = $2
        GROUP BY 
          mmmd.id, s.name, b.name, f.flat_number, hu.unit_number,
          lp.razorpay_payment_id, lp.razorpay_order_id, lp.bank_rrn, 
          lp.invoice_id, lp.method, lp.payer_upi_id, lp.payer_account_type,
          lp.customer_contact, lp.customer_email, lp.total_fee, 
          lp.razorpay_fee, lp.gst, lp.description, lp.created_at
        ORDER BY mmmd.created_at DESC;
    `;

    const { rows } = await query<GetMemberMaintenance>(queryText, [
      societyId,
      monthYear,
    ]);

    return rows;
  } catch (error) {
    throw new Error(`Error in listMemberMaintenances ${error}`);
  }
};
