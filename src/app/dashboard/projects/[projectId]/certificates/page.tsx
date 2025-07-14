import ProjectCertificatesById from "./query";

interface ProjectCertificatesByIdPageProps {
  params: Promise<{ projectId: string}>;
}

export default async function ProjectCertificatesByIdPage({
  params,
}: ProjectCertificatesByIdPageProps) {
  const { projectId} = await params;

  return <ProjectCertificatesById projectId={projectId}/>;
}
