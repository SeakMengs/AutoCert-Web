import { Button, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { SignatureAnnotateStates } from "@/components/builder/hooks/useAutoCert";
import AnnotateSignatoryCard from "./AnnotateSignatoryCard";
import { z } from "zod";

export const signatureFieldSchema = z.object({
  email: z.string().trim().email({
    message: "Invalid email address",
  }),
});

export type SignatureSchema = z.infer<typeof signatureFieldSchema>;

export interface AutoCertSignatoryToolProps {
  currentPdfPage: number;
  signatureAnnotates: SignatureAnnotateStates;
  selectedAnnotateId: string | undefined;
  onSignatureAnnotateAdd: () => void;
  onAnnotateSelect: (id: string) => void;
}

export default function AutoCertSignatoryTool({
  currentPdfPage,
  signatureAnnotates,
  selectedAnnotateId,
  onAnnotateSelect,
  onSignatureAnnotateAdd,
}: AutoCertSignatoryToolProps) {
  return (
    <div>
      {/* TODO: convert to add */}
      <Button
        className="w-full"
        type="dashed"
        icon={<PlusOutlined />}
        onClick={onSignatureAnnotateAdd}
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
            />
          )),
        )}
      </Space>
    </div>
  );
}
