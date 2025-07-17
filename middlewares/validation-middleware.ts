import getMessage from "@/db/utils/messages";
import { generateResponseJSON } from "@/db/utils/response-generator";
import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError, ZodObject, ZodTypeAny } from "zod";

const formatZodErrors = <T>(error: ZodError<T>): Record<string, any> => {
  const formatted: Record<string, any> = {};

  // Process each error in the issues array
  error.issues.forEach((issue) => {
    let path = issue.path.join(".");

    // Remove 'body.' prefix if it exists
    if (path.startsWith("body.")) {
      path = path.substring(5); // Remove 'body.' (5 characters)
    }

    // Remove 'params.' prefix if it exists
    if (path.startsWith("params.")) {
      path = path.substring(7); // Remove 'params.' (7 characters)
    }

    // Remove 'query.' prefix if it exists
    if (path.startsWith("query.")) {
      path = path.substring(6); // Remove 'query.' (6 characters)
    }

    if (!formatted[path]) {
      formatted[path] = issue.message;
    }
  });

  return formatted;
};

const validate = async <T>(
  schema: ZodTypeAny,
  data: any
): Promise<{ body: T; query?: any; params?: any }> => {
  try {
    const result = await schema.parseAsync(data);
    return result as { body: T; query?: any; params?: any };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Zod validation error:", error);
      const formattedErrors = formatZodErrors(error);
      console.error("Formatted errors:", formattedErrors);
      throw new Error(JSON.stringify(formattedErrors));
    }
    throw error;
  }
};

const validationMiddleware = async <T extends Record<string, any>>(
  request: NextRequest,
  validationSchema: ZodObject<any> | ZodTypeAny,
  params: object = {}
): Promise<{
  reqBody: T;
  response?: NextResponse;
}> => {
  try {
    const { searchParams } = request.nextUrl;
    const method = request.method.toUpperCase();
    const data: Record<string, any> = {
      body: {},
      query: Object.fromEntries(searchParams.entries()),
      params,
    };

    if (["POST", "PATCH"].includes(method)) {
      try {
        data.body = await request.json();
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        const errorResponse = generateResponseJSON(
          StatusCodes.BAD_REQUEST,
          getMessage("VALIDATION_ERROR"),
          { body: "Invalid JSON format" }
        );
        return {
          reqBody: null as any,
          response: NextResponse.json(errorResponse, {
            status: errorResponse.status,
          }),
        };
      }
    }

    const validatedData = await validate<T>(validationSchema, data);
    return { reqBody: validatedData.body };
  } catch (error: any) {
    console.error("Validation middleware error:", error);

    let errorData: Record<string, string> = {};

    if (error.message?.startsWith("{")) {
      try {
        errorData = JSON.parse(error.message);
      } catch (parseError) {
        console.error("Error parsing validation error message:", parseError);
        errorData = { general: error.message };
      }
    } else {
      errorData = { general: error.message };
    }

    // If errorData is empty, provide a default message
    if (Object.keys(errorData).length === 0) {
      errorData = { general: "Validation failed" };
    }

    console.error("Final error data being sent:", errorData);

    const errorResponse = generateResponseJSON(
      StatusCodes.BAD_REQUEST,
      getMessage("VALIDATION_ERROR"),
      errorData
    );

    return {
      reqBody: null as any,
      response: NextResponse.json(errorResponse, {
        status: errorResponse.status,
      }),
    };
  }
};

export default validationMiddleware;
