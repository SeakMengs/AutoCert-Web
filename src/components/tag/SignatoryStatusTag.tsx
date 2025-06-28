import { Tag } from "antd";
import { JSX } from "react";
import { SignatoryStatus, SignatoryStatusLabels } from "../builder/annotate/util";

const StatusColors: Record<SignatoryStatus, string | undefined> = {
  [SignatoryStatus.NotInvited]: undefined,
  [SignatoryStatus.Invited]: "blue",
  [SignatoryStatus.Signed]: "green",
  [SignatoryStatus.Rejected]: "red",
};

const getSignatoryStatusTag = (status: SignatoryStatus): JSX.Element | null => {
  const statusColor = StatusColors[status];
  return <Tag color={statusColor}>{SignatoryStatusLabels[status]}</Tag>;
};

export default function SignatoryStatusTag({
  status,
}: {
  status: SignatoryStatus;
}) {
  return <>{getSignatoryStatusTag(status)}</>;
}
