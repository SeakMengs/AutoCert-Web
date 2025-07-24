import { ReactNode } from "react";
import DashboardLayoutClient from "./layout_client";
import { validateAccessToken } from "@/auth/server/action";
import { redirect } from "next/navigation";
import { createScopedLogger } from "@/utils/logger";
import { getPathname } from "@/utils/server/host";

const logger = createScopedLogger("app:dashboard:layout");

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const result = await validateAccessToken();
  if (!result.isAuthenticated) {
    logger.warn("User is not authenticated, redirecting to '/' page");

    const pathname = await getPathname();
    redirect(`/?source=${encodeURIComponent(pathname)}`);
  }

  return (
    <DashboardLayoutClient user={result.user}>{children}</DashboardLayoutClient>
  );
}
