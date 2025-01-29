import { validateAccessToken } from "@/utils/auth";
import { ReactNode } from "react";
import DashboardLayoutClient from "./layout_client";
import FullScreenSpin from "@/components/loading/FullScreenSpin";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
    children,
}: {
    children: Readonly<ReactNode>;
}) {
    const result = await validateAccessToken();
    if (!result.isAuthenticated) {
        return <FullScreenSpin />;
    }

    return (
        <DashboardLayoutClient user={result.user}>
            {children}
        </DashboardLayoutClient>
    );
}