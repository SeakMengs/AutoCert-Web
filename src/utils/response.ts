import { generateAndFormatZodError, T_ZodErrorFormatted } from "./error";

export type SuccessResponse<T> = {
  data: T;
  message: string;
  success: true;
};

export type ErrorResponse<T> = {
  message: string;
  errors: T_ZodErrorFormatted<T>;
  success: false;
};

export type ResponseJson<T = any, E = {}> =
  | SuccessResponse<T>
  | ErrorResponse<E>;

export const responseSuccess = <T = any>(
  message: string,
  data: T = {} as T,
): SuccessResponse<T> => ({
  data: data,
  message,
  success: true,
});

export const responseFailed = <T = any>(
  message: string,
  errors: T_ZodErrorFormatted<T>,
): ErrorResponse<T> => ({
  message,
  errors,
  success: false,
});

export const responseSomethingWentWrong = (message: string) => {
  return responseFailed(
    message,
    generateAndFormatZodError("wentWrong", "Something went wrong"),
  );
};
