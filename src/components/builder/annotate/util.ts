export const AnnotateFontSize = 24;
export const AnnotateFontColor = "#000000";

export const FontWeight = {
  Regular: "regular",
  Bold: "bold",
} as const;

export const SignatoryStatus = {
  NotInvited: 0,
  Invited: 1,
  Signed: 2,
  Rejected: 3,
} as const;

export type SignatoryStatus =
  (typeof SignatoryStatus)[keyof typeof SignatoryStatus];

export const SignatureStatusColors: Record<
  SignatoryStatus,
  string | undefined
> = {
  [SignatoryStatus.NotInvited]: undefined,
  [SignatoryStatus.Invited]: "#1677FF",
  [SignatoryStatus.Signed]: "#90EE90",
  [SignatoryStatus.Rejected]: "#FF4D4F",
};

export const SignatoryStatusLabels: Record<SignatoryStatus, string> = {
  [SignatoryStatus.NotInvited]: "Not Invited",
  [SignatoryStatus.Invited]: "Invited",
  [SignatoryStatus.Signed]: "Signed",
  [SignatoryStatus.Rejected]: "Rejected",
};