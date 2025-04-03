import { z } from "zod";
import { createScopedLogger } from "./logger";

const logger = createScopedLogger("app:utils:error");

export const generateZodError = (path: string, message: string): z.ZodError => {
  return new z.ZodError([
    {
      path: [path],
      message: message,
      code: "custom",
    },
  ]);
};

export type T_ZodErrorFormatted<T = any> = Partial<Record<keyof T, string>>;

// read docs to see schema https://zod.dev/?id=error-handling
export const formatZodError = <T>(
  error: z.ZodError,
): T_ZodErrorFormatted<T> => {
  let formattedError = {} as T_ZodErrorFormatted<T>;
  for (const issue of error.issues) {
    formattedError = {
      ...formattedError,
      [issue.path[0]]: issue.message,
    };
  }
  return formattedError;
};

/**
 * Return formatted error like
 * {
 *  email: "Invalid email",
 *  password: "Invalid password",
 *  path: "Invalid path", where path is the key
 * }
 */
export const generateAndFormatZodError = <T>(
  path: string,
  message: string,
): T_ZodErrorFormatted<T> => {
  return formatZodError(generateZodError(path, message));
};

export type T_AutocertError = {
  field: string;
  message: string;
};
// Autocert error look like this
//  [
// {
// "field": "Unknown",
// "message": "token has invalid claims: token is expired"
// }
// ],
export const autocertToFormattedZodError = (
  error: T_AutocertError[],
): T_ZodErrorFormatted => {
  try {
    let formattedError = {} as T_ZodErrorFormatted;
    for (const issue of error) {
      const fieldKey = issue.field.charAt(0).toLowerCase() + issue.field.slice(1);
      formattedError[fieldKey] = issue.message;
    }
    return formattedError;
  } catch (error) {
    logger.error("Error formatting autocert error", error);

    return {
      unknown: "Unknown error",
    } satisfies T_ZodErrorFormatted;
  }
};
