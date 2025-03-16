"use server";
import { JWT_COOKIE_TYPE } from "@/types/cookie";
import { cookies } from "next/headers";
import { ResponseJson } from "@/types/response";
import { HttpStatusCode } from "@/types/http";
import { AxiosResponse } from "axios";
import {
  getJwtCookieName,
  JWT_COOKIE_NAME,
  RefreshTokenCookie,
  setRefreshAndAccessTokenToCookie,
} from "@/utils";
import { api } from "@/utils/axios";
import { createScopedLogger } from "@/utils/logger";
import { getCookie } from "@/utils/server/cookie";
import { invalidJwtToken, JwtTokenValidationResult, verifyJwtAccessToken } from "../jwt";

const logger = createScopedLogger("auth:action");

// If use in client side, use the useAuth hook instead as it handle loading state and refresh token rotation
export const validateAccessToken = async (): Promise<JwtTokenValidationResult> => {
  try {
    logger.debug("Validate access token");

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

    // If use api to verify the token, uncomment this code
    // type Data = {
    //   payload: ValidJwtToken;
    //   tokenValid: boolean;
    // };

    // type DataError = Omit<Data, "payload">;

    // type FormBody = {
    //   token: string;
    // };

    // type ResponseData = ResponseJson<Data, DataError>;

    // const res = await api.postForm<
    //   ResponseData,
    //   AxiosResponse<ResponseData>,
    //   FormBody
    // >(`/api/v1/auth/jwt/access/verify`, {
    //   token: accessToken.value,
    // });
    // const data = res.data.data;

    // if (!res.data.success || !data.tokenValid) {
    //   return invalidJwtToken;
    // }
    // return {
    //   ...data.payload,
    //   accessToken: accessToken.value,
    //   isAuthenticated: true,
    // };

    return verifyJwtAccessToken(accessToken.value);
  } catch (error: any) {
    return {
      ...invalidJwtToken,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export async function refreshAccessToken(): Promise<boolean> {
  logger.debug("Refreshing access token");
  const refreshToken = await getCookie(RefreshTokenCookie);
  if (refreshToken) {
    type Data = {
      refreshToken: string;
      accessToken: string;
    };

    try {
      const res = await api.postForm<ResponseJson<Data>>(
        "/api/v1/auth/jwt/refresh",
        {},
        {
          headers: {
            Authorization: `Refresh ${refreshToken}`,
          },
        },
      );

      if (res.status === HttpStatusCode.OK_200) {
        const { refreshToken, accessToken } = res.data.data;
        if (!refreshToken || !accessToken) {
          // await clearRefreshAndAccessTokenCookie();
          logger.debug(
            "Refresh token or access token is missing in the api response. Most likely api fault",
          );
          return false;
        }

        await setRefreshAndAccessTokenToCookie(refreshToken, accessToken);
        return true;
      }
    } catch (error: any) {
      // Intentionally not clearing the cookies here because the refresh token might be valid however the server might be down or change the route which is causing the error
      logger.error("Error refreshing access token.", error);
      logger.debug("Response", error.response?.data);
      return false;
    }
  }

  logger.debug("Refresh token is missing from the cookie");
  // await clearRefreshAndAccessTokenCookie();
  return false;
}

export async function logout(): Promise<void> {}
