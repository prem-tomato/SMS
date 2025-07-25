import { query, queryWithClient } from "@/db/database-connect";
import { PoolClient, QueryResult } from "pg";
import { User } from "./auth.types";

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
  clientIp: string
): Promise<void> => {
  try {
    const queryText = `
        INSERT INTO user_sessions (user_id, refresh_token, created_at, updated_at, created_by, ip_address)
        VALUES ($1, $2, NOW(), NOW(), $1, $3)
    `;

    await queryWithClient(client, queryText, [userId, token, clientIp]);
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
