import { StatusCodes } from "http-status-codes";
import type { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";

import getMessage from "@/db/utils/messages";
import { generateResponseJSON } from "@/db/utils/response-generator";
import authorizeServices from "@/services/auth.services";
import config from "@/services/config";

export type LoginJwtPayload = DefaultJwtPayload & {
  userId: string;
  email: string;
  timezone: string;
  role: string;
};

const JWT_SECRET = config.JWT_SECRET!;

// Middleware function for authentication
export async function authMiddleware(request: NextRequest) {
  try {
    // Extract the token from the authorization header
    const token: string | undefined = request.headers
      .get("authorization")
      ?.split(" ")[1];
    if (!token) {
      const { status, ...responseData } = generateResponseJSON(
        StatusCodes.UNAUTHORIZED,
        getMessage("TOKEN_REQUIRED")
      );

      return NextResponse.json(responseData, { status });
    }

    const payload = authorizeServices.verifyToken<LoginJwtPayload>(
      token,
      JWT_SECRET
    );

    // Set user info in the headers after successful verification
    request.headers.set("userId", payload.userId);
    request.headers.set("role", payload.role);
    return request;
  } catch (error: any) {
    // Return an error response if token verification fails
    const { status, ...responseData } = generateResponseJSON(
      StatusCodes.UNAUTHORIZED,
      getMessage("UNAUTHORIZED")
    );

    return NextResponse.json(responseData, { status });
  }
}
