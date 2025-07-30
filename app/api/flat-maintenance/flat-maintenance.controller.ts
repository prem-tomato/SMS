import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
  Transaction,
} from "@/db/configs/acid";
import {
  HALFYEARLY,
  QUARTERLY,
  SETTLEMENT,
  YEARLY,
} from "@/db/utils/enums/enum";
import getMessage from "@/db/utils/messages";
import { generateResponseJSON, Response } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import flatMaintenanceLogger from "./flat-maintenance.logger";
import {
  addFlatMaintenanceSettlement,
  addHalfYearlyFlatMaintenance,
  addQuaterlyFlatMaintenance,
  addYearlyFlatMaintenance,
  findFlatMaintenanceById,
  findFlatMaintenanceSettlementById,
  findMonthlyMaintenanceById,
  markAmountTypeInFlats,
  markMonthlyMaintenanceAsPaid,
  markSettlementAsPaid,
} from "./flat-maintenance.model";
import {
  FlatMaintenance,
  FlatMaintenanceMonthly,
  FlatMaintenanceSettlement,
  ManageFLatMaintenance,
} from "./flat-maintenance.types";

export const manageFlatMaintenanceController = async (
  request: Request,
  reqBody: ManageFLatMaintenance,
  flatMaintenanceId: string
): Promise<Response<void>> => {
  const transaction: Transaction = await startTransaction();
  const { client } = transaction;
  try {
    const userId: string = request.headers.get("userId")!;

    // Check if the flat maintenance record exists
    const flatMaintenance: FlatMaintenance | undefined =
      await findFlatMaintenanceById(flatMaintenanceId);
    if (!flatMaintenance) {
      await rollbackTransaction(transaction);
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("FLAT_MAINTENANCE_NOT_FOUND")
      );
    }

    switch (reqBody.amount_type) {
      case SETTLEMENT: {
        await markAmountTypeInFlats(client, flatMaintenanceId, SETTLEMENT);
        await addFlatMaintenanceSettlement(
          client,
          reqBody.settlement_amount,
          flatMaintenanceId,
          userId
        );
        break;
      }

      case QUARTERLY: {
        await markAmountTypeInFlats(client, flatMaintenanceId, QUARTERLY);
        if (reqBody.months) {
          await addQuaterlyFlatMaintenance(
            client,
            flatMaintenanceId,
            reqBody.months,
            userId
          );
        }
        break;
      }

      case HALFYEARLY: {
        await markAmountTypeInFlats(client, flatMaintenanceId, HALFYEARLY);
        if (reqBody.months) {
          await addHalfYearlyFlatMaintenance(
            client,
            flatMaintenanceId,
            reqBody.months,
            userId
          );
        }
        break;
      }

      case YEARLY: {
        await markAmountTypeInFlats(client, flatMaintenanceId, YEARLY);
        if (reqBody.months) {
          await addYearlyFlatMaintenance(
            client,
            flatMaintenanceId,
            reqBody.months,
            userId
          );
        }
        break;
      }

      default: {
        const exhaustiveCheck: never = reqBody;
        flatMaintenanceLogger.error(
          "Unhandled amount_type in manageFlatMaintenanceController:",
          exhaustiveCheck
        );
        await rollbackTransaction(transaction);
        return generateResponseJSON(
          StatusCodes.BAD_REQUEST,
          getMessage("INVALID_AMOUNT_TYPE")
        );
      }
    }

    await commitTransaction(transaction);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("FLAT_MAINTENANCE_UPDATED_SUCCESSFULLY")
    );
  } catch (error: any) {
    flatMaintenanceLogger.error(
      "Error in manageFlatMaintenanceController:",
      error
    );

    await rollbackTransaction(transaction);

    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const updateMonthlyMaintenanceController = async (
  request: Request,
  flatMaintenanceId: string,
  monthlyMaintenanceId: string
): Promise<Response<void>> => {
  try {
    const flatMaintenance: FlatMaintenance | undefined =
      await findFlatMaintenanceById(flatMaintenanceId);
    if (!flatMaintenance) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("FLAT_MAINTENANCE_NOT_FOUND")
      );
    }

    const monthlyMaintenance: FlatMaintenanceMonthly | undefined =
      await findMonthlyMaintenanceById(monthlyMaintenanceId);
    if (!monthlyMaintenance) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("MONTHLY_MAINTENANCE_NOT_FOUND")
      );
    }

    await markMonthlyMaintenanceAsPaid(monthlyMaintenanceId, flatMaintenanceId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("MONTHLY_MAINTENANCE_UPDATED_SUCCESSFULLY")
    );
  } catch (error: any) {
    flatMaintenanceLogger.error(
      "Error in updateMonthlyMaintenanceController:",
      error
    );
    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};

export const updateSettlementController = async (
  request: Request,
  flatMaintenanceId: string,
  settlementId: string
): Promise<Response<void>> => {
  try {
    const flatMaintenance: FlatMaintenance | undefined =
      await findFlatMaintenanceById(flatMaintenanceId);
    if (!flatMaintenance) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("FLAT_MAINTENANCE_NOT_FOUND")
      );
    }

    const settlement: FlatMaintenanceSettlement | undefined =
      await findFlatMaintenanceSettlementById(settlementId);
    if (!settlement) {
      return generateResponseJSON(
        StatusCodes.NOT_FOUND,
        getMessage("SETTLEMENT_NOT_FOUND")
      );
    }

    await markSettlementAsPaid(settlementId, flatMaintenanceId);

    return generateResponseJSON(
      StatusCodes.OK,
      getMessage("SETTLEMENT_UPDATED_SUCCESSFULLY")
    );
  } catch (error: any) {
    flatMaintenanceLogger.error("Error in updateSettlementController:", error);
    return generateResponseJSON(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message,
      error
    );
  }
};
