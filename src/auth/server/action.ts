"use server";
import { cookies } from "next/headers";
import { HttpStatusCode } from "@/types/http";
import { api } from "@/utils/axios";
import { createScopedLogger } from "@/utils/logger";
import { getCookie } from "@/utils/server/cookie";
import {
  invalidJwtToken,
  JwtTokenValidationResult,
  verifyJwtAccessToken,
} from "../jwt";
import {
  clearRefreshAndAccessTokenCookie,
  getJwtCookieName,
  JWT_COOKIE_NAME,
  JWT_COOKIE_TYPE,
  RefreshTokenCookie,
} from "../cookie";
import { ResponseJson } from "@/utils/response";
import { cache } from "react";
import moment from "moment";
import { setRefreshAndAccessTokenToCookie } from "./cookie";

const logger = createScopedLogger("auth:server:action");

// minutes before access token expires to refresh it (in minutes)
// Be careful not to set it above expire date (from backend), it would cause validate access token to always fail
const ACESS_TOKEN_REFRESH_THRESHOLD_MINUTE = 5;

// If use in client side, use the useAuth hook instead as it handle loading state
export const validateAccessToken = cache(
  async (): Promise<JwtTokenValidationResult> => {
    try {
      logger.debug("Validate access token");

      const cookieStore = await cookies();
      const accessTokenCookieName = getJwtCookieName(
        JWT_COOKIE_NAME,
        JWT_COOKIE_TYPE.ACCESS,
      );

      let accessToken = cookieStore.get(accessTokenCookieName);
      if (!accessToken || !accessToken.value) {
        // Try to refresh if access token is missing or invalid
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          logger.debug("Access token missing/invalid and failed to refresh");
          return invalidJwtToken;
        }

        // Try to get the token again after refresh
        const newAccessToken = cookieStore.get(accessTokenCookieName);
        if (!newAccessToken || !newAccessToken.value) {
          return invalidJwtToken;
        }

        accessToken = newAccessToken;
      }

      const payload = await verifyJwtAccessToken(accessToken.value);

      if (!payload || !payload.exp) {
        logger.debug("Validate access token failed, payload is null");
        return payload;
      }

      const expireAt = moment.unix(payload.exp);
      const now = moment();

      if (expireAt.isBefore(now)) {
        logger.debug("Access token is expired");

        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          logger.debug("Failed to refresh access token, clearing cookies");
          // await clearRefreshAndAccessTokenCookie();
          return invalidJwtToken;
        }
      }

      // if the access token is about to expire in less than the threshold (in minutes), refresh it
      const minutesUntilExpire = expireAt.diff(now, "minutes", true);
      if (minutesUntilExpire < ACESS_TOKEN_REFRESH_THRESHOLD_MINUTE) {
        logger.debug(
          `Access token is about to expire, refreshing it. Expire at: ${expireAt.format(
            "YYYY-MM-DD HH:mm:ss",
          )}, now: ${now.format("YYYY-MM-DD HH:mm:ss")}, timeUntilExpire: ${minutesUntilExpire} minutes`,
        );
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          logger.debug("Failed to refresh access token, clearing cookies");
          // await clearRefreshAndAccessTokenCookie();
          return invalidJwtToken;
        }
      }

      return payload;
    } catch (error: any) {
      return {
        ...invalidJwtToken,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
);

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

      if (res.status === HttpStatusCode.OK_200 && res.data.success) {
        const { refreshToken, accessToken } = res.data.data;
        if (!refreshToken || !accessToken) {
          // await clearRefreshAndAccessTokenCookie();
          logger.debug(
            "Refresh token or access token is missing in the api response. Most likely api fault",
          );
          return false;
        }

        // FIXME: fix set cookie fail in server component
        await setRefreshAndAccessTokenToCookie(refreshToken, accessToken);
        return true;
      }

      return false;
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

// TODO: invalidate refresh token in backend
export async function logout(): Promise<void> {
  logger.debug("Logging out user");

  await clearRefreshAndAccessTokenCookie();
}
