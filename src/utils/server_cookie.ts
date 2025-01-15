"use server";
import { cookies } from "next/headers";
import { clearRefreshAndAccessTokenCookie, getJwtCookieName, JWT_COOKIE_NAME, RefreshTokenCookie, setRefreshAndAccessTokenToCookie } from ".";
import { JWT_COOKIE_TYPE } from "@/types/cookie";
import { api } from "./axios";
import { ResponseJson } from "@/types/response";
import { HttpStatusCode } from "@/types/http";

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
    secure: process.env.NODE_ENV === "production",
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
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

// TODO: create scope log
// Keep this function here to hide api from network tab
export async function refreshAccessToken(): Promise<boolean> {
    console.log("utils.refreshAccessToken: Refreshing access token");
    const refreshToken = await getCookie(RefreshTokenCookie);
    if (refreshToken) {
        type Data = {
            refreshToken: string;
            accessToken: string;
        }

        try {
            const res = await api.post<ResponseJson<Data>>(
                "/api/v1/auth/jwt/refresh",
                {},
                {
                    headers: {
                        Authorization: `Refresh ${refreshToken}`,
                    },
                }
            );

            if (res.status === HttpStatusCode.OK_200) {
                const { refreshToken, accessToken } = res.data.data;
                if (!refreshToken || !accessToken) {
                    await clearRefreshAndAccessTokenCookie();
                    console.log("utils.refreshAccessToken: Refresh token or access token is missing");
                    return false;
                }

                await setRefreshAndAccessTokenToCookie(refreshToken, accessToken);
                return true;
            }
        } catch (error) {
            // Intentionally not clearing the cookies here because the refresh token might be valid however the server might be down or change the route which is causing the error
            console.error("utils.refreshAccessToken: Error refreshing access token", error);
        }
    }

    console.log("utils.refreshAccessToken: Refresh token is missing from the cookie");
    await clearRefreshAndAccessTokenCookie();
    return false;
}