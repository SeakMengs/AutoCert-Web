import { useState, useEffect } from "react";
import { validateAccessToken, JwtTokenValidationResult } from "@/utils/auth";

type AuthState = JwtTokenValidationResult & {
  loading: boolean;
};

const initialAuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  loading: true,
  exp: null,
  iat: null,
} satisfies AuthState;

type UseAuthReturn = AuthState & {
  revalidate: () => Promise<void>;
};

/*
 * Use this function in client side for loading state.
 * For server side, use validateAccessToken
 */
export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  const fetchAuthState = async () => {
    try {
      const result: JwtTokenValidationResult = await validateAccessToken();
      setAuthState({
        ...result,
        loading: false,
      });
    } catch (error) {
      setAuthState(initialAuthState);
    }
  };

  useEffect(() => {
    fetchAuthState();
  }, []);

  return {
    ...authState,
    revalidate: fetchAuthState,
  };
}
