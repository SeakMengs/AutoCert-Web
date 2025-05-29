"use server";
import { IS_PRODUCTION } from "@/utils/env";
import { cookies } from "next/headers";
import { JWT_COOKIE_TYPE, JWT_COOKIE_NAME, getJwtCookieName } from "../cookie";
import moment from "moment";
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
    secure: IS_PRODUCTION,
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
    secure: IS_PRODUCTION,
    maxAge: 0,
    path: "/",
  });
}


export async function setRefreshAndAccessTokenToCookie(
  refreshToken: string,
  accessToken: string,
): Promise<void> {
  await setJwtTokenCookie(
    accessToken,
    moment().add(24, "hours").toDate(),
    JWT_COOKIE_TYPE.ACCESS,
  );

  await setJwtTokenCookie(
    refreshToken,
    moment().add(1, "week").toDate(),
    JWT_COOKIE_TYPE.REFRESH,
  );
}