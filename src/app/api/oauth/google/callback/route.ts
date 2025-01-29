import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  const host = request.nextUrl.origin;
  return Response.redirect(`${host}/authenticating?${searchParams}`);
}
