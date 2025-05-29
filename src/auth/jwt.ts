import jwt from "jsonwebtoken";
import { createScopedLogger } from "@/utils/logger";
import { z } from "zod";
import { authUserSchema } from ".";
import { JWT_SECRET } from "@/utils/env";
import { JWT_COOKIE_TYPE } from "./cookie";

const logger = createScopedLogger("auth:jwt");

export type JwtTokenValidationResult = ValidJwtToken | InvalidJwtToken;

export const validJwtTokenSchema = z.object({
  user: authUserSchema,
  iat: z.number(),
  exp: z.number(),
});

export type ValidJwtToken = z.infer<typeof validJwtTokenSchema> & {
  isAuthenticated: true;
  accessToken: string;
  error: null;
  needRefresh: RefreshType | null;
  // Time in minutes before the token should be refreshed
  timeBeforeRefresh: number | null; 
};

export type InvalidJwtToken = {
  isAuthenticated: false;
  accessToken: null;
  user: null;
  iat: null;
  exp: null;
  error: string | null;
  needRefresh: RefreshType | null;
};

export const RefreshType = {
  MISSING_ACCESS_TOKEN: "MISSING_ACCESS_TOKEN",
  EXPIRED_ACCESS_TOKEN: "EXPIRED_ACCESS_TOKEN",
  THRESHOLD_REACHED: "THRESHOLD_REACHED",
};
export type RefreshType = (typeof RefreshType)[keyof typeof RefreshType];

export const invalidJwtToken = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  exp: null,
  iat: null,
  error: null,
  needRefresh: null,
} satisfies InvalidJwtToken;

export async function verifyJwtAccessToken(
  token: string,
): Promise<JwtTokenValidationResult> {
  try {
    if (!token || token.trim() === "") {
      logger.debug("Token is empty");
      return invalidJwtToken;
    }

    // jwt.verify will throw an error if the token is invalid or expired.
    const jwtClaims = jwt.verify(token, JWT_SECRET) as ValidJwtToken & {
      type: string;
    };

    const validate = validJwtTokenSchema.safeParse(jwtClaims);
    if (!validate.success) {
      logger.debug("Invalid JWT token claims", validate.error);
      return invalidJwtToken;
    }

    if (jwtClaims.type !== JWT_COOKIE_TYPE.ACCESS) {
      logger.debug("Invalid JWT token type");
      return invalidJwtToken;
    }

    const { type, ...claims } = jwtClaims;
    return {
      ...claims,
      accessToken: token,
      isAuthenticated: true,
    };
  } catch (error) {
    logger.error("Error verifying JWT token", error);
    return invalidJwtToken;
  }
}
