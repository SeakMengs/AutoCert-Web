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
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { AutoCertSignatoryToolProps } from "./AutoCertSignatoryTool";
import { SignatureAnnotateState } from "@/components/builder/hooks/useAutoCert";

// TODO: update this, currently is temporary
interface SignatoryType {
  id: string;
  email: string;
  status: "not_invited" | "invited" | "signed";
  invitedAt?: string;
  signedAt?: string;
}

interface AnnotateSignatoryCardProps
  extends Pick<
    AutoCertSignatoryToolProps,
    "selectedAnnotateId" | "onAnnotateSelect"
  > {
  signatureAnnotate: SignatureAnnotateState;
  signatory: SignatoryType;
  onSignatoryInvite: (id: string) => void;
  onSignatoryRemove: (id: string) => void;
}

const { Text } = Typography;

export default function AnnotateSignatoryCard({
  signatureAnnotate,
  selectedAnnotateId,
  signatory,
  onAnnotateSelect,
  onSignatoryInvite,
  onSignatoryRemove,
}: AnnotateSignatoryCardProps) {
  const {
    token: { colorPrimary },
  } = theme.useToken();

  const getStatusTag = () => {
    switch (signatory.status) {
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
    switch (signatory.status) {
      case "not_invited":
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => onSignatoryInvite(signatory.id)}
          >
            Invite
          </Button>
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
        <Avatar
          style={{
            backgroundColor: "#1677ff",
            color: "#fff",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getInitials(signatory.email)}
        </Avatar>

        <div style={{ flex: 1 }}>
          <Text style={{ display: "block" }}>{signatory.email}</Text>
          {getStatusTag()}
        </div>

        <Space size={8}>
          {getActionButton()}
          <Popconfirm
            title="Remove signatory"
            description="Are you sure you want to remove this signatory?"
            onConfirm={() => onSignatoryRemove(signatory.id)}
            okText="Remove"
            cancelText="Cancel"
            placement="left"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              style={{ width: 24, height: 24 }}
            />
          </Popconfirm>
        </Space>
      </Flex>
    </Card>
  );
}
