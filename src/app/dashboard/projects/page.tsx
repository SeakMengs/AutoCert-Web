import { Space } from "antd";
import CertificateProjectSection from "./certificate_project_section";
import { getOwnProjects } from "./action";

export default async function DashboardProject() {
  const data = await getOwnProjects({
    page: 1,
    pageSize: 10,
    search: "cert",
  });

  return (
    <Space direction="vertical" size={"middle"} className="w-full p-4">
      <CertificateProjectSection />
    </Space>
  );
}