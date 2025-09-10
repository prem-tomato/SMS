import { query } from "@/db/database-connect";
import { UpdateBuildingReqBody } from "./building.types";

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
