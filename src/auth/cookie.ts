import moment from "moment";
import { setJwtTokenCookie, deleteJwtTokenCookie } from "./server/cookie";

export enum JWT_COOKIE_TYPE {
  ACCESS = "access",
  REFRESH = "refresh",
}

export const JWT_COOKIE_NAME = "autocert";

// Convert session name to __Secure-prefix-type if in production
// To tell browsers to only send the cookie over HTTPS
export function getJwtCookieName(name: string, type: JWT_COOKIE_TYPE): string {
  return process.env.NODE_ENV === "production"
    ? `__Secure-${name}-${type}`
    : `${name}-${type}`;
}

export const AccessTokenCookie = getJwtCookieName(
  JWT_COOKIE_NAME,
  JWT_COOKIE_TYPE.ACCESS,
);

export const RefreshTokenCookie = getJwtCookieName(
  JWT_COOKIE_NAME,
  JWT_COOKIE_TYPE.REFRESH,
);

export async function clearRefreshAndAccessTokenCookie(): Promise<void> {
  await deleteJwtTokenCookie(JWT_COOKIE_TYPE.ACCESS);
  await deleteJwtTokenCookie(JWT_COOKIE_TYPE.REFRESH);
}
