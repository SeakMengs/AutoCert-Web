"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { IS_PRODUCTION_ENV } from ".";

export async function getProtocol(): Promise<string> {
  // For the protocol, we will check based on env HTTP_PROTOCOL, if not check by x-forwarded-proto, if not check by NODE_ENV (production or not), if not default to http
  let protocol = process.env.HTTP_PROTOCOL;

  if (!protocol) {
    const h = await headers();
    protocol =
      h.get("x-forwarded-proto") ||
      (IS_PRODUCTION_ENV ? "https" : "http");
  }

  return protocol;
}

// export async function getBaseUrl(): Promise<string> {
//   const h = await headers();
//   const protocol = await getProtocol();
//   const host = h.get("x-forwarded-host") || h.get("host") || "";
//   return `${protocol}://${host}` || "";
// }

export async function getPathname(): Promise<string> {
  const h = await headers();
  return h.get("x-current-pathname") || "";
}

export async function getOrigin(): Promise<string> {
  const h = await headers();
  return h.get("origin") || "";
}

export async function getFullUrlPathname(): Promise<string> {
  const h = await headers();
  return h.get("x-full-url-pathname") || "";
}

export async function clientRevalidatePath(path: string): Promise<void> {
  return revalidatePath(path);
}