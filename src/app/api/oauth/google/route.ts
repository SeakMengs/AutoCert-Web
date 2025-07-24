import { getApiBaseUrl } from "@/utils";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const afterLoginUrl = request.nextUrl.searchParams.get("source");
  const url = new URL("/api/v1/oauth/google", getApiBaseUrl());

  if (afterLoginUrl) {
    url.searchParams.set("source", afterLoginUrl);
  }

  return Response.redirect(url);
}
