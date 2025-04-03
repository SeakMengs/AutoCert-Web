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
    const response = await api.get<ResponseJson<GoogleOAuthCallBackData>>(
      `/api/v1/oauth/google/callback?${searchParams}`,
    );

    if (!response.data.success) {
      logger.error("Error fetching OAuth callback data:", response.data);
      return null;
    }

    if (!response.data || !response.data.data) {
      return null;
    }

    return {
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken,
    };
  } catch (error: any) {
    logger.error("Error fetching OAuth callback data:", error.response.data);
    return null;
  }
}
