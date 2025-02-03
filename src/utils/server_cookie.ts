"use server";
import { cookies } from "next/headers";
import { JWT_COOKIE_TYPE } from "@/types/cookie";
import { getJwtCookieName, IS_PRODUCTION_ENV, JWT_COOKIE_NAME } from ".";

export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

/*
 * httpOnly: Cookies are only accessible server-side
 * SameSite=Lax: Use Strict for critical websites
 * Secure: Cookies can only be sent over HTTPS (Should be omitted when testing on localhost)
 * Max-Age or Expires: Must be defined to persist cookies
 * Path=/: Cookies can be accessed from all routes
 */

// ExpireAt example: new Date(Date.now() + 1 * WEEK)
export async function setJwtTokenCookie(
  token: string,
  expiresAt: Date,
  type: JWT_COOKIE_TYPE,
  jwtTokenName: string = JWT_COOKIE_NAME,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(getJwtCookieName(jwtTokenName, type), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION_ENV,
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteJwtTokenCookie(
  type: JWT_COOKIE_TYPE,
  jwtTokenName: string = JWT_COOKIE_NAME,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(getJwtCookieName(jwtTokenName, type), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION_ENV,
    maxAge: 0,
    path: "/",
  });
}
