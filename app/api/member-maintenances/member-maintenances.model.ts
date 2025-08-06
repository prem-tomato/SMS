import { query } from "@/db/database-connect";
import { GetMemberMaintenance } from "./member-maintenances.types";

export const listMemberMaintenances = async (
  societyId: string,
  monthYear: string
): Promise<GetMemberMaintenance[]> => {
  try {
    const queryText = `
        SELECT 
          mmmd.*,
          s.name as society_name,
          json_agg(
            concat(u.first_name, ' ', u.last_name)
          ) as member_names,
          b.name as building_name,
          f.flat_number,
          hu.unit_number as housing_unit_number,
          json_agg(
            u.id
          ) as user_ids
        FROM 
          member_monthly_maintenance_dues mmmd 
          LEFT JOIN societies s ON mmmd.society_id = s.id
          LEFT JOIN members m ON m.id = ANY(mmmd.member_ids)
          LEFT JOIN users u ON u.id = m.user_id
          LEFT JOIN buildings b ON b.id = m.building_id
          LEFT JOIN flats f ON f.id = m.flat_id
          LEFT JOIN housing_units hu ON hu.id = m.housing_id
        WHERE 
          mmmd.society_id = $1 
          AND mmmd.month_year = $2
        GROUP BY 
          mmmd.id, s.name, b.name, f.flat_number, hu.unit_number;
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
