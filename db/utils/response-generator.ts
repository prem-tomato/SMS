import { StatusCodes } from 'http-status-codes';

export type SuccessResponse<T> = {
    status: number;
    message: string;
    data: T | null;
};

export type ErrorResponse<T> = {
    status: number;
    message: string;
    error: StringifyNonStringFields<T> | null;
};

export type InternalServerError = {
    message: string;
    stack?: string;
    code?: string;
};

export type Response<T> =
    | SuccessResponse<T>
    | ErrorResponse<T>
    | ErrorResponse<InternalServerError>;

export type StringifyNonStringFields<T> = T extends object
    ? T extends unknown[]
    ? { [K in `${number}`]: StringifyNonStringFields<T[number]> } | string
    : { [K in keyof T]?: StringifyNonStringFields<T[K]> }
    : string;

export const generateResponseJSON = <T = unknown>(
    responseStatusCode: number = 200,
    responseStatusMessage: string = 'OK',
    data: T | StringifyNonStringFields<T> | null = null,
): Response<T> => {
    const isSuccess: boolean =
        responseStatusCode === StatusCodes.CREATED ||
        responseStatusCode === StatusCodes.OK;

    if (responseStatusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
        const errorData = data as Partial<InternalServerError> | null;

        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: responseStatusMessage || 'An internal server error occurred',
            error: {
                message: errorData?.message || 'An internal server error occurred',
                stack: errorData?.stack || '',
                code: errorData?.code || 'INTERNAL_SERVER_ERROR',
            },
        };
    }

    return isSuccess
        ? {
            status: responseStatusCode,
            message: responseStatusMessage,
            data: data as T | null,
        }
        : {
            status: responseStatusCode,
            message: responseStatusMessage,
            error: data as StringifyNonStringFields<T> | null,
        };
};
