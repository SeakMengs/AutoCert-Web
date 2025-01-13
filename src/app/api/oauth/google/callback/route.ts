import { getBaseUrl } from "@/utils/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  const host = await getBaseUrl();
  return Response.redirect(`${host}/authenticating?` + searchParams);
}
