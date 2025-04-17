import { notFound } from "next/navigation";
import { getProjectByIdAction } from "./action";
import Builder from "./builder";

interface ProjectBuilderByIDProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectBuilderByID({
  params,
}: ProjectBuilderByIDProps) {
  const { projectId } = await params;

  const res = await getProjectByIdAction({
    projectId,
  });

  if (!res.success) {
    return notFound();
  }

  return (
    <Builder
      project={res.data.project}
      roles={res.data.roles}
    />
  );
}
