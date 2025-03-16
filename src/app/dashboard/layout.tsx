import { ReactNode } from "react";
import DashboardLayoutClient from "./layout_client";
import { validateAccessToken } from "@/auth/server/action";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const result = await validateAccessToken();

  if (!result.isAuthenticated) {
    return redirect("/?error=Failed to authenticate");
  }

  return (
    <DashboardLayoutClient user={result.user}>{children}</DashboardLayoutClient>
  );
}
