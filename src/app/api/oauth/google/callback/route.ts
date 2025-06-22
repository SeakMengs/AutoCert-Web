import { DOMAIN } from "@/utils";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  return Response.redirect(`${DOMAIN}/authenticating?${searchParams}`);
}
