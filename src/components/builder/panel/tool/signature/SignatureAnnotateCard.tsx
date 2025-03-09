import {
  Tag,
  Button,
  Card,
  Avatar,
  Space,
  Popconfirm,
  Typography,
  Flex,
  theme,
  Tooltip,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { SignatureAnnotateState } from "@/components/builder/hooks/useAutoCert";
import { SignatureToolProps } from "./SignatureTool";

interface SignatureAnnotateCardProps
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

  const getStatusTag = () => {
    switch (signatureAnnotate.status) {
      case "not_invited":
        return <Tag>Not Invited</Tag>;
      case "invited":
        return <Tag color="blue">Invited</Tag>;
      case "signed":
        return <Tag color="green">Signed</Tag>;
      default:
        return null;
    }
  };

  const getInitialEmail = (email: string) => {
    return email.split("@")[0].slice(0, 2).toUpperCase();
  };

  const getActionButton = () => {
    switch (signatureAnnotate.status) {
      case "not_invited":
        return (
          <Tooltip title="Invite signatory">
            <Button
              type="primary"
              size="small"
              onClick={() => onSignatureAnnotateInvite(signatureAnnotate.id)}
            >
              Invite
            </Button>
          </Tooltip>
        );
      case "invited":
        return null;
      case "signed":
        return null;
      default:
        return null;
    }
  };

  const getRemoveConfirmMessage = () => {
    const prefix = "Are you sure you want to remove this signatory?";
    switch (signatureAnnotate.status) {
      case "not_invited":
        return prefix;
      case "invited":
        return `${prefix} They will no longer be able to sign this certificate.`;
      case "signed":
        return `${prefix} The signature will be removed from the certificate.`;
      default:
        return prefix;
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
          <Popconfirm
            title={getRemoveConfirmMessage()}
            onConfirm={() => onSignatureAnnotateRemove(signatureAnnotate.id)}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      </Flex>
    </Card>
  );
}
