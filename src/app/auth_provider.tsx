"use client";
import { AccessTokenCookie, RefreshTokenCookie } from "@/utils";
import {
  JwtTokenValidationResult,
  refreshAccessToken,
  validateAccessToken,
} from "@/utils/auth";
import { createScopedLogger } from "@/utils/logger";
import { clientRevalidatePath } from "@/utils/server";
import { getCookie } from "@/utils/server_cookie";
import { message } from "antd";
import moment from "moment";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";

const logger = createScopedLogger("app:auth_provider");

type AuthState = JwtTokenValidationResult & {
  loading: boolean;
};

const initialAuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  loading: true,
  error: null,
  exp: null,
  iat: null,
} satisfies AuthState;

export type AuthContextValue = AuthState & {
  revalidate: () => Promise<JwtTokenValidationResult>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

type AuthProviderProps = {
  children: Readonly<ReactNode>;
};

const RefreshTokenType = {
  TokenExpire: "TokenExpire",
  Timer: "Timer",
  MissingAccessToken: "MissingAccessToken",
} as const;

// Path that should not trigger refresh token
const ExcludePath = ["/authenticating"];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const pathname = usePathname();
  const router = useRouter();

  const fetchAuthState = async (): Promise<JwtTokenValidationResult> => {
    try {
      const result: JwtTokenValidationResult = await validateAccessToken();
      setAuthState({
        ...result,
        loading: false,
      });

      clientRevalidatePath(pathname);
      return result;
    } catch (error: any) {
      const failAuthState = {
        ...initialAuthState,
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      };

      setAuthState(failAuthState);
      return failAuthState;
    }
  };

  async function clientRefreshAccessToken(
    type: keyof typeof RefreshTokenType,
  ): Promise<void> {
    if (ExcludePath.includes(pathname)) {
      return;
    }

    try {
      const refreshed = await refreshAccessToken();
      // Revalidate auth state
      const result = await fetchAuthState();

      if (!refreshed) {
        logger.error(
          `Failed to refresh access token, after fetch auth state isAuthenticated: ${result.isAuthenticated}`,
        );

        // If refresh failed, check if the token is valid because other browser tabs may have already refreshed the token
        if (result.isAuthenticated) {
          return;
        }

        router.push("/?error=Failed to reauthenticate");

        if (pathname === "/") {
          const refreshToken = await getCookie(RefreshTokenCookie);

          const errorMsg = !refreshToken
            ? "Failed to authenticate"
            : "Failed to reauthenticate";

          messageApi.open({
            type: "error",
            content: errorMsg,
          });
        }
        return;
      }
    } catch (error: any) {
      switch (type) {
        case RefreshTokenType.MissingAccessToken:
          logger.error("MissingAccessToken: Immediate refresh failed:", error);
          break;
        case RefreshTokenType.TokenExpire:
          logger.error("TokenExpire: Immediate refresh failed:", error);
          break;
        case RefreshTokenType.Timer:
          logger.error("Timer: Scheduled refresh failed:", error);
          break;
      }
    }
  }

  useEffect(() => {
    getCookie(AccessTokenCookie).then(async (token) => {
      if (!token) {
        await clientRefreshAccessToken(RefreshTokenType.MissingAccessToken);
        return;
      }
    });
  }, [pathname]);

  // Access token rotation
  useEffect(() => {
    // If user isn't authenticated or we don't have an expiration time, skip scheduling.
    if (!authState.isAuthenticated || !authState.exp) {
      return;
    }

    const now = moment();
    // `exp` is in seconds
    const expMs = moment.unix(authState.exp);
    // Refresh token 30 seconds before it expires.
    const refreshMsBeforeExp = moment.duration(30, "seconds");
    const timeUntilRefresh =
      expMs.diff(now) - refreshMsBeforeExp.asMilliseconds();
    const tokenExpired = timeUntilRefresh <= 0;

    logger.debug(`Time until refresh ${moment
      .duration(timeUntilRefresh)
      .asMinutes()} minutes, \n 
        refresh at ${now.add(timeUntilRefresh, "milliseconds").toDate()} \n
        token expire date ${expMs.toDate()} \n
        token expired: ${tokenExpired} \n
        `);

    if (tokenExpired) {
      clientRefreshAccessToken(RefreshTokenType.TokenExpire);
      return;
    }

    const refreshTimer = setTimeout(async () => {
      await clientRefreshAccessToken(RefreshTokenType.Timer);
    }, timeUntilRefresh);

    return () => clearTimeout(refreshTimer);
  }, [authState.isAuthenticated, authState.exp]);

  useEffect(() => {
    fetchAuthState();
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, revalidate: fetchAuthState }}>
      {contextHolder}
      {children}
    </AuthContext.Provider>
  );
};
