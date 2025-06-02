import { AutoCertChangeType } from "@/components/builder/store/autocertChangeSlice";
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
    ProjectPermission.AnnotateSignatureInvite,
    ProjectPermission.SettingsUpdate,
    ProjectPermission.TableUpdate,
  ],
  [ProjectRole.Signatory]: [
    ProjectPermission.AnnotateSignatureApprove,
    ProjectPermission.AnnotateSignatureReject,
  ],
  [ProjectRole.None]: [],
};

export function hasPermission(roles: ProjectRole[], permissions: Permission[]) {
  return permissions.every((permission) =>
    roles.some((r) => ROLES[r].includes(permission)),
  );
}

export function hasRole(roles: ProjectRole[], role: ProjectRole) {
  return roles.includes(role);
}
