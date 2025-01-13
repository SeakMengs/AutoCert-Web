"use client";
import { useEffect, useState } from "react";
import { Spin, Alert, Button } from "antd";
import { useRouter } from "next/navigation";
import { deleteJwtTokenCookie, setJwtTokenCookie } from "@/utils/cookie";
import { DAY, MINUTE } from "@/utils/time";
import { JWT_COOKIE_TYPE } from "@/types/cookie";

type AuthenticationStatusProps = {
  isOk: boolean;
  token:
    | {
        accessToken: string;
        refreshToken: string;
      }
    | undefined;
};

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
          await deleteJwtTokenCookie(JWT_COOKIE_TYPE.ACCESS);
          await deleteJwtTokenCookie(JWT_COOKIE_TYPE.REFRESH);
          setError("Failed to authenticate.");
          return;
        }

        await setJwtTokenCookie(
          token.accessToken,
          new Date(Date.now() + MINUTE * 5),
          JWT_COOKIE_TYPE.ACCESS,
        );

        await setJwtTokenCookie(
          token.refreshToken,
          new Date(Date.now() + DAY * 7),
          JWT_COOKIE_TYPE.REFRESH,
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
        <Button type="primary" onClick={() => router.push("/api/oauth/google")}>
          Retry
        </Button>
      </div>
    );
  }

  return null;
}
