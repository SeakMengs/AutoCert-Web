"use server";
import { cookies } from "next/headers";
import { HttpStatusCode } from "@/types/http";
import { api } from "@/utils/axios";
import { createScopedLogger } from "@/utils/logger";
import { getCookie } from "@/utils/server/cookie";
import {
  invalidJwtToken,
  JwtTokenValidationResult,
  RefreshType,
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
        return {
          ...invalidJwtToken,
          error: "Access token is missing from the cookie",
          needRefresh: RefreshType.MISSING_ACCESS_TOKEN,
        };
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

        return {
          ...invalidJwtToken,
          error: "Access token is expired",
          needRefresh: RefreshType.EXPIRED_ACCESS_TOKEN,
        };
      }

      // if the access token is about to expire in less than the threshold (in minutes), refresh it
      const minutesUntilExpire = expireAt.diff(now, "minutes", true);
      if (minutesUntilExpire < ACESS_TOKEN_REFRESH_THRESHOLD_MINUTE) {
        logger.debug(
          `Access token is about to expire, refreshing it. Expire at: ${expireAt.format(
            "YYYY-MM-DD HH:mm:ss",
          )}, now: ${now.format("YYYY-MM-DD HH:mm:ss")}, timeUntilExpire: ${minutesUntilExpire} minutes`,
        );
        return {
          ...payload,
          needRefresh: RefreshType.THRESHOLD_REACHED,
        };
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

export async function refreshAccessToken(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
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
          return {
            accessToken: null,
            refreshToken: null,
          };
        }

        // await setRefreshAndAccessTokenToCookie(refreshToken, accessToken);
        return {
          accessToken,
          refreshToken,
        };
      }

      return {
        accessToken: null,
        refreshToken: null,
      };
    } catch (error: any) {
      // Intentionally not clearing the cookies here because the refresh token might be valid however the server might be down or change the route which is causing the error
      logger.error("Error refreshing access token.", error);
      logger.debug("Response", error.response?.data);
      return {
        accessToken: null,
        refreshToken: null,
      };
    }
  }

  logger.debug("Refresh token is missing from the cookie");
  return {
    accessToken: null,
    refreshToken: null,
  };
}

// TODO: invalidate refresh token in backend
export async function logout(): Promise<void> {
  logger.debug("Logging out user");

  await clearRefreshAndAccessTokenCookie();
}
