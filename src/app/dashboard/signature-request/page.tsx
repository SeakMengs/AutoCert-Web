"use client";
import { Space } from "antd";
import SignatureRequestSection from "./signature_request_section";
import SignatureSection from "./signature_section";

export default function DashboardSignatureRequest() {
  const onSignatureChange = () => {};

  return (
    <Space direction="vertical" size={"middle"} className="w-full p-4">
      <SignatureSection onSignatureChange={onSignatureChange} />
      <SignatureRequestSection />
    </Space>
  );
}
