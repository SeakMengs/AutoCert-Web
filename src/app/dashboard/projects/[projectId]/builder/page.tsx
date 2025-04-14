import Builder from "./builder";

interface ProjectBuilderByIDProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectBuilderByID({
  params,
}: ProjectBuilderByIDProps) {
  const { projectId } = await params;

  return <Builder projectId={projectId} />;
}
