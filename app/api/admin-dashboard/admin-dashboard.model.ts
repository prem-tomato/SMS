import { query } from "@/db/database-connect";
import { QueryResult } from "pg";

export const getAdminDashboard = async (): Promise<any> => {
  try {
    const queryText: string = `
      SELECT json_build_object(
          'total_societies', (SELECT COUNT(*) FROM public.societies),
          'total_buildings', (SELECT COUNT(*) FROM public.buildings b 
                                WHERE EXISTS (
                                    SELECT 1 FROM public.societies s 
                                    WHERE s.id = b.society_id
                                )
                              ),
          'total_flats', (SELECT COUNT(*) FROM public.flats f
                           JOIN public.buildings b ON f.building_id = b.id
                           JOIN public.societies s ON b.society_id = s.id),
          'occupied_flats', (SELECT COUNT(*) FROM public.flats f
                              JOIN public.buildings b ON f.building_id = b.id
                              JOIN public.societies s ON b.society_id = s.id
                              WHERE f.is_occupied = true),
          'total_members', (SELECT COUNT(*) FROM public.members m
                             JOIN public.flats f ON m.flat_id = f.id
                             JOIN public.buildings b ON f.building_id = b.id
                             JOIN public.societies s ON b.society_id = s.id),
          'recent_notices', (SELECT json_agg(row_to_json(notices)) FROM (
                                SELECT n.id, n.title, n.created_at, n.status
                                FROM public.notices n
                                JOIN public.societies s ON n.society_id = s.id
                                ORDER BY n.created_at DESC
                                LIMIT 5
                             ) notices),
          'societies_breakdown', (
            SELECT json_agg(row_to_json(soc_data)) FROM (
              SELECT 
                s.id,
                s.name,
                (SELECT COUNT(*) FROM public.buildings b WHERE b.society_id = s.id) AS total_buildings,
                (SELECT COUNT(*) FROM public.flats f 
                 JOIN public.buildings b ON f.building_id = b.id
                 WHERE b.society_id = s.id) AS total_flats,
                (SELECT COUNT(*) FROM public.members m
                 JOIN public.flats f ON m.flat_id = f.id
                 JOIN public.buildings b ON f.building_id = b.id
                 WHERE b.society_id = s.id) AS total_members
              FROM public.societies s
              ORDER BY s.name
            ) soc_data
          )
      ) AS dashboard;
    `;

    const res: QueryResult<any> = await query<any>(queryText);
    return res.rows[0].dashboard;
  } catch (error) {
    throw new Error(`Error getting admin dashboard: ${error}`);
  }
};
