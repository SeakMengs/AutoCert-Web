"use server";
import { JwtToken, User } from "@/types/models";
import { getApiBaseUrl, getJwtCookieName, JWT_COOKIE_NAME } from ".";
import { JWT_COOKIE_TYPE } from "@/types/cookie";
import { cookies } from "next/headers";

export async function validateAccessToken(): Promise<JwtTokenValidationResult> {
  const cookieStore = await cookies();
  const accessTokenCookieName = getJwtCookieName(
    JWT_COOKIE_NAME,
    JWT_COOKIE_TYPE.ACCESS,
  );
  if (!cookieStore.has(accessTokenCookieName)) {
    return {
      accessToken: null,
      user: null,
      iat: null,
      exp: null,
    };
  }

  const accessToken = cookieStore.get(accessTokenCookieName);
  if (!accessToken) {
    return {
      accessToken: null,
      user: null,
      iat: null,
      exp: null,
    };
  }

  const url = `${getApiBaseUrl()}/api/v1/auth/jwt/verify/${accessToken.value}`;
  const response = await fetch(url);
  const data = await response.json();

  console.log(response);
  if (!data.data.tokenValid) {
    return {
      accessToken: null,
      user: null,
      iat: null,
      exp: null,
    };
  }

  return {
    ...(data.data.payload as ValidJwtToken),
    accessToken: accessToken.value,
  };
}

export type JwtTokenValidationResult = ValidJwtToken | InvalidJwtToken;
type ValidJwtToken = {
  accessToken: JwtToken;
  user: User;
  iat: number;
  exp: number;
};
type InvalidJwtToken = { accessToken: null; user: null; iat: null; exp: null };
