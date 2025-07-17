import { PoolClient } from "pg";
import pool from "../database-connect";

export type Transaction = {
    client: PoolClient;
    isReleased: boolean;
  };


export const startTransaction = async (): Promise<Transaction> => {
  const client = await pool.connect();
  await client.query('BEGIN');
  return { client, isReleased: false };
};

export const commitTransaction = async (clientObj: {
  client: PoolClient;
  isReleased: boolean;
}) => {
  const { client, isReleased } = clientObj;
  try {
    await client.query('COMMIT');
  } finally {
    if (!isReleased) {
      client.release();
      clientObj.isReleased = true;
    }
  }
};

export const rollbackTransaction = async (clientObj: {
  client: PoolClient;
  isReleased: boolean;
}) => {
  const { client, isReleased } = clientObj;
  try {
    await client.query('ROLLBACK');
  } finally {
    if (!isReleased) {
      client.release();
      clientObj.isReleased = true;
    }
  }
};
