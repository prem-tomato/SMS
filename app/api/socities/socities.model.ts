import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { User } from "../auth/auth.types";
import {
  AddAdminReqBody,
  AddBuildingReqBody,
  AddEndDateReqBody,
  AddFlatReqBody,
  AddMemberReqBody,
  AddNoticeReqBody,
  AddSocietyReqBody,
  AssignedFlatOptions,
  AssignFlatMembers,
  AssignMemberReqBody,
  Building,
  BuildingResponseForSociety,
  Flat,
  FlatOptions,
  NoticeResponse,
  Societies,
  SocietyOptions,
} from "./socities.types";

export const findSocityByName = async (
  name: string
): Promise<Societies | undefined> => {
  try {
    const queryText: string = `
            SELECT * FROM societies
            WHERE name = $1
        `;

    const res: QueryResult<Societies> = await query<Societies>(queryText, [
      name,
    ]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error finding society by name: ${error}`);
  }
};

export const addSocieties = async (
  society: AddSocietyReqBody & { created_by: string }
): Promise<Societies> => {
  try {
    const queryText: string = `
        INSERT INTO societies (name, address, city, state, country, created_by, created_at, opening_balance)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
        RETURNING *
    `;

    const res: QueryResult<Societies> = await query<Societies>(queryText, [
      society.name,
      society.address,
      society.city,
      society.state,
      society.country,
      society.created_by,
      society.opening_balance,
    ]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error adding society: ${error}`);
  }
};

export const findSocietyById = async (
  id: string
): Promise<Societies | undefined> => {
  try {
    const queryText: string = `
            SELECT * FROM societies
            WHERE id = $1
        `;

    const res: QueryResult<Societies> = await query<Societies>(queryText, [id]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error finding society by ID: ${error}`);
  }
};

export const addAdmin = async (
  reqBody: AddAdminReqBody,
  societyId: string,
  userId: string
): Promise<User> => {
  try {
    const queryText: string = `
        INSERT INTO users (society_id, role, first_name, last_name, login_key, phone, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
    `;

    const res: QueryResult<User> = await query<User>(queryText, [
      societyId,
      reqBody.role,
      reqBody.first_name,
      reqBody.last_name,
      reqBody.login_key,
      reqBody.phone,
      userId,
    ]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error adding admin to society: ${error}`);
  }
};

export const checkLoginKeyUnique = async (
  loginKey: number
): Promise<string | undefined> => {
  try {
    const queryText = `
      SELECT id FROM users
      WHERE login_key = $1
    `;

    const res: QueryResult<{ id: string }> = await query(queryText, [loginKey]);

    // Return user id if exists, otherwise undefined
    return res.rows.length > 0 ? res.rows[0].id : undefined;
  } catch (error) {
    throw new Error(`Error checking login key uniqueness: ${String(error)}`);
  }
};

export const addMember = async (
  reqBody: AddMemberReqBody,
  societyId: string,
  userId: string
): Promise<User> => {
  try {
    const queryText: string = `
        INSERT INTO users (society_id, role, first_name, last_name, login_key, phone, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;

    const res: QueryResult<User> = await query<User>(queryText, [
      societyId,
      reqBody.role,
      reqBody.first_name,
      reqBody.last_name,
      reqBody.login_key,
      reqBody.phone,
      userId,
    ]);
    return res.rows[0];
  } catch (error) {
    throw new Error(`Error adding member to society: ${error}`);
  }
};

export const addBuilding = async (
  reqBody: AddBuildingReqBody,
  societyId: string,
  userId: string
): Promise<Building> => {
  try {
    const queryText: string = `
        INSERT INTO buildings (society_id, name, total_floors, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const res: QueryResult<Building> = await query<Building>(queryText, [
      societyId,
      reqBody.name,
      reqBody.total_floors,
      userId,
    ]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error adding building to society: ${error}`);
  }
};

export const findBuildingById = async (
  id: string
): Promise<Building | undefined> => {
  try {
    const queryText: string = `
            SELECT * FROM buildings
            WHERE id = $1
        `;

    const res: QueryResult<Building> = await query<Building>(queryText, [id]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error finding building by ID: ${error}`);
  }
};

export const addFlat = async (
  reqBody: AddFlatReqBody,
  buildingId: string,
  societyId: string,
  userId: string
): Promise<Flat> => {
  try {
    const queryText: string = `
        INSERT INTO flats (society_id, building_id, flat_number, floor_number, created_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const res: QueryResult<Flat> = await query<Flat>(queryText, [
      societyId,
      buildingId,
      reqBody.flat_number,
      reqBody.floor_number,
      userId,
    ]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error adding flat to building: ${error}`);
  }
};

export const findFlatById = async (id: string): Promise<Flat | undefined> => {
  try {
    const queryText: string = `
            SELECT * FROM flats
            WHERE id = $1
        `;

    const res: QueryResult<Flat> = await query<Flat>(queryText, [id]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error finding flat by ID: ${error}`);
  }
};

export const assignMembersToFlat = async (
  userIds: string[],
  reqBody: AssignMemberReqBody,
  params: { id: string; buildingId: string; flatId: string },
  createdBy: string
): Promise<void> => {
  try {
    const values = userIds
      .map(
        (userId) =>
          `('${userId}', '${params.id}', '${params.buildingId}', '${params.flatId}', '${reqBody.move_in_date}', '${createdBy}')`
      )
      .join(",");

    const queryText: string = `
      INSERT INTO members
      (user_id, society_id, building_id, flat_id, move_in_date, created_by)
      VALUES ${values}
      RETURNING *
    `;

    await query<AssignFlatMembers>(queryText);
  } catch (error) {
    throw new Error(`Error assigning members to flat: ${error}`);
  }
};

export const getSocieties = async (societyId: string): Promise<Societies[]> => {
  try {
    const queryText: string = `
      SELECT * FROM societies
      WHERE id = $1
    `;

    const res: QueryResult<Societies[]> = await query<Societies[]>(queryText, [
      societyId,
    ]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error getting societies: ${error}`);
  }
};

export const getBuildings = async (params: {
  id: string;
  buildingId: string;
}): Promise<Building[]> => {
  try {
    const queryText: string = `
      SELECT * FROM buildings
      WHERE society_id = $1 AND id = $2
    `;

    const res: QueryResult<Building[]> = await query<Building[]>(queryText, [
      params.id,
      params.buildingId,
    ]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error getting buildings: ${error}`);
  }
};

export const getFlats = async (params: {
  id: string;
  buildingId: string;
  flatId: string;
}): Promise<Flat[]> => {
  try {
    const queryText: string = `
      SELECT * FROM flats
      WHERE society_id = $1 AND building_id = $2 AND id = $3
    `;

    const res: QueryResult<Flat[]> = await query<Flat[]>(queryText, [
      params.id,
      params.buildingId,
      params.flatId,
    ]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error getting flats: ${error}`);
  }
};

export const listSocieties = async (): Promise<Societies[]> => {
  try {
    const queryText: string = `
      SELECT * FROM societies
    `;

    const res: QueryResult<Societies> = await query<Societies>(queryText);

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting societies: ${error}`);
  }
};

export const listSocietiesOptions = async (): Promise<SocietyOptions[]> => {
  try {
    const queryText: string = `
      SELECT id, name FROM societies
    `;

    const res: QueryResult<SocietyOptions> = await query<SocietyOptions>(
      queryText
    );

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting societies options: ${error}`);
  }
};

