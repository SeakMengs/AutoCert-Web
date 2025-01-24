"use server";
import { AuthUser, JwtToken } from "@/types/models";
import { clearRefreshAndAccessTokenCookie, getJwtCookieName, JWT_COOKIE_NAME, RefreshTokenCookie, setRefreshAndAccessTokenToCookie } from ".";
import { JWT_COOKIE_TYPE } from "@/types/cookie";
import { cookies } from "next/headers";
import { api } from "./axios";
import { ResponseJson } from "@/types/response";
import { getCookie } from "./server_cookie";
import { HttpStatusCode } from "@/types/http";
import { AxiosResponse } from "axios";

export type JwtTokenValidationResult = ValidJwtToken | InvalidJwtToken;

type ValidJwtToken = {
  isAuthenticated: true;
  accessToken: JwtToken;
  user: AuthUser;
  iat: number;
  exp: number;
  error: null;
};

type InvalidJwtToken = {
  isAuthenticated: false;
  accessToken: null;
  user: null;
  iat: null;
  exp: null;
  error: string | null;
};

const invalidJwtToken = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  exp: null,
  iat: null,
  error: null,
} satisfies InvalidJwtToken;

// If use in client side, use the useAuth hook instead as it handle loading state and refresh token rotation
export async function validateAccessToken(): Promise<JwtTokenValidationResult> {
  try {
    const cookieStore = await cookies();
    const accessTokenCookieName = getJwtCookieName(
      JWT_COOKIE_NAME,
      JWT_COOKIE_TYPE.ACCESS,
    );
    if (!cookieStore.has(accessTokenCookieName)) {
      return invalidJwtToken;
    }

    const accessToken = cookieStore.get(accessTokenCookieName);
    if (!accessToken || !accessToken.value) {
      return invalidJwtToken;
    }

    type Data = {
      payload: ValidJwtToken;
      tokenValid: boolean;
    }

    type DataError = Omit<Data, "payload">

    type FormBody = {
      token: string;
    }

    type ResponseData = ResponseJson<Data, DataError>

    const res = await api.postForm<ResponseData, AxiosResponse<ResponseData>, FormBody>(`/api/v1/auth/jwt/access/verify`, {
      token: accessToken.value,
    });
    const data = res.data.data

    if (!res.data.success || !data.tokenValid) {
      return invalidJwtToken;
    }

    return {
      ...data.payload,
      accessToken: accessToken.value,
      isAuthenticated: true,
    };
  } catch (error: any) {
    return {
      ...invalidJwtToken,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function refreshAccessToken(): Promise<boolean> {
    console.log("utils.refreshAccessToken: Refreshing access token");
    const refreshToken = await getCookie(RefreshTokenCookie);
    if (refreshToken) {
        type Data = {
            refreshToken: string;
            accessToken: string;
        }

        try {
            const res = await api.postForm<ResponseJson<Data>>(
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
                    // await clearRefreshAndAccessTokenCookie();
                    console.log("utils.refreshAccessToken: Refresh token or access token is missing");
                    return false;
                }

                await setRefreshAndAccessTokenToCookie(refreshToken, accessToken);
                return true;
            }
        } catch (error: any) {
            // Intentionally not clearing the cookies here because the refresh token might be valid however the server might be down or change the route which is causing the error
            console.error("utils.refreshAccessToken: Error refreshing access token.", error);
            console.log("Response", error.response.data);
            return false;
        }
    }

    console.log("utils.refreshAccessToken: Refresh token is missing from the cookie");
    // await clearRefreshAndAccessTokenCookie();
    return false;
}