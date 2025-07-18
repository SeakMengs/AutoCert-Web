// All type here is based on the autocert api.

export const ProjectStatus = {
  Draft: 0,
  Processing: 1,
  Completed: 2,
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.Draft]: "Draft",
  [ProjectStatus.Processing]: "Processing",
  [ProjectStatus.Completed]: "Completed",
};

export const ProjectRole = {
  Requestor: 0,
  Signatory: 1,
  None: 2,
} as const;

export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];

export const ProjectRoleLabels: Record<ProjectRole, string> = {
  [ProjectRole.Requestor]: "Requestor",
  [ProjectRole.Signatory]: "Signatory",
  [ProjectRole.None]: "None",
};
