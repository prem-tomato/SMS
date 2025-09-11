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
  societyId: string,
  buildingId: string,
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
      `UPDATE flat_maintenances 
        SET is_deleted = true, 
          deleted_at = NOW(), 
          deleted_by = $1,
          updated_by = $1,
          updated_at = NOW()
        WHERE id = ANY($2::uuid[])`,
      [userId, toDelete]
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
  // 4. Insert new
  const newItems = items.filter((i) => !i.id);
  if (newItems.length) {
    const values = newItems.flatMap((i) => [
      societyId, // $1
      buildingId, // $2
      flatId, // $3
      i.amount, // $4
      i.reason, // $5
      userId, // $6 (created_by)
      userId, // $7 (updated_by)
    ]);

    const queryText = `
    INSERT INTO flat_maintenances 
      (society_id, building_id, flat_id, amount, reason, created_by, created_at, updated_by, updated_at)
    VALUES ${newItems
      .map(
        (_, idx) =>
          `($${idx * 7 + 1}, $${idx * 7 + 2}, $${idx * 7 + 3}, $${
            idx * 7 + 4
          }, $${idx * 7 + 5}, $${idx * 7 + 6}, NOW(), $${idx * 7 + 7}, NOW())`
      )
      .join(", ")}
  `;

    console.log("queryText", queryText);
    console.log("values", values);

    await queryWithClient(client, queryText, values);
  }
};

// export const deleteFlat = async (
//   flatId: string,
//   buildingId: string,
//   societyId: string,
//   userId: string,
//   client: PoolClient
// ) => {
//   try {
//     // 1. Soft delete the flat
//     const deleteFlatQuery = `
//       UPDATE flats
//       SET is_deleted = true,
//           deleted_at = NOW(),
//           updated_by = $4,
//           updated_at = NOW(),
//           deleted_by = $4
//       WHERE id = $1
//         AND building_id = $2
//         AND society_id = $3
//         AND is_occupied = false
//       RETURNING id
//     `;

//     const flatResult = await queryWithClient(client, deleteFlatQuery, [
//       flatId,
//       buildingId,
//       societyId,
//       userId,
//     ]);

//     if (flatResult.rowCount === 0) {
//       throw new Error("Flat is already occupied");
//     }

//     // 2. Soft delete related flat_maintenances
//     const deleteMaintenanceQuery = `
//       UPDATE flat_maintenances
//       SET is_deleted = true,
//           deleted_at = NOW(),
//           updated_by = $3,
//           updated_at = NOW(),
//           deleted_by = $3
//       WHERE flat_id = $1
//         AND society_id = $2
//       returning *
//     `;

//     const maintenanceResult = await queryWithClient(
//       client,
//       deleteMaintenanceQuery,
//       [flatId, societyId, userId]
//     );

//     const queryDeleteMonthlySettlement = `
//       UPDATE flat_maintenance_settlements
//       SET is_deleted = true,
//           deleted_at = NOW(),
//           updated_by = $3,
//           updated_at = NOW(),
//           deleted_by = $3
//       WHERE flat_maintenance_id = ANY($4::uuid[])
//     `;

//     await queryWithClient(client, queryDeleteMonthlySettlement, [
//       flatId,
//       societyId,
//       userId,
//       maintenanceResult.rows.map((r) => r.id),
//     ]);

//     const queryFlatMaintenanceMonthly = `
//       UPDATE flat_maintenance_monthly
//       SET is_deleted = true,
//           deleted_at = NOW(),
//           updated_by = $3,
//           updated_at = NOW(),
//           deleted_by = $3
//       WHERE flat_maintenance_id = ANY($4::uuid[])
//     `;

//     await queryWithClient(client, queryFlatMaintenanceMonthly, [
//       flatId,
//       societyId,
//       userId,
//       maintenanceResult.rows.map((r) => r.id),
//     ]);

//     return { success: true, flatId };
//   } catch (error: any) {
//     throw new Error(`${error.message}`);
//   }
// };
export const deleteFlat = async (
  flatId: string,
  buildingId: string,
  societyId: string,
  userId: string,
  client: PoolClient
) => {
  try {
    // 1. Soft delete the flat
    const deleteFlatQuery = `
      UPDATE flats
      SET is_deleted = true,
          deleted_at = NOW(),
          updated_by = $4,
          updated_at = NOW(),
          deleted_by = $4
      WHERE id = $1 
        AND building_id = $2 
        AND society_id = $3 
        AND is_occupied = false
      RETURNING id
    `;

    const flatResult = await queryWithClient(client, deleteFlatQuery, [
      flatId,
      buildingId,
      societyId,
      userId,
    ]);

    if (flatResult.rowCount === 0) {
      throw new Error("Flat not found or already occupied");
    }

    // 2. Soft delete related flat_maintenances
    const deleteMaintenanceQuery = `
      UPDATE flat_maintenances
      SET is_deleted = true,
          deleted_at = NOW(),
          updated_by = $3,
          updated_at = NOW(),
          deleted_by = $3
      WHERE flat_id = $1 
        AND society_id = $2
      RETURNING id
    `;

    const maintenanceResult = await queryWithClient(
      client,
      deleteMaintenanceQuery,
      [flatId, societyId, userId]
    );

    const maintenanceIds = maintenanceResult.rows.map((r) => r.id);
    if (maintenanceIds.length > 0) {
      // 3. Soft delete related settlements
      const queryDeleteMonthlySettlement = `
        UPDATE flat_maintenance_settlements
        SET is_deleted = true,
            deleted_at = NOW(),
            updated_by = $1,
            updated_at = NOW(),
            deleted_by = $1
        WHERE maintenance_id = ANY($2::uuid[])
      `;

      await queryWithClient(client, queryDeleteMonthlySettlement, [
        userId,
        maintenanceIds,
      ]);

      // 4. Soft delete related monthly records
      const queryFlatMaintenanceMonthly = `
        UPDATE flat_maintenance_monthly
        SET is_deleted = true,
            deleted_at = NOW(),
            updated_by = $1,
            updated_at = NOW(),
            deleted_by = $1
        WHERE maintenance_id = ANY($2::uuid[])
      `;

      await queryWithClient(client, queryFlatMaintenanceMonthly, [
        userId,
        maintenanceIds,
      ]);
    }

    return { success: true, flatId };
  } catch (error: any) {
    throw new Error(`deleteFlat failed: ${error.message}`);
  }
};
