"use server";
import { JwtToken, User } from "@/types/models";
import { getJwtCookieName, JWT_COOKIE_NAME } from ".";
import { JWT_COOKIE_TYPE } from "@/types/cookie";
import { cookies } from "next/headers";
import { api } from "./axios";
import { ResponseJson } from "@/types/response";

export type JwtTokenValidationResult = ValidJwtToken | InvalidJwtToken;

type ValidJwtToken = {
  isAuthenticated: true;
  accessToken: JwtToken;
  user: User;
  iat: number;
  exp: number;
  error: null;
};

type InvalidJwtToken = {
  isAuthenticated: false;
  accessToken: null;
  user: null;
  iat: null;
  exp: null;
  error: string | null;
};

const invalidJwtToken = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  exp: null,
  iat: null,
  error: null,
} satisfies InvalidJwtToken;

export async function validateAccessToken(): Promise<JwtTokenValidationResult> {
  try {
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

    type Data = {
      payload: ValidJwtToken;
      tokenValid: boolean;
    }

    type DataError = Omit<Data, "payload">

    const res = await api.get<ResponseJson<Data, DataError>>(`/api/v1/auth/jwt/access/verify/${accessToken.value}`);
    const data = res.data.data

    if (!res.data.success || !data.tokenValid) {
      return invalidJwtToken;
    }

    return {
      ...data.payload,
      accessToken: accessToken.value,
      isAuthenticated: true,
    };
  } catch (error: any) {
    return {
      ...invalidJwtToken,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}