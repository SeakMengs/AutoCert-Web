import moment from "moment";
import { setJwtTokenCookie, deleteJwtTokenCookie } from "./server/cookie";

export enum JWT_COOKIE_TYPE {
  ACCESS = "access",
  REFRESH = "refresh",
}

export const JWT_COOKIE_NAME = "autocert";

// Convert session name to __Secure-prefix-type if in production
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

// HERE: change expire of access and refresh token here
export async function setRefreshAndAccessTokenToCookie(
  refreshToken: string,
  accessToken: string,
): Promise<void> {
  await setJwtTokenCookie(
    accessToken,
    moment().add(15, "minutes").toDate(),
    JWT_COOKIE_TYPE.ACCESS,
  );

  await setJwtTokenCookie(
    refreshToken,
    moment().add(1, "week").toDate(),
    JWT_COOKIE_TYPE.REFRESH,
  );
}

export async function clearRefreshAndAccessTokenCookie(): Promise<void> {
  await deleteJwtTokenCookie(JWT_COOKIE_TYPE.ACCESS);
  await deleteJwtTokenCookie(JWT_COOKIE_TYPE.REFRESH);
}
