import { query } from "@/db/database-connect";
import { HOUSING } from "@/db/utils/enums/enum";
import { QueryResult } from "pg";
import { User } from "../auth/auth.types";
import {
  AddAdminReqBody,
  AddBuildingReqBody,
  AddEndDateReqBody,
  AddExpenseTrackingReqBody,
  AddflatPenaltyReqBody,
  AddFlatReqBody,
  AddHousingUnitReqBody,
  AddIncomeTrackingReqBody,
  AddMemberReqBody,
  AddNoticeReqBody,
  AddSocietyReqBody,
  AssignedFlatOptions,
  AssignFlatMembers,
  AssignMemberReqBody,
  Building,
  BuildingResponseForSociety,
  ExpenseTrackingResponse,
  Flat,
  FlatOptions,
  FlatPenalty,
  FlatView,
  HousingOptions,
  HousingUnits,
  IncomeTrackingResponse,
  MaintenanceView,
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
        INSERT INTO societies (name, address, city, state, country, created_by, created_at, opening_balance, society_type)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8)
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
      society.society_type,
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
  reqBody: Omit<AddFlatReqBody, "pending_maintenance">,
  buildingId: string,
  societyId: string,
  userId: string
): Promise<Flat> => {
  try {
    const queryText: string = `
      INSERT INTO flats (
        society_id, 
        building_id, 
        flat_number, 
        floor_number, 
        created_by, 
        square_foot, 
        current_maintenance
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const res: QueryResult<Flat> = await query<Flat>(queryText, [
      societyId,
      buildingId,
      reqBody.flat_number,
      reqBody.floor_number,
      userId,
      reqBody.square_foot,
      reqBody.current_maintenance,
    ]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error adding flat to building: ${error}`);
  }
};

export const addFlatMaintenance = async (
  items: { amount: number; reason: string }[],
  params: { id: string; buildingId: string },
  flatId: string,
  createdBy: string
): Promise<void> => {
  if (!items.length) return;

  const queryText = `
    INSERT INTO flat_maintenances (
      society_id,
      building_id,
      flat_id,
      amount,
      reason,
      created_by,
      created_at,
      updated_by,
      updated_at
    )
    VALUES ${items
      .map(
        (_, idx) =>
          `($1, $2, $3, $${idx * 2 + 4}, $${idx * 2 + 5}, $${
            items.length * 2 + 4
          }, NOW(), $${items.length * 2 + 4}, NOW())`
      )
      .join(", ")}
  `;

  const values = [
    params.id, // $1
    params.buildingId, // $2
    flatId, // $3
    ...items.flatMap((item) => [item.amount ?? 0, item.reason ?? ""]),
    createdBy,
  ];

  await query(queryText, values);
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
  id: string; // Assuming this is society_id
  buildingId: string;
  flatId: string;
}): Promise<FlatView> => {
  try {
    const queryText: string = `
      SELECT 
        f.id,
        f.flat_number,
        f.floor_number,
        f.is_occupied,
        b.name AS building_name,
        s.name AS society_name,
        f.square_foot,
        f.current_maintenance,
        s.id AS society_id,
        b.id AS building_id,
        f.created_at,
        f.created_by,
        (
          SELECT json_agg(
            json_build_object(
              'id', fp.id,
              'amount', fp.amount,
              'reason', fp.reason,
              'created_at', fp.created_at,
              'action_by', CONCAT(pu.first_name, ' ', pu.last_name)
            )
          )
          FROM flat_penalties fp
          LEFT JOIN users pu ON pu.id = fp.created_by
          WHERE fp.flat_id = f.id AND fp.is_paid = false AND fp.is_deleted = false
        ) AS penalties,

        (
          SELECT json_agg(
            json_build_object(
              'id', fm.id,
              'amount', fm.amount,
              'reason', fm.reason,
              'created_at', fm.created_at,
              'action_by', CONCAT(fmu.first_name, ' ', fmu.last_name)
            )
          )
          FROM flat_maintenances fm
          LEFT JOIN users fmu ON fmu.id = fm.updated_by
          WHERE fm.flat_id = f.id AND fm.is_deleted = false AND fm.amount_type IS NULL 
        ) AS maintenances,

        CONCAT(u.first_name, ' ', u.last_name) AS action_by

      FROM flats f
      LEFT JOIN buildings b ON b.id = f.building_id
      LEFT JOIN societies s ON s.id = f.society_id
      LEFT JOIN users u ON u.id = f.created_by

      WHERE f.society_id = $1 AND f.building_id = $2 AND f.id = $3

    `;

    const res: QueryResult<FlatView> = await query<FlatView>(queryText, [
      params.id,
      params.buildingId,
      params.flatId,
    ]);

    return res.rows[0];
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    throw new Error(`Error getting flats: ${err}`);
  }
};

