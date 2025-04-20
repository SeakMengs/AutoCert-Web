import { Space } from "antd";
import SignatureSection from "./signature_section";
import SignatureRequestSection from "./signature_request_section";

export default function DashboardSignatureRequest() {
  return (
    <Space direction="vertical" size={"middle"} className="w-full p-4">
      <SignatureSection />
      <SignatureRequestSection />
    </Space>
  );
}
