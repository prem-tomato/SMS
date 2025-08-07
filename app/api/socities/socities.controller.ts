import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
  Transaction,
} from "@/db/configs/acid";
import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import socitiesLogger from "./socities.logger";
import {
  addAdmin,
  addBuilding,
  addExpenseTracking,
  addFlat,
  addFlatMaintenance,
  addFlatPenalty,
  addHousingUnit,
  addHousingUnitPenalty,
  addIncomeTracking,
  addMember,
  addSocieties,
  assignHousingUnitToMember,
  assignMembersToFlat,
  checkLoginKeyUnique,
  checkSocietyInBuilding,
  createNotice,
  deleteHousingUnitPenalty,
  deleteSocietyModel,
  findBuildingById,
  findFlatById,
  findFlatPenaltyById,
  findHousingPenaltyById,
  findHousingUnitById,
  findSocietyById,
  findSocityByName,
  getAssignedFlatsUser,
  getBuildings,
  getBuildingsBySociety,
  getExpenseTracking,
  getFlatMaintenanceDetails,
  getFlats,
  getIncomeTracking,
  getNotices,
  getSocieties,
  listFlats,
  listHousingUnitPenalties,
  listOccupiedHouseUnits,
  listSocieties,
  listSocietiesHousingOptions,
  listSocietiesOptions,
  listSocietiesOptionsForFlats,
  listVacantFlats,
  listVacantHouseUnits,
  markFlatPenaltyDeleted,
  markFlatPenaltyPaid,
  softDeleteSociety,
  toggleForIsOccupied,
  toggleForIsOccupiedForHousing,
  toggleNoticeStatus,
  updateEndDate,
  updateHousingUnitPenalty,
  updateMonthlyDues,
} from "./socities.model";
import {
  AddAdminReqBody,
  AddBuildingReqBody,
  AddEndDateReqBody,
  AddExpenseTrackingReqBody,
  AddflatPenaltyReqBody,
  AddFlatReqBody,
  AddHousingUnitPenaltyReqBody,
  AddHousingUnitReqBody,
  AddIncomeTrackingReqBody,
  AddMemberReqBody,
  AddNoticeReqBody,
  AddSocietyReqBody,
  AdminResponse,
  AssignedFlatOptions,
  AssignHousingUnitReqBody,
  AssignMemberReqBody,
  Building,
  BuildingResponse,
  BuildingResponseForSociety,
  ExpenseTrackingResponse,
  Flat,
  FlatOptions,
  FlatPenalty,
  FlatResponse,
  FlatView,
  HousingOptions,
  HousingUnitPenalty,
  HousingUnits,
  IncomeTrackingResponse,
  MaintenanceView,
  MemberResponse,
  NoticeResponse,
  Societies,
  SocietyOptions,
} from "./socities.types";

