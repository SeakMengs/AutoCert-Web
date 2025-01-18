import { getApiBaseUrl } from "@/utils";
import AuthenticationStatus from "./status";
import { api } from "@/utils/axios";
import { ResponseJson } from "@/types/response";

type AuthenticatingProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export type GoogleOAuthCallBackData = {
  token: {
    accessToken: string;
    refreshToken: string;
} | undefined;
};

export default async function Authenticating({
    searchParams,
}: AuthenticatingProps) {
    const sp = await searchParams;
    const urlSp = new URLSearchParams(sp as any);
    const response = await api.get<ResponseJson<GoogleOAuthCallBackData>>(
        `/api/v1/oauth/google/callback?${urlSp.toString()}`
    );

    return <AuthenticationStatus isOk={response.status === 200} token={response.data.data.token} />;
}
