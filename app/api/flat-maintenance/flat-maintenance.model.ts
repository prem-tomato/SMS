import { query, queryWithClient } from "@/db/database-connect";
import { PoolClient, QueryResult } from "pg";
import {
  FlatMaintenance,
  FlatMaintenanceMonthly,
  FlatMaintenanceSettlement,
} from "./flat-maintenance.types";

export const findFlatMaintenanceById = async (
  id: string
): Promise<FlatMaintenance | undefined> => {
  try {
    const queryText: string = `
            SELECT * FROM flat_maintenances
            WHERE id = $1
        `;

    const res: QueryResult<FlatMaintenance> = await query<FlatMaintenance>(
      queryText,
      [id]
    );

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error finding flat maintenance by ID: ${error}`);
  }
};

export const markAmountTypeInFlats = async (
  client: PoolClient,
  flatMaintenanceId: string,
  amountType: string
): Promise<void> => {
  try {
    const queryText: string = `
            UPDATE flat_maintenances
            SET amount_type = $1
            WHERE id = $2
        `;

    await queryWithClient(client, queryText, [amountType, flatMaintenanceId]);
  } catch (error) {
    throw new Error(`Error marking amount type in flats: ${error}`);
  }
};

export const addFlatMaintenanceSettlement = async (
  client: PoolClient,
  settlementAmount: number,
  flatMaintenanceId: string,
  userId: string
): Promise<void> => {
  try {
    const queryText: string = `
            INSERT INTO flat_maintenance_settlements (maintenance_id, settlement_amount, created_by)
            VALUES ($1, $2, $3)
        `;

    await queryWithClient(client, queryText, [
      flatMaintenanceId,
      settlementAmount,
      userId,
    ]);
  } catch (error) {
    throw new Error(`Error adding flat maintenance settlement: ${error}`);
  }
};

export const addQuaterlyFlatMaintenance = async (
  client: PoolClient,
  flatMaintenanceId: string,
  months: { month: number; amount: number }[],
  createdBy: string
): Promise<void> => {
  try {
    const values: any[] = [];
    const valueClauses: string[] = [];

    months.forEach((m, i) => {
      const baseIndex = i * 4;
      valueClauses.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${
          baseIndex + 4
        })`
      );
      values.push(flatMaintenanceId, m.month, m.amount, createdBy);
    });

    const queryText: string = `
      INSERT INTO flat_maintenance_monthly (
        maintenance_id, month, amount, created_by
      )
      VALUES ${valueClauses.join(", ")}
    `;

    await queryWithClient(client, queryText, values);
  } catch (error) {
    throw new Error(`Error adding quaterly flat maintenance: ${error}`);
  }
};

export const addHalfYearlyFlatMaintenance = async (
  client: PoolClient,
  flatMaintenanceId: string,
  months: { month: number; amount: number }[],
  createdBy: string
): Promise<void> => {
  try {
    const values: any[] = [];
    const valueClauses: string[] = [];

    months.forEach((m, i) => {
      const baseIndex = i * 4;
      valueClauses.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${
          baseIndex + 4
        })`
      );
      values.push(flatMaintenanceId, m.month, m.amount, createdBy);
    });

    const queryText: string = `
      INSERT INTO flat_maintenance_monthly (
        maintenance_id, month, amount, created_by
      )
      VALUES ${valueClauses.join(", ")}
    `;

    await queryWithClient(client, queryText, values);
  } catch (error) {
    throw new Error(`Error adding half yearly flat maintenance: ${error}`);
  }
};

export const addYearlyFlatMaintenance = async (
  client: PoolClient,
  flatMaintenanceId: string,
  months: { month: number; amount: number }[],
  createdBy: string
): Promise<void> => {
  try {
    const queryText: string = `
      INSERT INTO flat_maintenance_monthly (
          maintenance_id, month, amount, created_by
      )
      VALUES ${months
        .map(
          (month) =>
            `('${flatMaintenanceId}', ${month.month}, ${month.amount}, '${createdBy}')`
        )
        .join(", ")}
    `;

    await queryWithClient(client, queryText);
  } catch (error) {
    throw new Error(`Error adding yearly flat maintenance: ${error}`);
  }
};

export const findMonthlyMaintenanceById = async (
  id: string
): Promise<FlatMaintenanceMonthly | undefined> => {
  try {
    const queryText: string = `
            SELECT * FROM flat_maintenance_monthly
            WHERE id = $1
        `;

    const res: QueryResult<FlatMaintenanceMonthly> =
      await query<FlatMaintenanceMonthly>(queryText, [id]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error finding monthly maintenance by ID: ${error}`);
  }
};

export const markMonthlyMaintenanceAsPaid = async (
  monthlyMaintenanceId: string,
  flatMaintenanceId: string
): Promise<void> => {
  try {
    const queryText: string = `
            UPDATE flat_maintenance_monthly
            SET is_paid = TRUE,
                paid_at = NOW()
            WHERE id = $1 AND maintenance_id = $2
        `;

    await query(queryText, [monthlyMaintenanceId, flatMaintenanceId]);
  } catch (error) {
    throw new Error(`Error marking monthly maintenance as paid: ${error}`);
  }
};

export const findFlatMaintenanceSettlementById = async (
  id: string
): Promise<FlatMaintenanceSettlement | undefined> => {
  try {
    const queryText: string = `
            SELECT * FROM flat_maintenance_settlements
            WHERE id = $1
        `;

    const res: QueryResult<FlatMaintenanceSettlement> =
      await query<FlatMaintenanceSettlement>(queryText, [id]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error finding settlement by ID: ${error}`);
  }
};

export const markSettlementAsPaid = async (
  settlementId: string,
  flatMaintenanceId: string
): Promise<void> => {
  try {
    const queryText: string = `
            UPDATE flat_maintenance_settlements
            SET is_paid = TRUE,
                paid_at = NOW()
            WHERE id = $1 AND maintenance_id = $2
        `;

    await query(queryText, [settlementId, flatMaintenanceId]);
  } catch (error) {
    throw new Error(`Error marking settlement as paid: ${error}`);
  }
};
