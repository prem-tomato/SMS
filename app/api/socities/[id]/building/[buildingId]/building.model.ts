import { query, queryWithClient } from "@/db/database-connect";
import { PoolClient, QueryResult } from "pg";
import { Flat } from "../../../socities.types";
import { UpdateBuildingReqBody, UpdateFlatReqBody } from "./building.types";

export const updateBuildingModel = async (
  societyId: string,
  buildingId: string,
  reqBody: UpdateBuildingReqBody
) => {
  console.log("updateBuildingModel", societyId, buildingId, reqBody);

  try {
    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (reqBody.name !== undefined) {
      updates.push(`name = $${index++}`);
      values.push(reqBody.name);
    }

    if (reqBody.total_floors !== undefined) {
      updates.push(`total_floors = $${index++}`);
      values.push(reqBody.total_floors);
    }

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    // Add WHERE conditions
    values.push(buildingId, societyId);

    const queryText = `
      UPDATE buildings
      SET ${updates.join(", ")}
      WHERE id = $${index++} AND society_id = $${index}
    `;

    await query(queryText, values);
  } catch (error) {
    throw new Error(`Error in updateBuildingModel: ${error}`);
  }
};

export const deleteBuildingModel = async (
  societyId: string,
  buildingId: string
) => {
  try {
    // 1️⃣ Check if building is used in flats
    const checkFlatsQuery = `
      SELECT COUNT(*)::int AS flat_count
      FROM flats
      WHERE building_id = $1 AND society_id = $2
    `;
    const { rows } = await query(checkFlatsQuery, [buildingId, societyId]);

    if (rows[0].flat_count > 0) {
      throw new Error(
        `Building cannot be deleted because it has associated flats`
      );
    }

    // 2️⃣ Proceed with soft delete
    const deleteQuery = `
      UPDATE buildings
      SET is_deleted = true,
          deleted_at = NOW()
      WHERE id = $1 AND society_id = $2
    `;

    await query(deleteQuery, [buildingId, societyId]);

    return { success: true, message: "Building deleted successfully" };
  } catch (error: any) {
    throw new Error(`Error in deleteBuildingModel: ${error.message}`);
  }
};

export const updateFlat = async (
  reqBody: Partial<Omit<UpdateFlatReqBody, "pending_maintenance">>,
  flatId: string,
  buildingId: string,
  societyId: string,
  userId: string,
  client: PoolClient
): Promise<Flat> => {
  try {
    const fields: string[] = [];
    const values: any[] = [flatId, buildingId, societyId];

    let idx = 4;
    for (const [key, value] of Object.entries(reqBody)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    fields.push(`updated_by = $${idx}`);
    values.push(userId);
    idx++;

    fields.push(`updated_at = NOW()`);

    const queryText = `
      UPDATE flats
      SET ${fields.join(", ")}
      WHERE id = $1 AND building_id = $2 AND society_id = $3
      RETURNING *;
    `;

    const res: QueryResult<Flat> = await queryWithClient<Flat>(
      client,
      queryText,
      values
    );

    if (res.rows.length === 0) {
      throw new Error("Flat not found or not updated");
    }

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error updating flat: ${error}`);
  }
};

export const deleteFlatMaintenance = async (
  flatId: string,
  client: PoolClient
): Promise<void> => {
  const queryText = `
    DELETE FROM flat_maintenances
    WHERE flat_id = $1;
  `;

  await queryWithClient(client, queryText, [flatId]);
};

export const updateFlatMaintenance = async (
  flatId: string,
  items: { id?: string; amount: number; reason: string }[],
  userId: string,
  client: PoolClient
): Promise<void> => {
  // 1. Fetch existing
  const existingRes = await queryWithClient<{ id: string }>(
    client,
    `SELECT id FROM flat_maintenances WHERE flat_id = $1`,
    [flatId]
  );
  const existingIds = existingRes.rows.map((r) => r.id);

  const incomingIds = items.filter((i) => i.id).map((i) => i.id!);

  // 2. Delete removed
  const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
  if (toDelete.length) {
    await queryWithClient(
      client,
      `DELETE FROM flat_maintenances WHERE id = ANY($1::uuid[])`,
      [toDelete]
    );
  }

  // 3. Update existing
  for (const item of items.filter((i) => i.id)) {
    await queryWithClient(
      client,
      `UPDATE flat_maintenances 
       SET amount = $1, reason = $2, updated_by = $3, updated_at = NOW()
       WHERE id = $4`,
      [item.amount, item.reason, userId, item.id]
    );
  }

  // 4. Insert new
  const newItems = items.filter((i) => !i.id);
  if (newItems.length) {
    const values = newItems.flatMap((i) => [
      flatId,
      i.amount,
      i.reason,
      userId,
    ]);

    const queryText = `
      INSERT INTO flat_maintenances 
        (flat_id, amount, reason, created_by, created_at, updated_by, updated_at)
      VALUES ${newItems
        .map(
          (_, idx) =>
            `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${
              idx * 4 + 4
            }, NOW(), $${idx * 4 + 4}, NOW())`
        )
        .join(", ")}
    `;

    await queryWithClient(client, queryText, values);
  }
};
