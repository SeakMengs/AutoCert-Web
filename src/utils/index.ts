import { JWT_COOKIE_TYPE } from "@/types/cookie";
import { deleteJwtTokenCookie, setJwtTokenCookie } from "./server_cookie";
import { DAY, MINUTE } from "./time";

export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:8080";
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
  JWT_COOKIE_TYPE.ACCESS
);

export const RefreshTokenCookie = getJwtCookieName(
  JWT_COOKIE_NAME,
  JWT_COOKIE_TYPE.REFRESH
);

export async function setRefreshAndAccessTokenToCookie(
    refreshToken: string,
    accessToken: string,
): Promise<void> {
    await setJwtTokenCookie(
        accessToken,
        new Date(Date.now() + MINUTE * 5),
        JWT_COOKIE_TYPE.ACCESS
    );

    await setJwtTokenCookie(
        refreshToken,
        new Date(Date.now() + DAY * 7),
        JWT_COOKIE_TYPE.REFRESH
    );
}

export async function clearRefreshAndAccessTokenCookie(): Promise<void> {
    await deleteJwtTokenCookie(JWT_COOKIE_TYPE.ACCESS);
    await deleteJwtTokenCookie(JWT_COOKIE_TYPE.REFRESH);
}