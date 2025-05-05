import ProjectNotFound, {
  ProjectNotFoundProps,
} from "@/components/not_found/ProjectNotFound";

export default function NotFound({
  errorType = "not-found",
  ...props
}: ProjectNotFoundProps) {
  return <ProjectNotFound errorType={errorType} {...props} />;
}
