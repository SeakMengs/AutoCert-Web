"use server";

import { api } from "@/utils/axios";
import { createScopedLogger } from "@/utils/logger";
import { ResponseJson } from "@/utils/response";

const logger = createScopedLogger("src:app:authenticating:action");

export type GoogleOAuthCallBackData = {
  accessToken: string;
  refreshToken: string;
} | null;

export async function fetchGoogleOAuthCallBack(
  searchParams: string,
): Promise<GoogleOAuthCallBackData> {
  try {
    const res = await api.get<ResponseJson<GoogleOAuthCallBackData>>(
      `/api/v1/oauth/google/callback?${searchParams}`,
    );

    if (!res.data.success) {
      logger.error("Error fetching OAuth callback data:", res.data);
      return null;
    }

    if (!res.data || !res.data.data) {
      return null;
    }

    return {
      accessToken: res.data.data.accessToken,
      refreshToken: res.data.data.refreshToken,
    };
  } catch (error: any) {
    logger.error("Error fetching OAuth callback data:", error.res.data);
    return null;
  }
}