export const addSocietyController = async (
  request: Request,
  reqBody: AddSocietyReqBody
): Promise<Response<Societies>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const CheckSociteyName: Societies | undefined = await findSocityByName(
      reqBody.name
    );
    if (CheckSociteyName) {
      return generateResponseJSON(
        StatusCodes.BAD_REQUEST,
        getMessage("SOCIETY_NAME_ALREADY_EXISTS")
      );
    }

    const addSocietiesPayload = {
      ...reqBody,
      created_by: userId,
    };

    const society = await addSocieties(addSocietiesPayload);

    return generateResponseJSON(
      StatusCodes.CREATED,
      getMessage("SOCIETY_CREATED_SUCCESSFULLY"),
      society
    );
  } catch (error: any) {
    socitiesLogger.error("Error in addSocietyController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const addAdminController = async (
  request: Request,
  reqBody: AddAdminReqBody,
  societyId: string
): Promise<Response<AdminResponse>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    // Check if the society exists
    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const loginKeyUnique: string | undefined = await checkLoginKeyUnique(
      reqBody.login_key
    );
    if (loginKeyUnique) {
      return generateResponseJSON(
        StatusCodes.BAD_REQUEST,
        getMessage("LOGIN_KEY_ALREADY_EXISTS")
      );
    }

    const admin = await addAdmin(reqBody, societyId, userId);

    const responseData = {
      society_name: society.name,
      role: admin.role,
      first_name: admin.first_name,
      phone: admin.phone,
    };

    return generateResponseJSON(
      StatusCodes.CREATED,
      getMessage("ADMIN_CREATED_SUCCESSFULLY"),
      { data: responseData }
    );
  } catch (error: any) {
    socitiesLogger.error("Error in addAdminController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const addMemberController = async (
  request: Request,
  reqBody: AddMemberReqBody,
  societyId: string
): Promise<Response<MemberResponse>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    // Check if the society exists

    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const loginKeyUnique: string | undefined = await checkLoginKeyUnique(
      reqBody.login_key
    );
    if (loginKeyUnique) {
      return generateResponseJSON(
        StatusCodes.BAD_REQUEST,
        getMessage("LOGIN_KEY_ALREADY_EXISTS")
      );
    }

    const member = await addMember(reqBody, societyId, userId);
    const responseData = {
      society_name: society.name,
      role: member.role,
      first_name: member.first_name,
      phone: member.phone,
    };

    return generateResponseJSON(
      StatusCodes.CREATED,
      getMessage("MEMBER_CREATED_SUCCESSFULLY"),
      { data: responseData }
    );
  } catch (error: any) {
    socitiesLogger.error("Error in addMemberController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const addBuildingController = async (
  request: Request,
  reqBody: AddBuildingReqBody,
  societyId: string
): Promise<Response<BuildingResponse>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    // Check if the society exists

    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const building = await addBuilding(reqBody, societyId, userId);

    const responseData = {
      society_name: society.name,
      building_name: building.name,
      total_floors: building.total_floors,
    };

    return generateResponseJSON(
      StatusCodes.CREATED,
      getMessage("BUILDING_CREATED_SUCCESSFULLY"),
      { data: responseData }
    );
  } catch (error: any) {
    socitiesLogger.error("Error in addBuildingController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const addFlatController = async (
  request: Request,
  reqBody: AddFlatReqBody,
  params: {
    id: string;
    buildingId: string;
  }
): Promise<Response<FlatResponse>> => {
  const transaction: Transaction = await startTransaction();
  const { client } = transaction;
  try {
    const { pending_maintenance, ...restPayload } = reqBody;

    const userId: string = request.headers.get("userId")!;

    // Check if the society exists
    const society: Societies | undefined = await findSocietyById(params.id);
    if (!society) {
      await rollbackTransaction(transaction);
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    // Check if the building exists
    const building: Building | undefined = await findBuildingById(
      params.buildingId
    );
    if (!building) {
      await rollbackTransaction(transaction);
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("BUILDING_NOT_FOUND")
      );
    }

    if (reqBody.floor_number > building.total_floors) {
      await rollbackTransaction(transaction);
      return generateResponseJSON(
        StatusCodes.BAD_REQUEST,
        `Floor number ${reqBody.floor_number} is greater than total floors ${building.total_floors}`
      );
    }

    const flat = await addFlat(
      restPayload,
      params.buildingId,
      params.id,
      userId
    );

    if (pending_maintenance) {
      await addFlatMaintenance(
        pending_maintenance as { amount: number; reason: string }[],
        params,
        flat.id,
        userId
      );
    }

    const responseData = {
      society_name: society.name,
      building_name: building.name,
      flat_number: flat.flat_number,
      floor_number: flat.floor_number,
    };

    await commitTransaction(transaction);

    return generateResponseJSON(
      StatusCodes.CREATED,
      getMessage("FLAT_CREATED_SUCCESSFULLY"),
      { data: responseData }
    );
  } catch (error: any) {
    socitiesLogger.error("Error in addFlatController:", error);

    await rollbackTransaction(transaction);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const assignMemberController = async (
  request: Request,
  reqBody: AssignMemberReqBody,
  params: {
    id: string;
    buildingId: string;
    flatId: string;
  }
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    // Check if the society exists
    const society: Societies | undefined = await findSocietyById(params.id);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    // Check if the building exists
    const building: Building | undefined = await findBuildingById(
      params.buildingId
    );
    if (!building) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("BUILDING_NOT_FOUND")
      );
    }

    // Check if the flat exists
    const flat: Flat | undefined = await findFlatById(params.flatId);
    if (!flat) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("FLAT_NOT_FOUND")
      );
    }

    await assignMembersToFlat(reqBody.user_id, reqBody, params, userId);

    await toggleForIsOccupied(params.flatId, true);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("MEMBER_ASSIGNED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in assignMemberController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const assignHousingUnitController = async (
  request: Request,
  reqBody: AssignHousingUnitReqBody,
  params: {
    id: string;
    housingId: string;
  }
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    // Check if the society exists
    const society: Societies | undefined = await findSocietyById(params.id);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const housing: HousingUnits | undefined = await findHousingUnitById(
      params.housingId
    );
    if (!housing) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("HOUSING_NOT_FOUND")
      );
    }

    await assignHousingUnitToMember(
      reqBody.user_id,
      reqBody.move_in_date,
      params,
      userId
    );

    await toggleForIsOccupiedForHousing(params.housingId, true);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("MEMBER_ASSIGNED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in assignHousingUnitController:", error);
    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

