"use server";
import { JwtToken, User } from "@/types/models";
import { getApiBaseUrl, getJwtCookieName, JWT_COOKIE_NAME } from ".";
import { JWT_COOKIE_TYPE } from "@/types/cookie";
import { cookies } from "next/headers";

export type JwtTokenValidationResult = ValidJwtToken | InvalidJwtToken;

type ValidJwtToken = {
  isAuthenticated: true;
  accessToken: JwtToken;
  user: User;
  iat: number;
  exp: number;
};

type InvalidJwtToken = {
  isAuthenticated: false;
  accessToken: null;
  user: null;
  iat: null;
  exp: null;
};

const invalidJwtToken = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  exp: null,
  iat: null,
} satisfies InvalidJwtToken;

export async function validateAccessToken(): Promise<JwtTokenValidationResult> {
  const cookieStore = await cookies();
  const accessTokenCookieName = getJwtCookieName(
    JWT_COOKIE_NAME,
    JWT_COOKIE_TYPE.ACCESS,
  );
  if (!cookieStore.has(accessTokenCookieName)) {
    return invalidJwtToken;
  }

  const accessToken = cookieStore.get(accessTokenCookieName);
  if (!accessToken || !accessToken.value) {
    return invalidJwtToken;
  }

  const url = `${getApiBaseUrl()}/api/v1/auth/jwt/verify/${accessToken.value}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.data.tokenValid) {
    return invalidJwtToken;
  }

  return {
    ...(data.data.payload as ValidJwtToken),
    accessToken: accessToken.value,
    isAuthenticated: true,
  };
}
