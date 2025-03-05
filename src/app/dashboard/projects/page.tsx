"use client";
import { Space } from "antd";
import CertificateProjectSection from "./certificate_project_section";

export default function DashboardProject() {
  return (
    <Space direction="vertical" size={"middle"} className="w-full p-4">
      <CertificateProjectSection />
    </Space>
  );
}
