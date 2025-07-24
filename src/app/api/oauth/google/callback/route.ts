import { DOMAIN } from "@/utils";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");

  let source = "";
  try {
    if (stateRaw) {
      // Try to parse state as JSON
      const parsed = JSON.parse(stateRaw);
      if (parsed?.source && typeof parsed.source === "string") {
        source = parsed.source;
      }
    }
  } catch (err) {
    console.error("Invalid state JSON", err);
  }

  const redirectUrl = new URL(`${DOMAIN}/authenticating`);
  if (code) redirectUrl.searchParams.set("code", code);
  if (source) redirectUrl.searchParams.set("source", source);

  return Response.redirect(redirectUrl.toString());
}
