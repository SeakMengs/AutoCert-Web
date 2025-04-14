import { AutoCertChangeType } from "@/components/builder/hooks/useAutoCertChange";
import { ProjectRole } from "@/types/project";

export const ProjectPermission = {
  ...AutoCertChangeType,
} as const;
export type ProjectPermission =
  (typeof ProjectPermission)[keyof typeof ProjectPermission];

type Permission = (typeof ROLES)[ProjectRole][number];

const ROLES: Record<ProjectRole, ProjectPermission[]> = {
  [ProjectRole.Requestor]: [
    ProjectPermission.AnnotateColumnAdd,
    ProjectPermission.AnnotateColumnUpdate,
    ProjectPermission.AnnotateColumnRemove,
    ProjectPermission.AnnotateSignatureAdd,
    ProjectPermission.AnnotateSignatureUpdate,
    ProjectPermission.AnnotateSignatureRemove,
    ProjectPermission.SettingsUpdate,
  ],
  [ProjectRole.Signatory]: [ProjectPermission.AnnotateSignatureAdd],
  [ProjectRole.None]: [],
};

export function hasPermission(role: ProjectRole[], permissions: Permission[]) {
  return permissions.every((permission) =>
    role.some((r) => ROLES[r].includes(permission)),
  );
}

// Example usage
// hasPermission("requestor", ["create:comments"]);
