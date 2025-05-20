import { createScopedLogger } from "@/utils/logger";
import ProjectBuilderById from "./query";
import { validateAccessToken } from "@/auth/server/action";
import { redirect } from "next/navigation";

const logger = createScopedLogger(
  "app:dashboard:projects:[pprojectId]:builder",
);

interface ProjectBuilderByIdPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectBuilderByIdPage({
  params,
}: ProjectBuilderByIdPageProps) {
  const { projectId } = await params;
  const { isAuthenticated, user } = await validateAccessToken();
  if (!isAuthenticated) {
    logger.warn("Builder: user is not authenticated, redirecting to '/' page");
    redirect("/");
    return;
  }

  return <ProjectBuilderById projectId={projectId} user={user} />;
}
