import { query, queryWithClient } from "@/db/database-connect";
import { PoolClient, QueryResult } from "pg";
import { Societies } from "../socities/socities.types";
import { User, UserAgentData } from "./auth.types";

export const findUserByLoginKey = async (
  loginKey: number
): Promise<User | undefined> => {
  try {
    const queryText = `
        SELECT * FROM users
        WHERE login_key = $1::integer
        AND is_deleted = false
    `;

    const res: QueryResult<User> = await query<User>(queryText, [loginKey]);

    return res.rows[0]; // Return the first user found, or undefined if no user matches
  } catch (error) {
    throw new Error(`Error finding user by login key: ${error}`);
  }
};

export const addToken = async (
  client: PoolClient,
  token: string,
  userId: string,
  userAgentData: UserAgentData
): Promise<void> => {
  try {
    const queryText = `
      INSERT INTO user_sessions (
        user_id,
        refresh_token,
        created_at,
        updated_at,
        created_by,
        ip_address,
        device,
        os,
        browser,
        latitude,
        longitude,
        location
      )
      VALUES ($1, $2, NOW(), NOW(), $1, $3, $4, $5, $6, $7, $8, $9)
    `;

    await queryWithClient(client, queryText, [
      userId,
      token,
      userAgentData.clientIp,
      userAgentData.device,
      userAgentData.os,
      userAgentData.browser,
      userAgentData.latitude,
      userAgentData.longitude,
      userAgentData.location,
    ]);
  } catch (error) {
    throw new Error(`Error adding token: ${error}`);
  }
};

export const findUserById = async (
  userId: string
): Promise<User | undefined> => {
  try {
    const queryText = `
        SELECT * FROM users
        WHERE id = $1::uuid
        AND is_deleted = false
    `;

    const res: QueryResult<User> = await query<User>(queryText, [userId]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error finding user by id: ${error}`);
  }
};

export const removeOtherTokens = async (
  client: PoolClient,
  userId: string
): Promise<void> => {
  try {
    const queryText = `
      UPDATE user_sessions
        SET is_deleted = true,
        deleted_at = NOW(),
        updated_at = NOW(),
        deleted_by = $1
      WHERE user_id = $1
        AND is_deleted = false;`;

    await queryWithClient(client, queryText, [userId]);
  } catch (error) {
    throw new Error(`Error deleting user sessions: ${error}`);
  }
};

export const findSocietyBySocietyKey = async (
  societyKey: string
): Promise<Societies | undefined> => {
  try {
    const queryText = `
        SELECT * FROM societies
        WHERE society_key = $1
        AND is_deleted = false
    `;

    const res: QueryResult<Societies> = await query<Societies>(queryText, [
      societyKey,
    ]);

    return res.rows.length > 0 ? res.rows[0] : undefined;
  } catch (error) {
    throw new Error(`Error finding society by society key: ${error}`);
  }
};

export const findUserByLoginKeyAndSociety = async (
  loginKey: number,
  societyId: string | null | undefined
): Promise<User | undefined> => {
  try {
    let queryText: string;
    let params: any[];

    if (societyId === null || societyId === undefined) {
      // Handle NULL society_id case (for super admins)
      queryText = `
        SELECT * FROM users
        WHERE login_key = $1 
        AND society_id IS NULL
        AND is_deleted = false
      `;
      params = [loginKey];
    } else {
      // Handle regular users with society_id
      queryText = `
        SELECT * FROM users
        WHERE login_key = $1 
        AND society_id = $2
        AND is_deleted = false
      `;
      params = [loginKey, societyId];
    }

    const res: QueryResult<User> = await query<User>(queryText, params);

    return res.rows.length > 0 ? res.rows[0] : undefined;
  } catch (error) {
    throw new Error(`Error finding user by login key and society: ${error}`);
  }
};

export const findSuperAdminByLoginKey = async (
  loginKey: number
): Promise<User | undefined> => {
  try {
    console.log("loginKey", loginKey);

    const queryText = `
        SELECT * FROM users
        WHERE login_key = $1 
        AND role = 'super_admin'
        AND society_id IS NULL
        AND is_deleted = false
    `;

    const res: QueryResult<User> = await query<User>(queryText, [loginKey]);

    return res.rows.length > 0 ? res.rows[0] : undefined;
  } catch (error) {
    throw new Error(`Error finding super admin by login key: ${error}`);
  }
};
