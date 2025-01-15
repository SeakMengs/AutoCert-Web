"use client";
import { AccessTokenCookie } from "@/utils";
import { JwtTokenValidationResult, validateAccessToken } from "@/utils/auth";
import { getCookie, refreshAccessToken } from "@/utils/server_cookie";
import { SECOND } from "@/utils/time";
import { createContext, ReactNode, useEffect, useState } from "react";

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
  revalidate: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
    undefined
);

type AuthProviderProps = {
    children: Readonly<ReactNode>;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [authState, setAuthState] = useState<AuthState>(initialAuthState);

    const fetchAuthState = async () => {
        try {
            const result: JwtTokenValidationResult =
                await validateAccessToken();
            setAuthState({
                ...result,
                loading: false,
            });
        } catch (error: any) {
            setAuthState({
                ...initialAuthState,
                loading: false,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    };

    // Access token rotation
    useEffect(() => {
        // If access token is missing, try to refresh it. 
        getCookie(AccessTokenCookie).then((token) => {
            if (!token) {
                refreshAccessToken()
                    .then(fetchAuthState)
                    .catch((err) =>
                        console.error("Immediate refresh failed:", err)
                    );
                return;
            }
        });

        // If user isn't authenticated or we don't have an expiration time, skip scheduling.
        if (!authState.isAuthenticated || !authState.exp) return;

        const now = Date.now();
        // `exp` is in seconds, convert to ms.
        const expMs = authState.exp * SECOND;
        // Refresh token 30 seconds before it expires.
        const refreshMsBeforeExp = 30 * SECOND;
        const timeUntilRefresh = expMs - now - refreshMsBeforeExp;
        const tokenExpired = timeUntilRefresh <= 0;

        // TODO: create scoped log
        console.log(
            "timeUntilRefresh in minutes",
            timeUntilRefresh / 1000 / 60
        );
        console.log("Refresh exactly at", new Date(now + timeUntilRefresh));

        if (tokenExpired) {
            refreshAccessToken()
                .then(fetchAuthState)
                .catch((err) =>
                    console.error("Immediate refresh failed:", err)
                );
            return;
        }

        const refreshTimer = setTimeout(async () => {
            try {
                await refreshAccessToken();
                await fetchAuthState();
            } catch (err) {
                console.error("Scheduled refresh failed:", err);
            }
        }, timeUntilRefresh);

        return () => clearTimeout(refreshTimer);
    }, [authState.isAuthenticated, authState.exp]);

    useEffect(() => {
        fetchAuthState();
    }, []);

    return (
        <AuthContext.Provider
            value={{ ...authState, revalidate: fetchAuthState }}
        >
            {children}
        </AuthContext.Provider>
    );
};