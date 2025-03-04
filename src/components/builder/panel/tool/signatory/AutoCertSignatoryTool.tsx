import { Button, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { SignatureAnnotateStates } from "@/components/builder/hooks/useAutoCert";
import AnnotateSignatoryCard from "./AnnotateSignatoryCard";

export interface AutoCertSignatoryToolProps {
  currentPdfPage: number;
  signatureAnnotates: SignatureAnnotateStates;
  selectedAnnotateId: string | undefined;
  onAddSignatureField: () => void;
  onAnnotateSelect: (id: string) => void;
}

export default function AutoCertSignatoryTool({
  currentPdfPage,
  signatureAnnotates,
  selectedAnnotateId,
  onAnnotateSelect,
  onAddSignatureField,
}: AutoCertSignatoryToolProps) {
  return (
    <div>
      {/* TODO: convert to add */}
      <Button
        className="w-full"
        type="dashed"
        icon={<PlusOutlined />}
        onClick={onAddSignatureField}
      >
        Signature Placement
      </Button>
      <Space direction="vertical" className="w-full">
        {Object.keys(signatureAnnotates).map((page) =>
          signatureAnnotates[Number(page)].map((sa) => (
            <AnnotateSignatoryCard
              key={sa.id}
              signatureAnnotate={sa}
              selectedAnnotateId={selectedAnnotateId}
              onAnnotateSelect={onAnnotateSelect}
              onSignatoryInvite={() => {}}
              onSignatoryRemove={() => {}}
              // temporary
              signatory={{
                id: "1",
                email: "lol@gmail.com",
                status: "not_invited",
                invitedAt: "2023-10-01T00:00:00Z",
                signedAt: "2023-10-01T00:00:00Z",
              }}
            />
          )),
        )}
      </Space>
    </div>
  );
}
