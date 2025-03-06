import { Space } from "antd";
import { SignatureAnnotateStates } from "@/components/builder/hooks/useAutoCert";
import AnnotateSignatoryCard from "./AnnotateSignatoryCard";
import { z } from "zod";
import AutoCertSignatureToolAdd from "./AutoCertSignatoryToolAdd";
import { isHexColor } from "@/utils/color";

export const signatureAnnotateFormSchema = z.object({
  email: z.string().trim().email({
    message: "Invalid email address",
  }),
  color: z
    .string()
    .trim()
    .refine((val) => {
      // check if hex
      return isHexColor(val);
    }, "Invalid hex color"),
});

export type SignatureAnnotateFormSchema = z.infer<
  typeof signatureAnnotateFormSchema
>;

export interface AutoCertSignatoryToolProps {
  currentPdfPage: number;
  signatureAnnotates: SignatureAnnotateStates;
  selectedAnnotateId: string | undefined;
  onSignatureAnnotateAdd: (
    page: number,
    data: SignatureAnnotateFormSchema,
  ) => void;
  onSignatureAnnotateRemove: (id: string) => void;
  onSignatureAnnotateInvite: (id: string) => void;
  onAnnotateSelect: (id: string) => void;
}

export default function AutoCertSignatoryTool({
  currentPdfPage,
  signatureAnnotates,
  selectedAnnotateId,
  onAnnotateSelect,
  onSignatureAnnotateAdd,
  onSignatureAnnotateInvite,
  onSignatureAnnotateRemove,
}: AutoCertSignatoryToolProps) {
  return (
    <Space direction="vertical" className="w-full">
      <AutoCertSignatureToolAdd
        currentPdfPage={currentPdfPage}
        onSignatureAnnotateAdd={onSignatureAnnotateAdd}
      />
      <Space direction="vertical" className="w-full">
        {Object.keys(signatureAnnotates).map((page) =>
          signatureAnnotates[Number(page)].map((sa) => (
            <AnnotateSignatoryCard
              key={sa.id}
              pageNumber={Number(page)}
              signatureAnnotate={sa}
              selectedAnnotateId={selectedAnnotateId}
              onAnnotateSelect={onAnnotateSelect}
              onSignatureAnnotateInvite={onSignatureAnnotateInvite}
              onSignatureAnnotateRemove={onSignatureAnnotateRemove}
            />
          )),
        )}
      </Space>
    </Space>
  );
}
