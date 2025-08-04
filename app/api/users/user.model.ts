import { query } from "@/db/database-connect";
import { QueryResult } from "pg";
import { UserResponse } from "./user.types";

export const getUsers = async (sociteyId: string): Promise<UserResponse[]> => {
  try {
    const queryText: string = `
        SELECT
            u.id,
            u.role,
            u.first_name,
            u.last_name,
            u.phone,
            s.name AS society_name
        FROM users u
        LEFT JOIN societies s ON s.id = u.society_id
        WHERE u.society_id = $1
    `;

    const res: QueryResult<UserResponse> = await query<UserResponse>(
      queryText,
      [sociteyId]
    );

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting users: ${error}`);
  }
};

export const getVacantUsers = async (
  sociteyId: string
): Promise<UserResponse[]> => {
  try {
    const queryText: string = `
      SELECT
          u.id,
          u.role,
          u.first_name,
          u.last_name,
          u.phone,
          s.name AS society_name
      FROM users u
      LEFT JOIN societies s ON s.id = u.society_id
      WHERE u.society_id = $1
        AND NOT EXISTS (
            SELECT 1
            FROM members m
            JOIN flats f ON f.id = m.flat_id
            WHERE m.user_id = u.id
              AND f.is_occupied = true
        );
    `;

    const res: QueryResult<UserResponse> = await query<UserResponse>(
      queryText,
      [sociteyId]
    );

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting users: ${error}`);
  }
};

export const getVacantUsersForHousing = async (
  sociteyId: string
): Promise<UserResponse[]> => {
  try {
    const queryText: string = `
      SELECT
          u.id,
          u.role,
          u.first_name,
          u.last_name,
          u.phone,
          s.name AS society_name
      FROM users u
      LEFT JOIN societies s ON s.id = u.society_id
      WHERE u.society_id = $1
        AND NOT EXISTS (
            SELECT 1
            FROM members m
            JOIN housing_units h ON h.id = m.housing_id
            WHERE m.user_id = u.id
              AND h.is_occupied = true
        );
    `;

    const res: QueryResult<UserResponse> = await query<UserResponse>(
      queryText,
      [sociteyId]
    );

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting users: ${error}`);
  }
};

export const listAllUsers = async (): Promise<UserResponse[]> => {
  try {
    const queryText: string = `
      SELECT
          u.id,
          u.role,
          u.first_name,
          u.last_name,
          u.phone,
          s.name AS society_name
      FROM users u
      LEFT JOIN societies s ON s.id = u.society_id
      WHERE u.role != 'super_admin'
    `;

    const res: QueryResult<UserResponse> = await query<UserResponse>(queryText);

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting users: ${error}`);
  }
};
