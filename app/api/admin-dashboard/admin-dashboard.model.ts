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
    const societyFilter = societyId
      ? `WHERE s.id = '${societyId}' AND s.is_deleted = false`
      : "WHERE s.is_deleted = false";

    const queryText = `
      SELECT json_build_object(
          'total_societies', (SELECT COUNT(*) FROM public.societies ${
            societyId
              ? `WHERE id = '${societyId}' AND is_deleted = false`
              : "WHERE is_deleted = false"
          }),
          'total_buildings', (
            SELECT COUNT(*) 
            FROM public.buildings b
            JOIN public.societies s ON s.id = b.society_id
            WHERE s.society_type IN ('commercial', 'residential')
            ${
              societyId
                ? `AND s.id = '${societyId}' AND s.is_deleted = false`
                : "AND s.is_deleted = false"
            }
          ),
          'total_units', (
            SELECT 
              COALESCE((
                SELECT COUNT(*) 
                FROM public.flats f
                JOIN public.buildings b ON f.building_id = b.id
                JOIN public.societies s ON b.society_id = s.id
                WHERE s.society_type IN ('commercial', 'residential')
                ${
                  societyId
                    ? `AND s.id = '${societyId}' AND s.is_deleted = false`
                    : "AND s.is_deleted = false"
                }
              ), 0) +
              COALESCE((
                SELECT COUNT(*) 
                FROM public.housing_units hu
                JOIN public.societies s ON hu.society_id = s.id
                WHERE s.society_type = 'housing' AND hu.is_deleted = false
                ${
                  societyId
                    ? `AND s.id = '${societyId}' AND s.is_deleted = false`
                    : "AND s.is_deleted = false"
                }
              ), 0)
          ),
          'occupied_units', (
            SELECT 
              COALESCE((
                SELECT COUNT(*) 
                FROM public.flats f
                JOIN public.buildings b ON f.building_id = b.id
                JOIN public.societies s ON b.society_id = s.id
                WHERE f.is_occupied = true AND s.society_type IN ('commercial', 'residential')
                ${
                  societyId
                    ? `AND s.id = '${societyId}' AND s.is_deleted = false`
                    : "AND s.is_deleted = false"
                }
              ), 0) +
              COALESCE((
                SELECT COUNT(*) 
                FROM public.housing_units hu
                JOIN public.societies s ON hu.society_id = s.id
                WHERE hu.is_occupied = true AND s.society_type = 'housing' AND hu.is_deleted = false
                ${
                  societyId
                    ? `AND s.id = '${societyId}' AND s.is_deleted = false`
                    : "AND s.is_deleted = false"
                }
              ), 0)
          ),
          'total_members', (
            SELECT 
              COALESCE((
                SELECT COUNT(*) 
                FROM public.members m
                JOIN public.flats f ON m.flat_id = f.id
                JOIN public.buildings b ON f.building_id = b.id
                JOIN public.societies s ON b.society_id = s.id
                WHERE s.society_type IN ('commercial', 'residential')
                ${
                  societyId
                    ? `AND s.id = '${societyId}' AND s.is_deleted = false`
                    : "AND s.is_deleted = false"
                }
              ), 0) +
              COALESCE((
                SELECT COUNT(*) 
                FROM public.members m
                JOIN public.housing_units hu ON m.housing_id = hu.id
                JOIN public.societies s ON hu.society_id = s.id
                WHERE s.society_type = 'housing' AND hu.is_deleted = false
                ${
                  societyId
                    ? `AND s.id = '${societyId}' AND s.is_deleted = false`
                    : "AND s.is_deleted = false"
                }
              ), 0)
          ),
          'recent_notices', (
            SELECT COALESCE(json_agg(row_to_json(notices)), '[]') FROM (
              SELECT n.id, n.title, n.description, n.created_at, n.status
              FROM public.notices n
              JOIN public.societies s ON n.society_id = s.id
              WHERE n.is_deleted = false AND s.is_deleted = false
              ${societyId ? `AND s.id = '${societyId}'` : ""}
              ORDER BY n.created_at DESC
              LIMIT 5
            ) notices
          ),
          'societies_breakdown', (
            SELECT COALESCE(json_agg(row_to_json(soc_data)), '[]') FROM (
              SELECT 
                s.id,
                s.name,
                s.society_type,
                CASE 
                  WHEN s.society_type IN ('commercial', 'residential') THEN 
                    (SELECT COUNT(*) FROM public.buildings b WHERE b.society_id = s.id)
                  ELSE 0
                END AS total_buildings,
                CASE 
                  WHEN s.society_type IN ('commercial', 'residential') THEN 
                    (SELECT COUNT(*) FROM public.flats f JOIN public.buildings b ON f.building_id = b.id WHERE b.society_id = s.id)
                  WHEN s.society_type = 'housing' THEN 
                    (SELECT COUNT(*) FROM public.housing_units hu WHERE hu.society_id = s.id AND hu.is_deleted = false)
                  ELSE 0
                END AS total_units,
                CASE 
                  WHEN s.society_type IN ('commercial', 'residential') THEN 
                    (SELECT COUNT(*) FROM public.members m JOIN public.flats f ON m.flat_id = f.id JOIN public.buildings b ON f.building_id = b.id WHERE b.society_id = s.id)
                  WHEN s.society_type = 'housing' THEN 
                    (SELECT COUNT(*) FROM public.members m JOIN public.housing_units hu ON m.housing_id = hu.id WHERE hu.society_id = s.id AND hu.is_deleted = false)
                  ELSE 0
                END AS total_members
              FROM public.societies s
              WHERE s.is_deleted = false
              ${societyId ? `AND s.id = '${societyId}'` : ""}
              ORDER BY s.name
            ) soc_data
          ),
          'members_list', (
            SELECT COALESCE(json_agg(row_to_json(all_members)), '[]') FROM (
              SELECT * FROM (
                -- Members from flats (commercial/residential)
                SELECT 
                  m.id, 
                  u.first_name, 
                  u.last_name, 
                  u.phone, 
                  f.flat_number AS unit_number, 
                  b."name" AS building_name,
                  s.society_type,
                  s.id AS society_id
                FROM public.members m
                JOIN public.users u ON u.id = m.user_id
                JOIN public.flats f ON m.flat_id = f.id
                JOIN public.buildings b ON f.building_id = b.id
                JOIN public.societies s ON b.society_id = s.id
                WHERE u.is_deleted = false AND s.is_deleted = false AND s.society_type IN ('commercial', 'residential')
                ${societyId ? `AND s.id = '${societyId}'` : ""}
                
                UNION ALL
                
                -- Members from housing units
                SELECT 
                  m.id, 
                  u.first_name, 
                  u.last_name, 
                  u.phone, 
                  hu.unit_number, 
                  NULL AS building_name,
                  s.society_type,
                  s.id AS society_id
                FROM public.members m
                JOIN public.users u ON u.id = m.user_id
                JOIN public.housing_units hu ON m.housing_id = hu.id
                JOIN public.societies s ON hu.society_id = s.id
                WHERE u.is_deleted = false AND s.is_deleted = false AND hu.is_deleted = false AND s.society_type = 'housing'
                ${societyId ? `AND s.id = '${societyId}'` : ""}
              ) all_members
              ORDER BY all_members.first_name, all_members.last_name
            ) all_members
          ),
          'all_notices', (
            SELECT COALESCE(json_agg(row_to_json(n)), '[]')
            FROM public.notices n
            JOIN public.societies s ON n.society_id = s.id
            WHERE n.is_deleted = false AND s.is_deleted = false
            ${societyId ? `AND s.id = '${societyId}'` : ""}
          )
      ) AS dashboard;
    `;

    const res: QueryResult<any> = await query<any>(queryText);
    return res.rows[0].dashboard;
  } catch (error) {
    throw new Error(`Error getting admin dashboard: ${error}`);
  }
};