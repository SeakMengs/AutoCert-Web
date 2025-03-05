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
import { AutoCertSignatoryToolProps } from "./AutoCertSignatoryTool";
import { SignatureAnnotateState } from "@/components/builder/hooks/useAutoCert";

// TODO: update this, currently is temporary

interface AnnotateSignatoryCardProps
  extends Pick<
    AutoCertSignatoryToolProps,
    "selectedAnnotateId" | "onAnnotateSelect"
  > {
  signatureAnnotate: SignatureAnnotateState;
  onSignatoryInvite: (id: string) => void;
  onSignatoryRemove: (id: string) => void;
}

const { Text } = Typography;

export default function AnnotateSignatoryCard({
  signatureAnnotate,
  selectedAnnotateId,
  onAnnotateSelect,
  onSignatoryInvite,
  onSignatoryRemove,
}: AnnotateSignatoryCardProps) {
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

  const getInitials = (email: string) => {
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
              onClick={() => onSignatoryInvite(signatureAnnotate.id)}
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
      <Flex justify="center" align="center" gap={12}>
        <Avatar className="whitespace-nowrap">
          {getInitials(signatureAnnotate.email)}
        </Avatar>

        <div style={{ flex: 1 }}>
          <Text>{signatureAnnotate.email}</Text>
          {getStatusTag()}
        </div>

        <Space size={8}>
          {getActionButton()}
          <Popconfirm
            title="Are you sure you want to remove this signatory?"
            onConfirm={() => onSignatoryRemove(signatureAnnotate.id)}
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