export const listFlats = async (params: {
  id: string;
  buildingId: string;
}): Promise<FlatOptions[]> => {
  try {
    const queryText: string = `
      SELECT
        f.id,
        f.flat_number,
        f.floor_number,
        f.is_occupied,
        b.name AS building_name,
        societies.name AS society_name
      FROM flats f
      LEFT JOIN buildings b ON b.id = f.building_id
      LEFT JOIN societies ON societies.id = f.society_id
      WHERE f.society_id = $1 AND f.building_id = $2
    `;

    const res: QueryResult<FlatOptions> = await query<FlatOptions>(queryText, [
      params.id,
      params.buildingId,
    ]);

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting flats: ${error}`);
  }
};

export const listVacantFlats = async (params: {
  id: string;
  buildingId: string;
}): Promise<FlatOptions[]> => {
  try {
    const queryText: string = `
      SELECT
        f.id,
        f.flat_number,
        f.floor_number,
        f.is_occupied,
        b.name AS building_name,
        societies.name AS society_name
      FROM flats f
      LEFT JOIN buildings b ON b.id = f.building_id
      LEFT JOIN societies ON societies.id = f.society_id
      WHERE f.society_id = $1 AND f.building_id = $2 AND f.is_occupied = false
    `;

    const res: QueryResult<FlatOptions> = await query<FlatOptions>(queryText, [
      params.id,
      params.buildingId,
    ]);

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting flats: ${error}`);
  }
};

