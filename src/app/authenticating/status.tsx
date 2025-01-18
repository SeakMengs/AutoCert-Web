"use client";
import { useEffect, useState } from "react";
import { Spin, Alert, Button } from "antd";
import { useRouter } from "next/navigation";
import {
    clearRefreshAndAccessTokenCookie,
    setRefreshAndAccessTokenToCookie,
} from "@/utils";
import { GoogleOAuthCallBackData } from "./page";

type AuthenticationStatusProps = {
    isOk: boolean;
} & GoogleOAuthCallBackData;

export default function AuthenticationStatus({
    isOk,
    token,
}: AuthenticationStatusProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOk) {
            // Simulate a short delay to show the loading state
            setTimeout(async () => {
                if (!token || !token.accessToken || !token.refreshToken) {
                    await clearRefreshAndAccessTokenCookie();
                    setError("Failed to authenticate.");
                    return;
                }

                await setRefreshAndAccessTokenToCookie(
                    token.refreshToken,
                    token.accessToken
                );

                setLoading(false);
                router.push("/dashboard");
            }, 1000);
        } else {
            setLoading(false);
            setError("Failed to authenticate.");
        }
    }, [isOk, router, token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen flex-col">
                <Alert
                    message="Authentication Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Button type="primary" onClick={() => router.push("/")}>
                    Return to Home
                </Button>
                <Button
                    type="primary"
                    onClick={() => router.push("/api/oauth/google")}
                >
                    Retry
                </Button>
            </div>
        );
    }

    return null;
}
