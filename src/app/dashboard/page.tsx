"use client";

import { useEffect, useState } from "react";
import { validateAccessToken, JwtTokenValidationResult } from "@/utils/auth";

export default function Dashboard() {
  const [validationResult, setValidationResult] =
    useState<JwtTokenValidationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const result = await validateAccessToken();
        console.log(result);
        setValidationResult(result);
      } catch (error) {
        console.error("Error validating access token:", error);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!validationResult || !validationResult.user) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>You are not authorized to view this page. Please log in again.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>
        <strong>User ID:</strong> {validationResult.user.id}
      </p>
      <p>
        <strong>User Name:</strong> {validationResult.user.email}
      </p>
      <p>
        <strong>Issued At:</strong>{" "}
        {new Date(validationResult.iat * 1000).toLocaleString()}
      </p>
      <p>
        <strong>Expires At:</strong>{" "}
        {new Date(validationResult.exp * 1000).toLocaleString()}
      </p>
    </div>
  );
}
