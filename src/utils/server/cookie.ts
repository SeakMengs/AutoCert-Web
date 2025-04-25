"use server";
import { cookies } from "next/headers";
import { IS_PRODUCTION } from "../env";
import { APP_NAME } from "..";

export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

export async function setCookie(
  name: string,
  value: string,
  expiresAt: Date,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    expires: expiresAt,
    path: "/",
  });
}
