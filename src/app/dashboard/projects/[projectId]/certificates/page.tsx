import CertificateList from "./certificate_list";
import { getCertificates } from "./temp";
import Header from "./header";
import { Space } from "antd";

export default async function ProjectCertificatesByID() {
  const certificates = await getCertificates();

  return (
    <>
      <Header />
      <Space direction="vertical" size={"middle"} className="w-full p-4">
        <CertificateList certificates={certificates} />
      </Space>
    </>
  );
}
