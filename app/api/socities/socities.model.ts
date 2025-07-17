import { query } from "@/db/database-connect";
import { MEMBER } from "@/db/utils/enums/enum";
import { QueryResult } from "pg";
import { User } from "../auth/auth.types";
import {
  AddAdminReqBody,
  AddBuildingReqBody,
  AddFlatReqBody,
  AddMemberReqBody,
  AddSocietyReqBody,
  AssignFlatMembers,
  AssignMemberReqBody,
  Building,
  Flat,
  FlatOptions,
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
        INSERT INTO societies (name, address, city, state, country, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
    `;

    const res: QueryResult<Societies> = await query<Societies>(queryText, [
      society.name,
      society.address,
      society.city,
      society.state,
      society.country,
      society.created_by,
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

export const findUserByIdAndType = async (
  userId: string,
  societyId: string
): Promise<User | undefined> => {
  try {
    const queryText: string = `
            SELECT * FROM users
            WHERE id = $1 AND role = $2 AND society_id = $3
        `;

    const res: QueryResult<User> = await query<User>(queryText, [
      userId,
      MEMBER,
      societyId,
    ]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error finding user by ID: ${error}`);
  }
};

export const assignMemberToFlat = async (
  reqBody: AssignMemberReqBody,
  params: { id: string; buildingId: string; flatId: string },
  userId: string
): Promise<AssignFlatMembers> => {
  try {
    const queryText: string = `
      INSERT INTO members
      (user_id, society_id, building_id, flat_id, move_in_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const res: QueryResult<AssignFlatMembers> = await query<AssignFlatMembers>(
      queryText,
      [
        reqBody.user_id,
        params.id,
        params.buildingId,
        params.flatId,
        reqBody.move_in_date,
        userId,
      ]
    );

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error assigning member to flat: ${error}`);
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
