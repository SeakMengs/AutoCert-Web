import { JWT_COOKIE_TYPE } from "@/types/cookie";
import { deleteJwtTokenCookie, setJwtTokenCookie } from "./server_cookie";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from "moment";

export const IS_PRODUCTION_ENV = process.env.NODE_ENV === "production";

export const APP_NAME = "AutoCert";

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


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
        moment().add(5, "minutes").toDate(),
        JWT_COOKIE_TYPE.ACCESS
    );

    await setJwtTokenCookie(
        refreshToken,
        moment().add(1, "week").toDate(),
        JWT_COOKIE_TYPE.REFRESH
    );
}

export async function clearRefreshAndAccessTokenCookie(): Promise<void> {
    await deleteJwtTokenCookie(JWT_COOKIE_TYPE.ACCESS);
    await deleteJwtTokenCookie(JWT_COOKIE_TYPE.REFRESH);
}