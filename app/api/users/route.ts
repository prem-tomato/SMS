// import type { Response } from "@/db/utils/response-generator";
// import { authMiddleware } from "@/middlewares/auth-middleware";
// import { NextRequest, NextResponse } from "next/server";
// import { getUserController } from "./user.controller";
// import userLogger from "./user.logger";
// import { UserResponse } from "./user.types";

// export const GET = async (request: NextRequest) => {
//   userLogger.info(" GET /api/users");
//   userLogger.debug("Adding user");

//   // Step 1: Verify the JWT token for authentication
//   const authResult = await authMiddleware(request);

//   // If authentication fails, return the error response
//   if (authResult instanceof Response) return authResult;

//   // Step 2: If validation and authentication succeed, process the request
//   const { status, ...responseData }: Response<UserResponse[]> =
//     await getUserController();

//   // Return the response with the appropriate status code
//   return NextResponse.json(responseData, { status });
// };
