import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import socitiesLogger from "./socities.logger";
import {
  addAdmin,
  addBuilding,
  addFlat,
  addMember,
  addSocieties,
  assignMembersToFlat,
  checkLoginKeyUnique,
  findBuildingById,
  findFlatById,
  findSocietyById,
  findSocityByName,
  getAssignedFlatsUser,
  getBuildings,
  getFlats,
  getSocieties,
  listFlats,
  listSocieties,
  listSocietiesOptions,
  listVacantFlats,
  toggleForIsOccupied,
} from "./socities.model";
import {
  AddAdminReqBody,
  AddBuildingReqBody,
  AddFlatReqBody,
  AddMemberReqBody,
  AddSocietyReqBody,
  AdminResponse,
  AssignedFlatOptions,
  AssignMemberReqBody,
  Building,
  BuildingResponse,
  Flat,
  FlatOptions,
  FlatResponse,
  MemberResponse,
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

    await addSocieties(addSocietiesPayload);

    return generateResponseJSON(
      StatusCodes.CREATED,
      getMessage("SOCIETY_CREATED_SUCCESSFULLY")
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

    const flat = await addFlat(reqBody, params.buildingId, params.id, userId);

    const responseData = {
      society_name: society.name,
      building_name: building.name,
      flat_number: flat.flat_number,
      floor_number: flat.floor_number,
    };

    return generateResponseJSON(
      StatusCodes.CREATED,
      getMessage("FLAT_CREATED_SUCCESSFULLY"),
      { data: responseData }
    );
  } catch (error: any) {
    socitiesLogger.error("Error in addFlatController:", error);

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
}): Promise<Response<Flat[]>> => {
  try {
    const flats: Flat[] = await getFlats(params);

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