export const toggleForIsOccupied = async (
  flatId: string,
  isOccupied: boolean
): Promise<void> => {
  try {
    const queryText: string = `
      UPDATE flats
      SET is_occupied = $1
      WHERE id = $2
    `;

    await query(queryText, [isOccupied, flatId]);
  } catch (error) {
    throw new Error(`Error toggling for is occupied: ${error}`);
  }
};

export const getAssignedFlatsUser = async (params: {
  id: string;
  buildingId: string;
}): Promise<AssignedFlatOptions[]> => {
  try {
    const queryText = `
      SELECT
        f.id,
        f.flat_number,
        f.floor_number,
        f.is_occupied,
        b.name AS building_name,
        societies.name AS society_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'first_name', u.first_name,
              'last_name', u.last_name
            )
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) AS members
      FROM flats f
      LEFT JOIN buildings b ON b.id = f.building_id
      LEFT JOIN societies ON societies.id = f.society_id
      LEFT JOIN members m ON m.flat_id = f.id
      LEFT JOIN users u ON u.id = m.user_id
      WHERE f.society_id = $1 AND f.building_id = $2 AND f.is_occupied = true
      GROUP BY f.id, f.flat_number, f.floor_number, f.is_occupied, b.name, societies.name
      ORDER BY f.floor_number, f.flat_number
    `;

    const res = await query<AssignedFlatOptions>(queryText, [
      params.id,
      params.buildingId,
    ]);

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting assigned flats: ${error}`);
  }
};

export const createNotice = async (
  reqBody: AddNoticeReqBody,
  societyId: string,
  createdBy: string
): Promise<void> => {
  try {
    const queryText: string = `
      INSERT INTO notices
      (title, content, society_id, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    await query(queryText, [
      reqBody.title,
      reqBody.content,
      societyId,
      createdBy,
    ]);
  } catch (error) {
    throw new Error(`Error creating notice: ${error}`);
  }
};

export const getNotices = async (
  societyId?: string
): Promise<NoticeResponse[]> => {
  try {
    const values: any[] = [];
    let whereClause: string = "";
    if (societyId) {
      values.push(societyId);
      whereClause = `WHERE n.society_id = $1`;
    }

    const queryText: string = `
      SELECT 
        n.id,
        n.title,
        n.content,
        n.created_at,
        n.status,
        s.name AS society_name,
        s.id AS society_id,
        concat(u.first_name, ' ', u.last_name) AS created_by
      FROM notices n
      LEFT JOIN societies s ON s.id = n.society_id
      LEFT JOIN users u ON u.id = n.created_by
      ${whereClause}
    `;

    const res: QueryResult<NoticeResponse> = await query<NoticeResponse>(
      queryText,
      values
    );

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting notices: ${error}`);
  }
};

export const toggleNoticeStatus = async (
  societyId: string,
  noticeId: string
): Promise<void> => {
  try {
    const queryText: string = `
      UPDATE notices
      SET status = CASE 
        WHEN status = 'open'::notice_status THEN 'closed'::notice_status 
        ELSE 'open'::notice_status 
      END
      WHERE society_id = $1 AND id = $2
    `;

    await query(queryText, [societyId, noticeId]);
  } catch (error) {
    throw new Error(`Error toggling notice status: ${error}`);
  }
};

export const updateEndDate = async (
  reqBody: AddEndDateReqBody,
  societyId: string
): Promise<void> => {
  try {
    const queryText: string = `
      UPDATE societies
      SET end_date = $1
      WHERE id = $2
    `;

    await query(queryText, [reqBody.end_date, societyId]);
  } catch (error) {
    throw new Error(`Error updating end date: ${error}`);
  }
};

export const deleteSocietyModel = async (id: string): Promise<void> => {
  try {
    const queryText: string = `
      DELETE FROM societies
      WHERE id = $1
    `;

    await query(queryText, [id]);
  } catch (error) {
    throw new Error(`Error deleting society: ${error}`);
  }
};

export const getBuildingsBySociety = async (
  societyId: string
): Promise<BuildingResponseForSociety[]> => {
  try {
    const queryText: string = `
      SELECT 
        b.id,
        b.name,
        b.total_floors,
        s.name AS society_name,
        concat(u.first_name, ' ', u.last_name) AS action_by
      FROM buildings b
      LEFT JOIN societies s ON s.id = b.society_id
      LEFT JOIN users u ON u.id = b.created_by
      WHERE b.society_id = $1
    `;

    const res: QueryResult<BuildingResponseForSociety> =
      await query<BuildingResponseForSociety>(queryText, [societyId]);

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting buildings by society: ${error}`);
  }
};
