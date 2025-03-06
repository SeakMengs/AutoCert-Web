import { ReactNode } from "react";
import DashboardLayoutClient from "./layout_client";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: Readonly<ReactNode>;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