export const listSocieties = async (): Promise<Societies[]> => {
  try {
    const queryText: string = `
      SELECT *,
            (end_date IS NULL OR end_date >= CURRENT_DATE) AS is_active
      FROM societies
      WHERE is_deleted = false
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

export const listSocietiesOptionsForFlats = async (): Promise<
  SocietyOptions[]
> => {
  try {
    const queryText: string = `
      SELECT id, name
      FROM societies
      WHERE is_deleted = false
        AND society_type <> 'housing';
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

export const listVacantHouseUnits = async (
  societyId: string
): Promise<HousingOptions[]> => {
  try {
    const queryText: string = `
      SELECT
        hu.id,
        hu.unit_number,
        hu.unit_type,
        hu.is_occupied,
        hu.square_foot,
        societies.name AS society_name
      FROM housing_units hu
      LEFT JOIN societies ON societies.id = hu.society_id
      WHERE hu.society_id = $1 AND hu.is_occupied = false
    `;

    const res: QueryResult<HousingOptions> = await query<HousingOptions>(
      queryText,
      [societyId]
    );

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

export const addExpenseTracking = async (
  reqBody: AddExpenseTrackingReqBody,
  societyId: string,
  userId: string
): Promise<void> => {
  try {
    const queryText: string = `
      INSERT INTO expense_tracking (
        expense_type,
        expense_amount,
        expense_reason,
        expense_month,
        expense_year,
        society_id,
        created_by,
        created_at,
        updated_by,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $7, NOW())
    `;

    await query(queryText, [
      reqBody.expense_type,
      reqBody.expense_amount,
      reqBody.expense_reason,
      reqBody.expense_month,
      reqBody.expense_year,
      societyId,
      userId,
    ]);
  } catch (error) {
    throw new Error(`Error adding expense tracking: ${error}`);
  }
};

export const addIncomeTracking = async (
  reqBody: AddIncomeTrackingReqBody,
  societyId: string,
  userId: string
): Promise<void> => {
  try {
    const queryText: string = `
      INSERT INTO income_tracking (
        income_type,
        income_amount,
        income_reason,
        income_month,
        income_year,
        society_id,
        created_by,
        created_at,
        updated_by,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $7, NOW())
    `;

    await query(queryText, [
      reqBody.income_type,
      reqBody.income_amount,
      reqBody.income_reason,
      reqBody.income_month,
      reqBody.income_year,
      societyId,
      userId,
    ]);
  } catch (error) {
    throw new Error(`Error adding income tracking: ${error}`);
  }
};

export const getExpenseTracking = async (
  societyId?: string
): Promise<ExpenseTrackingResponse[]> => {
  try {
    const values: any[] = [];
    let whereClause: string = "";
    if (societyId) {
      values.push(societyId);
      whereClause = `WHERE et.society_id = $1`;
    }

    const queryText: string = `
      SELECT 
        et.id,
        et.expense_type,
        et.expense_amount,
        et.expense_reason,
        s.name AS society_name,
        et.expense_month,
        et.expense_year,
        concat(u.first_name, ' ', u.last_name) AS action_by
      FROM expense_tracking et
      LEFT JOIN societies s ON s.id = et.society_id
      LEFT JOIN users u ON u.id = et.updated_by
      ${whereClause}
    `;

    const res: QueryResult<ExpenseTrackingResponse> =
      await query<ExpenseTrackingResponse>(queryText, values);

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting expense tracking: ${error}`);
  }
};

export const getIncomeTracking = async (
  societyId?: string
): Promise<IncomeTrackingResponse[]> => {
  try {
    const values: any[] = [];
    let whereClause: string = "";
    if (societyId) {
      values.push(societyId);
      whereClause = `WHERE et.society_id = $1`;
    }

    const queryText: string = `
      SELECT 
        et.id,
        et.income_type,
        et.income_amount,
        et.income_reason,
        s.name AS society_name,
        et.income_month,
        et.income_year,
        concat(u.first_name, ' ', u.last_name) AS action_by
      FROM income_tracking et
      LEFT JOIN societies s ON s.id = et.society_id
      LEFT JOIN users u ON u.id = et.updated_by
      ${whereClause}
    `;

    const res: QueryResult<IncomeTrackingResponse> =
      await query<IncomeTrackingResponse>(queryText, values);

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting expense tracking: ${error}`);
  }
};

export const addFlatPenalty = async (
  reqBody: AddflatPenaltyReqBody,
  params: {
    id: string;
    buildingId: string;
    flatId: string;
  },
  userId: string
): Promise<void> => {
  try {
    const queryText: string = `
      INSERT INTO flat_penalties
      (amount, reason, flat_id, society_id, building_id, created_by, created_at, updated_by, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $6, NOW())
    `;

    await query(queryText, [
      reqBody.amount,
      reqBody.reason,
      params.flatId,
      params.id,
      params.buildingId,
      userId,
    ]);
  } catch (error) {
    throw new Error(`Error adding flat penalty: ${error}`);
  }
};

export const updateMonthlyDues = async (
  params: {
    id: string;
    buildingId: string;
    flatId: string;
    recordId: string;
  },
  userId: string
): Promise<void> => {
  try {
    const queryText = `
        UPDATE member_monthly_maintenance_dues
        SET 
          maintenance_paid = TRUE,
          maintenance_paid_at = NOW(),
          updated_by = $1,
          updated_at = NOW()
        WHERE flat_id = $2 AND society_id = $3 AND building_id = $4 AND id = $5
      `;

    await query(queryText, [
      userId,
      params.flatId,
      params.id,
      params.buildingId,
      params.recordId,
    ]);
  } catch (error) {
    throw new Error(`Error updating monthly dues: ${error}`);
  }
};

export const findFlatPenaltyById = async (
  id: string
): Promise<FlatPenalty | undefined> => {
  try {
    const queryText: string = `
            SELECT * FROM flat_penalties
            WHERE id = $1 AND is_paid = FALSE AND is_deleted = FALSE
        `;

    const res: QueryResult<FlatPenalty> = await query<FlatPenalty>(queryText, [
      id,
    ]);

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error finding flat penalty by ID: ${error}`);
  }
};

export const markFlatPenaltyPaid = async (
  params: {
    id: string;
    buildingId: string;
    flatId: string;
    penaltyId: string;
  },
  userId: string
): Promise<void> => {
  try {
    const queryText: string = `
      UPDATE flat_penalties
      SET is_paid = TRUE,
        paid_at = NOW(),
        updated_by = $1,
        updated_at = NOW()
      WHERE id = $2 AND society_id = $3 AND building_id = $4 AND flat_id = $5 AND is_paid = FALSE AND is_deleted = FALSE
`;

    await query(queryText, [
      userId,
      params.penaltyId,
      params.id,
      params.buildingId,
      params.flatId,
    ]);
  } catch (error) {
    throw new Error(`Error marking flat penalty as paid: ${error}`);
  }
};

export const markFlatPenaltyDeleted = async (
  params: {
    id: string;
    buildingId: string;
    flatId: string;
    penaltyId: string;
  },
  userId: string
): Promise<void> => {
  try {
    const queryText: string = `
      UPDATE flat_penalties
      SET is_deleted = TRUE,
        deleted_at = NOW(),
        updated_by = $1,
        updated_at = NOW(),
        deleted_by = $1
      WHERE id = $2 AND society_id = $3 AND building_id = $4 AND flat_id = $5 AND is_deleted = FALSE AND is_paid = FALSE
`;

    await query(queryText, [
      userId,
      params.penaltyId,
      params.id,
      params.buildingId,
      params.flatId,
    ]);
  } catch (error) {
    throw new Error(`Error marking flat penalty as deleted: ${error}`);
  }
};

export const getFlatMaintenanceDetails = async (
  societyId: string,
  buildingId: string,
  flatId: string
): Promise<MaintenanceView[]> => {
  try {
    const queryText: string = `
      SELECT
        fm.id AS maintenance_id,
        fm.society_id,
        fm.building_id,
        fm.flat_id,
        fm.amount_type,
        fm.amount AS maintenance_amount,
        fm.reason,
        fm.created_at,
        fm.updated_at,
        fm.created_by,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', fms.id,
              'settlement_amount', fms.settlement_amount,
              'created_at', fms.created_at,
              'is_paid', fms.is_paid,
              'paid_at', fms.paid_at
            )
          ) FILTER (WHERE fms.id IS NOT NULL), 
          '[]'::json
        ) AS settlements,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', fmm.id,
              'month', fmm.month,
              'amount', fmm.amount,
              'created_at', fmm.created_at,
              'paid', fmm.is_paid,
              'paid_at', fmm.paid_at
            )
          ) FILTER (WHERE fmm.id IS NOT NULL), 
          '[]'::json
        ) AS monthly_maintenance

      FROM flat_maintenances fm
      LEFT JOIN flat_maintenance_settlements fms 
        ON fms.maintenance_id = fm.id
      LEFT JOIN flat_maintenance_monthly fmm 
        ON fmm.maintenance_id = fm.id
      WHERE fm.society_id = $1
        AND fm.building_id = $2
        AND fm.flat_id = $3
        AND fm.is_deleted = false
      GROUP BY 
        fm.id, 
        fm.society_id, 
        fm.building_id, 
        fm.flat_id, 
        fm.amount_type, 
        fm.amount, 
        fm.reason,
        fm.created_at,
        fm.updated_at,
        fm.created_by
      ORDER BY fm.created_at DESC
    `;

    const res: QueryResult<MaintenanceView> = await query<MaintenanceView>(
      queryText,
      [societyId, buildingId, flatId]
    );

    return res.rows;
  } catch (error) {
    throw new Error(`Error getting flat maintenance details: ${error}`);
  }
};

export const softDeleteSociety = async (
  societyId: string,
  userId: string
): Promise<void> => {
  try {
    const queryText: string = `
      UPDATE societies
      SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = $2,
        updated_at = NOW(),
        updated_by = $2
      WHERE id = $1
    `;

    await query(queryText, [societyId, userId]);
  } catch (error) {
    throw new Error(`Error soft deleting society: ${error}`);
  }
};

export const checkSocietyInBuilding = async (
  societyId: string
): Promise<string | undefined> => {
  try {
    const queryText: string = `
      SELECT id FROM buildings
      WHERE society_id = $1
    `;

    const res: QueryResult<{ id: string | undefined }> = await query<{
      id: string | undefined;
    }>(queryText, [societyId]);

    return res.rows[0]?.id;
  } catch (error) {
    throw new Error(`Error soft deleting society: ${error}`);
  }
};

export const addHousingUnit = async (
  societyId: string,
  body: AddHousingUnitReqBody,
  userId: string
): Promise<HousingUnits> => {
  try {
    const queryText: string = `
      INSERT INTO housing_units (
        society_id,
        unit_type,
        unit_number,
        square_foot,
        current_maintenance,
        created_by,
        created_at,
        updated_by,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        NOW(),
        $6,
        NOW()
      )
      RETURNING *
    `;

    const res: QueryResult<HousingUnits> = await query<HousingUnits>(
      queryText,
      [
        societyId,
        body.unit_type,
        body.unit_number,
        body.square_foot,
        body.current_maintenance,
        userId,
      ]
    );

    return res.rows[0];
  } catch (error) {
    throw new Error(`Error adding housing unit: ${error}`);
  }
};

export const listSocietiesHousingOptions = async (
  societyId?: string
): Promise<SocietyOptions[]> => {
  try {
    const isListingSocieties = !societyId;

    const tableName = isListingSocieties ? "societies" : "housing_units";
    const filterColumn = isListingSocieties ? "society_type" : "society_id";
    const filterValue = isListingSocieties ? HOUSING : societyId;

    const queryText = `
      SELECT id, ${
        isListingSocieties ? "name" : "unit_number"
      } FROM ${tableName}
      WHERE is_deleted = FALSE AND ${filterColumn} = $1
    `;

    const { rows } = await query<SocietyOptions>(queryText, [filterValue]);

    return rows;
  } catch (error) {
    throw new Error(`Error getting options: ${error}`);
  }
};

export const findHousingUnitById = async (
  housingId: string
): Promise<HousingUnits | undefined> => {
  try {
    const queryText = `
      SELECT * FROM housing_units
      WHERE is_deleted = FALSE AND id = $1
    `;

    const { rows } = await query<HousingUnits>(queryText, [housingId]);

    return rows[0];
  } catch (error) {
    throw new Error(`Error getting housing unit: ${error}`);
  }
};

export const assignHousingUnitToMember = async (
  userIds: string[],
  moveInDate: string,
  params: { id: string; housingId: string },
  createdBy: string
): Promise<void> => {
  try {
    const values = userIds
      .map(
        (userId) =>
          `('${userId}', '${params.id}', '${params.housingId}', '${moveInDate}', '${createdBy}')`
      )
      .join(",");

    const queryText: string = `
    INSERT INTO members
    (user_id, society_id, housing_id, move_in_date, created_by)
    VALUES ${values}
    RETURNING *
  `;

    await query(queryText);
  } catch (error) {
    throw new Error(`error in assigning member ${error}`);
  }
};

export const toggleForIsOccupiedForHousing = async (
  housingId: string,
  isOccupied: boolean
): Promise<void> => {
  try {
    const queryText: string = `
      UPDATE housing_units
      SET is_occupied = $1
      WHERE id = $2
    `;

    await query(queryText, [isOccupied, housingId]);
  } catch (error) {
    throw new Error(`Error toggling for is occupied: ${error}`);
  }
};
