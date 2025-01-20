import { validateAccessToken } from "@/utils/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import DashboardLayoutClient from "./layout_client";
import { Spin } from "antd";

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
    children,
}: {
    children: Readonly<ReactNode>;
}) {
    const result = await validateAccessToken();

    if (!result.isAuthenticated) {
        redirect("/");
        return;
    }

    if (!result) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <DashboardLayoutClient user={result.user}>
            {children}
        </DashboardLayoutClient>
    );
}