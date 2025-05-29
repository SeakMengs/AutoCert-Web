// "use client";
import { validateAccessToken } from "@/auth/server/action";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "antd";
import Link from "next/link";

export default async function Home() {
  // const {loading, user}= useAuth();
  const { user } = await validateAccessToken();

  return (
    <div>
      <h1>AutoCert</h1>
      <p>
        A Bulk Certificate Creation, E-Signing, and Certificate Repository
        Platform
      </p>
      <Link href="/dashboard">
        <Button variant="filled">To dashboard</Button>
      </Link>
      <Link href="/api/oauth/google">
        <Button variant="filled">Login with google</Button>
      </Link>
      {user ? (
        <div>
          <p>
            <strong>User ID:</strong> {user?.id}
          </p>
          <p>
            <strong>User Name:</strong> {user?.email}
          </p>
        </div>
      ) : (
        <p>You are not logged in.</p>
      )}
      {/* {
        loading ? (
          <p>Loading...</p>
        ) : (
          <p>
            {user
              ? `Welcome, ${user.email}`
              : "You are not logged in. Please log in to access your dashboard."}
          </p>
        )
      } */}
    </div>
  );
}
