"use client";
import { createScopedLogger } from "@/utils/logger";
import { clientRevalidatePath } from "@/utils/server/host";
import { getCookie } from "@/utils/server/cookie";
import moment from "moment";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";
import { validateAccessToken, refreshAccessToken } from "@/auth/server/action";
import { JwtTokenValidationResult } from "@/auth/jwt";
import { AccessTokenCookie, RefreshTokenCookie } from "@/auth/cookie";
import { App } from "antd";

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
const ExcludeRefreshPath = ["/authenticating"];
const ForbiddenRoutes = ["/dashboard"];

// TODO: rewrite this and test for bugs
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { message } = App.useApp();
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
    if (ExcludeRefreshPath.includes(pathname)) {
      return;
    }

    try {
      const refreshToken = await getCookie(RefreshTokenCookie);
      if (!refreshToken) {
        logger.warn(
          `Missing refresh token in cookie, skipping refresh token: ${type}`,
        );
        // If refresh token is missing, we should not try to refresh the access token
        return;
      }

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

        if (
          ForbiddenRoutes.some((route) => pathname.startsWith(route)) ||
          pathname === "/"
        ) {
          logger.warn(
            `Failed to refresh access token, redirecting to / page: ${pathname}`,
          );
          // session expire
          router.push("/?error=Session expired");
          message.error("Session expired");
          return;
        }
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
    // `exp` is in seconds convert to ms
    const expMs = moment.unix(authState.exp);
    // Refresh token 5 minutes before it expires.
    // If change duration, don't forget to change cookie for accessToken expire duration in auth/cookie.ts setRefreshAndAccessTokenToCookie
    const refreshMsBeforeExp = moment.duration(5, "minute");
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
      {children}
    </AuthContext.Provider>
  );
};
