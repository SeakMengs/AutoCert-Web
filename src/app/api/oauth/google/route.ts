import { getApiBaseUrl } from "@/utils";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const appRedirectUri = request.nextUrl.searchParams.get("app_redirect_uri");
  let url = `${getApiBaseUrl()}/api/v1/oauth/google`;

  if (appRedirectUri) {
    url += `?app_redirect_uri=${appRedirectUri}`;
  }

  return Response.redirect(url);
}
