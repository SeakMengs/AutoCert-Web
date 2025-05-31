import PublicCertificateById from "./query";

interface PublicCertificateByIdPageProps {
  params: Promise<{ certificateId: string }>;
}

export default async function PublicCertificateByIdPage({
  params,
}: PublicCertificateByIdPageProps) {
  const { certificateId } = await params;

  return <PublicCertificateById certificateId={certificateId} />;
}
