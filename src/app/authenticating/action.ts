"use server";

import { ResponseJson } from "@/types/response";
import { api } from "@/utils/axios";

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

    if (!response.data || !response.data.data) {
      return null;
    }

    return {
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken,
    };
  } catch (error: any) {
    console.error("Error fetching OAuth callback data:", error.response.data);
    return null;
  }
}
