import { query } from "@/db/database-connect";
import { QueryResult } from "pg";

export const getSocietyIdByMemberId = async (
  memberId: string
): Promise<string> => {
  try {
    const queryText: string = `
      SELECT society_id FROM users WHERE id = $1;
    `;

    const res: QueryResult<{ society_id: string }> = await query<{
      society_id: string;
    }>(queryText, [memberId]);
    return res.rows[0].society_id;
  } catch (error) {
    throw new Error(`Error getting society id by member id: ${error}`);
  }
};

export const getAdminDashboard = async (societyId: string): Promise<any> => {
  try {
    const societyFilter = societyId ? `WHERE s.id = '${societyId}'` : "";

    const queryText = `
      SELECT json_build_object(
          'total_societies', (SELECT COUNT(*) FROM public.societies ${societyId ? `WHERE id = '${societyId}'` : ''}),
          'total_buildings', (
            SELECT COUNT(*) 
            FROM public.buildings b
            JOIN public.societies s ON s.id = b.society_id
            ${societyFilter}
          ),
          'total_flats', (
            SELECT COUNT(*) 
            FROM public.flats f
            JOIN public.buildings b ON f.building_id = b.id
            JOIN public.societies s ON b.society_id = s.id
            ${societyFilter}
          ),
          'occupied_flats', (
            SELECT COUNT(*) 
            FROM public.flats f
            JOIN public.buildings b ON f.building_id = b.id
            JOIN public.societies s ON b.society_id = s.id
            WHERE f.is_occupied = true
            ${societyId ? `AND s.id = '${societyId}'` : ''}
          ),
          'total_members', (
            SELECT COUNT(*) 
            FROM public.members m
            JOIN public.flats f ON m.flat_id = f.id
            JOIN public.buildings b ON f.building_id = b.id
            JOIN public.societies s ON b.society_id = s.id
            ${societyFilter}
          ),
          'recent_notices', (
            SELECT COALESCE(json_agg(row_to_json(notices)), '[]') FROM (
              SELECT n.id, n.title, n.created_at, n.status
              FROM public.notices n
              JOIN public.societies s ON n.society_id = s.id
              ${societyFilter}
              ORDER BY n.created_at DESC
              LIMIT 5
            ) notices
          ),
          'societies_breakdown', (
            SELECT COALESCE(json_agg(row_to_json(soc_data)), '[]') FROM (
              SELECT 
                s.id,
                s.name,
                (SELECT COUNT(*) FROM public.buildings b WHERE b.society_id = s.id) AS total_buildings,
                (SELECT COUNT(*) FROM public.flats f JOIN public.buildings b ON f.building_id = b.id WHERE b.society_id = s.id) AS total_flats,
                (SELECT COUNT(*) FROM public.members m JOIN public.flats f ON m.flat_id = f.id JOIN public.buildings b ON f.building_id = b.id WHERE b.society_id = s.id) AS total_members
              FROM public.societies s
              ${societyId ? `WHERE s.id = '${societyId}'` : ''}
              ORDER BY s.name
            ) soc_data
          ),
          'members_list', (
            SELECT COALESCE(json_agg(row_to_json(members)), '[]') FROM (
              SELECT m.id, u.first_name, u.last_name, u.phone, f.flat_number, b."name" AS building_name
              FROM public.members m
              JOIN public.users u ON u.id = m.user_id
              JOIN public.flats f ON m.flat_id = f.id
              JOIN public.buildings b ON f.building_id = b.id
              JOIN public.societies s ON b.society_id = s.id
              ${societyFilter}
            ) members
          ),
          'all_notices', (
            SELECT COALESCE(json_agg(row_to_json(n)), '[]')
            FROM public.notices n
            JOIN public.societies s ON n.society_id = s.id
            ${societyFilter}
          )
      ) AS dashboard;
    `;

    const res: QueryResult<any> = await query<any>(queryText);
    return res.rows[0].dashboard;
  } catch (error) {
    throw new Error(`Error getting admin dashboard: ${error}`);
  }
};
