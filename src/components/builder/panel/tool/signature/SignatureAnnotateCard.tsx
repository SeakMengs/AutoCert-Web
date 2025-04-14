import { Tag, Card, Avatar, Space, Typography, Flex, theme } from "antd";
import { SignatureAnnotateState } from "@/components/builder/hooks/useAutoCert";
import { SignatureToolProps } from "./SignatureTool";
import { JSX } from "react";
import SignatureAnnotateRemove from "./SignatureAnnotateRemove";
import SignatureAnnotateInvite from "./SignatureAnnotateInvite";
import { SignatoryStatus, SignatoryStatusLabels } from "@/types/project";

export interface SignatureAnnotateCardProps
  extends Pick<
    SignatureToolProps,
    | "selectedAnnotateId"
    | "onAnnotateSelect"
    | "onSignatureAnnotateRemove"
    | "onSignatureAnnotateInvite"
  > {
  signatureAnnotate: SignatureAnnotateState;
  pageNumber: number;
}

const { Text } = Typography;

export default function SignatureAnnotateCard({
  pageNumber,
  signatureAnnotate,
  selectedAnnotateId,
  onAnnotateSelect,
  // Invite signatory to sign
  onSignatureAnnotateInvite,
  onSignatureAnnotateRemove,
}: SignatureAnnotateCardProps) {
  const {
    token: { colorPrimary },
  } = theme.useToken();

  const getStatusTag = (): JSX.Element | null => {
    const statusColors: Record<SignatoryStatus, string | undefined> = {
      [SignatoryStatus.NotInvited]: undefined,
      [SignatoryStatus.Invited]: "blue",
      [SignatoryStatus.Signed]: "green",
    };

    const statusColor = statusColors[signatureAnnotate.status];
    return (
      <Tag color={statusColor}>
        {SignatoryStatusLabels[signatureAnnotate.status]}
      </Tag>
    );
  };

  const getInitialEmail = (email: string): string => {
    return email.split("@")[0].slice(0, 2).toUpperCase();
  };

  const getActionButton = (): JSX.Element | null => {
    switch (signatureAnnotate.status) {
      case SignatoryStatus.NotInvited:
        return (
          <SignatureAnnotateInvite
            signatureAnnotate={signatureAnnotate}
            onSignatureAnnotateInvite={onSignatureAnnotateInvite}
          />
        );
      case SignatoryStatus.Invited:
        return null;
      case SignatoryStatus.Signed:
        return null;
      default:
        return null;
    }
  };

  return (
    <Card
      className="w-full"
      size="small"
      onClick={() => onAnnotateSelect(signatureAnnotate.id)}
      style={{
        border: "1px solid transparent",
        borderColor:
          signatureAnnotate.id === selectedAnnotateId
            ? colorPrimary
            : undefined,
      }}
    >
      <Flex justify="center" align="center" gap={12} wrap>
        <Avatar className="whitespace-nowrap">
          {getInitialEmail(signatureAnnotate.email)}
        </Avatar>

        <Flex style={{ flex: 1 }} vertical>
          <Text>{signatureAnnotate.email}</Text>
          <div
            style={{
              flex: 0,
            }}
          >
            {getStatusTag()}
            <Text type="secondary" className="text-xs">
              Page: {pageNumber}
            </Text>
          </div>
        </Flex>

        <Space size={8}>
          {getActionButton()}
          <SignatureAnnotateRemove
            signatureAnnotate={signatureAnnotate}
            onSignatureAnnotateRemove={onSignatureAnnotateRemove}
          />
        </Space>
      </Flex>
    </Card>
  );
}
