import { Space } from "antd";
import CertificateProjectSection from "./certificate_project_section";
import { hasFullAccess } from "@/utils/restrict";
import { validateAccessToken } from "@/auth/server/action";
import ProjectNotFound from "@/components/not_found/ProjectNotFound";
import AccountRestricted from "@/components/AccountRestricted";

export default async function DashboardProject() {
  const user = await validateAccessToken();

  // Allow access as requestor only if they logged in with org account. (Requested by Mr. Neil)
  if (user.isAuthenticated && !hasFullAccess(user.user?.email)) {
    return <AccountRestricted />;
  }

  return (
    <Space direction="vertical" size={"middle"} className="w-full p-4">
      <CertificateProjectSection />
    </Space>
  );
}
