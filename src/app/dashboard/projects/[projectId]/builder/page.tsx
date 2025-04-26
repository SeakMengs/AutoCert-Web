import ProjectBuilderById from "./query";

interface ProjectBuilderByIdPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectBuilderByIdPage({
  params,
}: ProjectBuilderByIdPageProps) {
  const { projectId } = await params;

  return <ProjectBuilderById projectId={projectId} />;
}
