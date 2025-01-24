"use client";
import { AccessTokenCookie } from "@/utils";
import { JwtTokenValidationResult, refreshAccessToken, validateAccessToken } from "@/utils/auth";
import { clientRevalidatePath } from "@/utils/server";
import { getCookie } from "@/utils/server_cookie";
import { SECOND } from "@/utils/time";
import moment from "moment";
import { usePathname } from "next/navigation";
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
    const pathname = usePathname();

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

        clientRevalidatePath(pathname);
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

        const now = moment();
        // `exp` is in seconds
        const expMs = moment.unix(authState.exp);
        // Refresh token 30 seconds before it expires.
        const refreshMsBeforeExp = moment.duration(30, 'seconds');
        const timeUntilRefresh = expMs.diff(now) - refreshMsBeforeExp.asMilliseconds();
        const tokenExpired = timeUntilRefresh <= 0;

        // TODO: create scoped log
        console.log(`Time until refresh ${moment.duration(timeUntilRefresh).asMinutes()} minutes, \n 
        refresh at ${now.add(timeUntilRefresh, 'milliseconds').toDate()} \n
        token expire date ${expMs.toDate()} \n
        token expired: ${tokenExpired} \n
        `);

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