// get APIs

export const getSocietiesController = async (
  request: Request,
  societyId: string
): Promise<Response<Societies[]>> => {
  try {
    const societies: Societies[] = await getSocieties(societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      societies
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getSocietiesController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getBuildingsController = async (params: {
  id: string;
  buildingId: string;
}): Promise<Response<Building[]>> => {
  try {
    const buildings: Building[] = await getBuildings(params);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      buildings
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getBuildingsController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getFlatsController = async (params: {
  id: string;
  buildingId: string;
  flatId: string;
}): Promise<Response<FlatView>> => {
  try {
    const flats: FlatView = await getFlats(params);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      flats
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getFlatsController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const listSocietiesController = async (): Promise<
  Response<Societies[]>
> => {
  try {
    const societies: Societies[] = await listSocieties();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      societies
    );
  } catch (error: any) {
    socitiesLogger.error("Error in listSocietiesController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const listSocietiesOptionsController = async (): Promise<
  Response<SocietyOptions[]>
> => {
  try {
    const societies: SocietyOptions[] = await listSocietiesOptions();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      societies
    );
  } catch (error: any) {
    socitiesLogger.error("Error in listSocietiesOptionsController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getFlatController = async (params: {
  id: string;
  buildingId: string;
}): Promise<Response<FlatOptions[]>> => {
  try {
    const flats: FlatOptions[] = await listFlats(params);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      flats
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getFlatController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getVacantFlatController = async (params: {
  id: string;
  buildingId: string;
}): Promise<Response<FlatOptions[]>> => {
  try {
    const flats: FlatOptions[] = await listVacantFlats(params);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      flats
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getFlatController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getVacantHousingController = async (
  id: string
): Promise<Response<HousingOptions[]>> => {
  try {
    const house: HousingOptions[] = await listVacantHouseUnits(id);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      house
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getFlatController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getOccupiedHousingController = async (
  id: string
): Promise<Response<HousingOptions[]>> => {
  try {
    const house: HousingOptions[] = await listOccupiedHouseUnits(id);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      house
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getOccupiedHousingController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getAssignedFlatUserController = async (params: {
  id: string;
  buildingId: string;
}): Promise<Response<AssignedFlatOptions[]>> => {
  try {
    const flats: AssignedFlatOptions[] = await getAssignedFlatsUser(params);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      flats
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getFlatController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const createNoticeController = async (
  request: Request,
  reqBody: AddNoticeReqBody,
  societyId: string
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    await createNotice(reqBody, societyId, userId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("NOTICE_CREATED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in createNoticeController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getNoticesController = async (
  societyId: string
): Promise<Response<NoticeResponse[]>> => {
  try {
    const notices: NoticeResponse[] = await getNotices(societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      notices
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getNoticesController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const toggleNoticeStatusController = async (
  id: string,
  noticeId: string
): Promise<Response<void>> => {
  try {
    const society: Societies | undefined = await findSocietyById(id);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    await toggleNoticeStatus(id, noticeId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("NOTICE_STATUS_TOGGLED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in toggleNoticeStatusController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const updateEndDateController = async (
  request: Request,
  reqBody: AddEndDateReqBody,
  societyId: string
): Promise<Response<void>> => {
  try {
    const userRole: string = request.headers.get("role")!;

    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    if (userRole !== "super_admin") {
      return generateResponseJSON(
        StatusCodes.FORBIDDEN,
        getMessage("NOT_ALLOWED_TO_UPDATE_END_DATE")
      );
    }

    await updateEndDate(reqBody, societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("END_DATE_UPDATED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in updateEndDateController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const deleteSocietyController = async (
  // request: Request,
  id: string
): Promise<Response<void>> => {
  try {
    // const userId: string = request.headers.get("userId")!;

    const society: Societies | undefined = await findSocietyById(id);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    // if (userId !== society.created_by) {
    //   return generateResponseJSON(
    //     StatusCodes.FORBIDDEN,
    //     getMessage("NOT_ALLOWED_TO_DELETE_SOCIETY")
    //   );
    // }

    await deleteSocietyModel(id);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("SOCIETY_DELETED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in deleteSocietyController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getBuildingControllerBySociety = async (
  societyId: string
): Promise<Response<BuildingResponseForSociety[]>> => {
  try {
    const buildings = await getBuildingsBySociety(societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      buildings
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getBuildingsBySociety:", error);
    socitiesLogger.error("Error in getBuildingControllerBySociety:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const addExpenseTrackingController = async (
  request: Request,
  reqBody: AddExpenseTrackingReqBody,
  societyId: string
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    await addExpenseTracking(reqBody, societyId, userId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("EXPENSE_TRACKING_ADDED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in addExpenseTrackingController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const addIncomeTrackingController = async (
  request: Request,
  reqBody: AddIncomeTrackingReqBody,
  societyId: string
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    await addIncomeTracking(reqBody, societyId, userId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("INCOME_TRACKING_ADDED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in addExpenseTrackingController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getExpenseTrackingController = async (
  societyId: string
): Promise<Response<ExpenseTrackingResponse[]>> => {
  try {
    const expenseTrackings = await getExpenseTracking(societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      expenseTrackings
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getExpenseTrackingController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getIncomeTrackingController = async (
  societyId: string
): Promise<Response<IncomeTrackingResponse[]>> => {
  try {
    const incomeTrackings = await getIncomeTracking(societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("LIST_SUCCESSFULL"),
      incomeTrackings
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getIncomeTrackingController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const addFlatPenaltyController = async (
  request: Request,
  reqBody: AddflatPenaltyReqBody,
  params: {
    id: string;
    buildingId: string;
    flatId: string;
  }
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    // Check if the society exists
    const society: Societies | undefined = await findSocietyById(params.id);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    // Check if the building exists
    const building: Building | undefined = await findBuildingById(
      params.buildingId
    );
    if (!building) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("BUILDING_NOT_FOUND")
      );
    }

    // Check if the flat exists
    const flat: Flat | undefined = await findFlatById(params.flatId);
    if (!flat) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("FLAT_NOT_FOUND")
      );
    }

    await addFlatPenalty(reqBody, params, userId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("FLAT_PENALTY_ADDED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in addFlatPenaltyController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const updateMonthlyDuesValidationController = async (
  request: Request,
  params: {
    id: string;
    buildingId: string;
    flatId: string;
    recordId: string;
  }
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const role = request.headers.get("role")!;

    if (role === "member") {
      return generateResponseJSON(
        StatusCodes.FORBIDDEN,
        getMessage("NOT_ALLOWED_TO_UPDATE_MONTHLY_DUES")
      );
    }

    // Check if the society exists
    const society: Societies | undefined = await findSocietyById(params.id);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    // Check if the building exists
    const building: Building | undefined = await findBuildingById(
      params.buildingId
    );
    if (!building) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("BUILDING_NOT_FOUND")
      );
    }

    // Check if the flat exists
    const flat: Flat | undefined = await findFlatById(params.flatId);
    if (!flat) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("FLAT_NOT_FOUND")
      );
    }

    await updateMonthlyDues(params, userId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("MONTHLY_DUES_UPDATED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error(
      "Error in updateMonthlyDuesValidationController:",
      error
    );

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const markFlatPenaltyPaidController = async (
  request: Request,
  params: {
    id: string;
    buildingId: string;
    flatId: string;
    penaltyId: string;
  }
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const society: Societies | undefined = await findSocietyById(params.id);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const building: Building | undefined = await findBuildingById(
      params.buildingId
    );
    if (!building) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("BUILDING_NOT_FOUND")
      );
    }

    const flat: Flat | undefined = await findFlatById(params.flatId);
    if (!flat) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("FLAT_NOT_FOUND")
      );
    }

    const penalty: FlatPenalty | undefined = await findFlatPenaltyById(
      params.penaltyId
    );
    if (!penalty) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("FLAT_PENALTY_NOT_FOUND")
      );
    }

    await markFlatPenaltyPaid(params, userId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("FLAT_PENALTY_MARKED_AS_PAID")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in markFlatPenaltyPaidController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const deleteFlatPenaltyController = async (
  request: Request,
  params: {
    id: string;
    buildingId: string;
    flatId: string;
    penaltyId: string;
  }
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const society: Societies | undefined = await findSocietyById(params.id);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const building: Building | undefined = await findBuildingById(
      params.buildingId
    );
    if (!building) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("BUILDING_NOT_FOUND")
      );
    }

    const flat: Flat | undefined = await findFlatById(params.flatId);
    if (!flat) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("FLAT_NOT_FOUND")
      );
    }

    const penalty: FlatPenalty | undefined = await findFlatPenaltyById(
      params.penaltyId
    );
    if (!penalty) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("FLAT_PENALTY_NOT_FOUND")
      );
    }

    await markFlatPenaltyDeleted(params, userId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("FLAT_PENALTY_MARKED_AS_DELETED")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in markFlatPenaltyPaidController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const getManageMaintenanceController = async (params: {
  id: string;
  buildingId: string;
  flatId: string;
}): Promise<Response<MaintenanceView[]>> => {
  try {
    const society: Societies | undefined = await findSocietyById(params.id);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const building: Building | undefined = await findBuildingById(
      params.buildingId
    );
    if (!building) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("BUILDING_NOT_FOUND")
      );
    }

    const flat: Flat | undefined = await findFlatById(params.flatId);
    if (!flat) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("FLAT_NOT_FOUND")
      );
    }

    const maintenanceView: MaintenanceView[] = await getFlatMaintenanceDetails(
      society.id,
      building.id,
      flat.id
    );

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("FLAT_MAINTENANCE_VIEWED_SUCCESSFULLY"),
      maintenanceView
    );
  } catch (error: any) {
    socitiesLogger.error("Error in getManageMaintenanceController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const softDeleteSocietyController = async (
  request: Request,
  societyId: string
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const checkInBuilding = await checkSocietyInBuilding(societyId);
    if (checkInBuilding) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_ALREADY_IN_USE")
      );
    }

    await softDeleteSociety(societyId, userId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("SOCIETY_DELETED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in softDeleteSocietyController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const addHousingUnitController = async (
  request: Request,
  societyId: string,
  body: AddHousingUnitReqBody
): Promise<Response<AddHousingUnitReqBody>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }
    const housingUnit: HousingUnits = await addHousingUnit(
      societyId,
      body,
      userId
    );

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("HOUSING_UNIT_ADDED_SUCCESSFULLY"),
      housingUnit
    );
  } catch (error: any) {
    socitiesLogger.error("Error in addHousingUnitController:", error);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const listSocietiesHousingOptionsController = async (
  societyId?: string
): Promise<Response<SocietyOptions[]>> => {
  try {
    const societiesHousingOptions: SocietyOptions[] =
      await listSocietiesHousingOptions(societyId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("SOCIETIES_HOUSING_OPTIONS_LISTED_SUCCESSFULLY"),
      societiesHousingOptions
    );
  } catch (error: any) {
    socitiesLogger.error(
      "Error in listSocietiesHousingOptionsController:",
      error
    );

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const listSocietiesOptionsForFlatController = async (): Promise<
  Response<SocietyOptions[]>
> => {
  try {
    const societiesHousingOptions: SocietyOptions[] =
      await listSocietiesOptionsForFlats();

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("SOCIETIES_HOUSING_OPTIONS_LISTED_SUCCESSFULLY"),
      societiesHousingOptions
    );
  } catch (error: any) {
    socitiesLogger.error(
      "Error in listSocietiesHousingOptionsController:",
      error
    );

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const addHousingUnitPenaltyController = async (
  request: Request,
  societyId: string,
  housingUnitId: string,
  body: AddHousingUnitPenaltyReqBody
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const housingUnit: HousingUnits | undefined = await findHousingUnitById(
      housingUnitId
    );
    if (!housingUnit) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("HOUSING_UNIT_NOT_FOUND")
      );
    }

    await addHousingUnitPenalty(societyId, housingUnitId, body, userId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("HOUSING_UNIT_PENALTY_ADDED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in addHousingUnitPenaltyController:", error);
    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const deleteHousingPenaltyController = async (
  request: Request,
  societyId: string,
  housingUnitId: string,
  penaltyId: string
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const housingUnit: HousingUnits | undefined = await findHousingUnitById(
      housingUnitId
    );
    if (!housingUnit) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("HOUSING_UNIT_NOT_FOUND")
      );
    }

    const penalty: HousingUnitPenalty | undefined =
      await findHousingPenaltyById(penaltyId);
    if (!penalty) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("HOUSING_UNIT_PENALTY_NOT_FOUND")
      );
    }

    await deleteHousingUnitPenalty(societyId, housingUnitId, penaltyId, userId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("HOUSING_UNIT_PENALTY_DELETED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in deleteHousingPenaltyController:", error);
    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const updateHousingPenaltyController = async (
  request: Request,
  societyId: string,
  housingUnitId: string,
  penaltyId: string
): Promise<Response<void>> => {
  try {
    const userId: string = request.headers.get("userId")!;

    const society: Societies | undefined = await findSocietyById(societyId);
    if (!society) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SOCIETY_NOT_FOUND")
      );
    }

    const housingUnit: HousingUnits | undefined = await findHousingUnitById(
      housingUnitId
    );
    if (!housingUnit) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("HOUSING_UNIT_NOT_FOUND")
      );
    }

    const penalty: HousingUnitPenalty | undefined =
      await findHousingPenaltyById(penaltyId);
    if (!penalty) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("HOUSING_UNIT_PENALTY_NOT_FOUND")
      );
    }

    await updateHousingUnitPenalty(societyId, housingUnitId, penaltyId, userId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("HOUSING_UNIT_PENALTY_UPDATED_SUCCESSFULLY")
    );
  } catch (error: any) {
    socitiesLogger.error("Error in updateHousingPenaltyController:", error);
    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const listHousingPenaltiesController = async (
  societyId: string,
  housingUnitId: string
): Promise<Response<HousingUnitPenalty[]>> => {
  try {
    const housingPenalties: HousingUnitPenalty[] =
      await listHousingUnitPenalties(societyId, housingUnitId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("HOUSING_UNIT_PENALTIES_LISTED_SUCCESSFULLY"),
      housingPenalties
    );
  } catch (error: any) {
    socitiesLogger.error("Error in listHousingPenaltiesController:", error);
    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};
