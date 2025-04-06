export const ProjectStatus = {
  Preparing: 0,
  Processing: 1,
  Completed: 2,
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.Preparing]: "Preparing",
  [ProjectStatus.Processing]: "Processing",
  [ProjectStatus.Completed]: "Completed",
};

export const SignatoryStatus = {
  NotInvited: 0,
  Invited: 1,
  Signed: 2,
} as const;

export type SignatoryStatus =
  (typeof SignatoryStatus)[keyof typeof SignatoryStatus];

export const SignatoryStatusLabels: Record<SignatoryStatus, string> = {
  [SignatoryStatus.NotInvited]: "Not Invited",
  [SignatoryStatus.Invited]: "Invited",
  [SignatoryStatus.Signed]: "Signed",
};

export const ProjectRole = {
  Owner: 0,
  Signatory: 1,
  None: 2,
} as const;

export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];

export const ProjectRoleLabels: Record<ProjectRole, string> = {
  [ProjectRole.Owner]: "Owner",
  [ProjectRole.Signatory]: "Signatory",
  [ProjectRole.None]: "None",
};
