"use client";
import { Suspense, useEffect, useState } from "react";
import { Spin, Alert, Button, Result } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchGoogleOAuthCallBack, GoogleOAuthCallBackData } from "./action";
import { useAuth } from "@/hooks/useAuth";
import FullScreenSpin from "@/components/loading/FullScreenSpin";
import { validateAccessToken } from "@/auth/server/action";
import { setRefreshAndAccessTokenToCookie } from "@/auth/server/cookie";
import LoginLink from "@/components/auth/LoginLink";

// https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
export default function Authenticating() {
  return (
    <Suspense fallback={<Spin size="large" />}>
      <AuthenticationStatus />
    </Suspense>
  );
}

function AuthenticationStatus() {
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

        const payload = await validateAccessToken();
        if (!payload.isAuthenticated) {
          setError("Failed to authenticate. Please try again.");
          setLoading(false);
          return;
        }

        const source = searchParams.get("source");
        if (source) {
          router.push(source);
          return;
        }

        router.push("/dashboard");
        return;
      }

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
        <Result
          status="error"
          title="Authentication Failed"
          subTitle={error}
          extra={[
            <Button type="primary" key="home" onClick={() => router.push("/")}>
              Return to Home
            </Button>,
            <LoginLink key="retry">
              <Button>Retry</Button>
            </LoginLink>,
          ]}
        />
      </div>
    );
  }

  return null;
}
