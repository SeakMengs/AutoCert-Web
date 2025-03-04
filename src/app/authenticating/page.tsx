"use client";
import { Suspense, useEffect, useState } from "react";
import { Spin, Alert, Button } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { setRefreshAndAccessTokenToCookie } from "@/utils";
import { fetchGoogleOAuthCallBack, GoogleOAuthCallBackData } from "./action";
import { useAuth } from "@/hooks/useAuth";
import FullScreenSpin from "@/components/loading/FullScreenSpin";

// https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
export default function Authenticating() {
  return (
    <Suspense fallback={<Spin size="large" />}>
      <AuthenticationStatus />
    </Suspense>
  );
}

function AuthenticationStatus() {
  const { revalidate } = useAuth();
  const [token, setToken] = useState<GoogleOAuthCallBackData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(true);
    fetchGoogleOAuthCallBack(searchParams.toString()).then((t) => {
      setToken(t);
    });
  }, []);

  useEffect(() => {
    const handleAuthentication = async () => {
      if (token && token.accessToken && token.refreshToken) {
        await setRefreshAndAccessTokenToCookie(
          token.refreshToken,
          token.accessToken,
        );

        // Update user state in the user auth context
        await revalidate();

        router.push("/dashboard");
        return;
      }

      // await clearRefreshAndAccessTokenCookie();
      setError("Failed to authenticate.");
      setLoading(false);
    };

    if (token !== undefined) {
      handleAuthentication();
    }

    return () => {
      setLoading(false);
      setError(undefined);
    };
  }, [token]);

  if (loading) {
    return <FullScreenSpin />;
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
        <Button type="primary" onClick={() => router.push("/api/oauth/google")}>
          Retry
        </Button>
      </div>
    );
  }

  return null;
}
