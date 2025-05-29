"use client";
import { createScopedLogger } from "@/utils/logger";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { refreshAccessToken, validateAccessToken } from "@/auth/server/action";
import { JwtTokenValidationResult } from "@/auth/jwt";
import { App } from "antd";
import { setRefreshAndAccessTokenToCookie } from "@/auth/server/cookie";
import moment from "moment";

const logger = createScopedLogger("app:auth_provider");

type AuthState = JwtTokenValidationResult & {
  loading: boolean;
};

const DEFAULT_AUTH_STATE = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  loading: true,
  error: null,
  exp: null,
  iat: null,
  needRefresh: null,
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

const PROTECTED_ROUTES = ["/dashboard"];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { message } = App.useApp();
  const [authState, setAuthState] = useState<AuthState>({
    ...DEFAULT_AUTH_STATE,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const clearRefreshTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleTokenRefresh = useCallback((timeBeforeRefresh: number) => {
    clearRefreshTimeout();

    logger.info(
      `Access token is valid, will refresh in ${timeBeforeRefresh / 60} hours`,
    );

    timeoutRef.current = setTimeout(() => {
      logger.info("Auto-refreshing token due to scheduled timeout");
      fetchAuthState();
    }, moment.duration(timeBeforeRefresh, "minutes").asMilliseconds());
  }, []);

  const fetchAuthState = useCallback(
    async (retry: number = 1): Promise<JwtTokenValidationResult> => {
      try {
        logger.info("Fetching auth state on try count:", retry);

        if (retry >= 3) {
          logger.error("Max retry count reached, clearing auth state");
          const errorState = {
            ...DEFAULT_AUTH_STATE,
            loading: false,
            error: "Max retry count reached",
          } satisfies AuthState;
          setAuthState(errorState);
          return errorState;
        }

        setAuthState((prev) => ({ ...prev, loading: true }));

        const payload = await validateAccessToken();

        if (payload && payload.needRefresh) {
          logger.warn(
            "Access token needs to be refreshed due to: ",
            payload.needRefresh,
          );

          const { accessToken, refreshToken } = await refreshAccessToken();

          if (accessToken && refreshToken) {
            setRefreshAndAccessTokenToCookie(refreshToken, accessToken);
          }

          return fetchAuthState(retry + 1);
        }

        setAuthState({ ...payload, loading: false });

        if (payload.isAuthenticated && payload.timeBeforeRefresh) {
          scheduleTokenRefresh(payload.timeBeforeRefresh);
        }

        return payload;
      } catch (error) {
        logger.error("Failed to validate access token", error);

        const state = {
          ...DEFAULT_AUTH_STATE,
          loading: false,
          error: "Failed to validate access token",
        } satisfies AuthState;
        setAuthState(state);

        return state;
      } finally {
        // TODO: handle err message
        if (authState.error) {
          message.error(authState.error);
        }
      }
    },
    [scheduleTokenRefresh],
  );

  useEffect(() => {
    logger.info("Validating access token on client side");
    fetchAuthState().then((result) => {
      if (!result.isAuthenticated) {
        if (PROTECTED_ROUTES.includes(pathname)) {
          logger.info("User is not authenticated, redirecting to home");
          router.push("/");
        }
      }
    });

    return () => {
      clearRefreshTimeout();
    };
  }, [pathname, router, fetchAuthState, clearRefreshTimeout]);

  return (
    <AuthContext.Provider value={{ ...authState, revalidate: fetchAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};
