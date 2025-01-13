import { JWT_COOKIE_TYPE } from "@/types/cookie";

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
