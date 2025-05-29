"use client";
import { createScopedLogger } from "@/utils/logger";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";
import { validateAccessToken } from "@/auth/server/action";
import { JwtTokenValidationResult } from "@/auth/jwt";
import { App } from "antd";

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

// Path that should not trigger refresh token
// const EXCLUDE_ROUTES = ["/authenticating"];
const PROTECTED_ROUTES = ["/dashboard"];

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const { message } = App.useApp();
  const [authState, setAuthState] = useState<AuthState>({
    ...DEFAULT_AUTH_STATE,
  });
  const pathname = usePathname();
  const router = useRouter();

  const fetchAuthState = async (): Promise<JwtTokenValidationResult> => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      const payload = await validateAccessToken();
      setAuthState({ ...payload, loading: false });
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
    }
  };

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
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ ...authState, revalidate: fetchAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};
