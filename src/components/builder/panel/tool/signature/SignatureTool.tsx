import { Space } from "antd";
import { SignatureAnnotateStates } from "@/components/builder/hooks/useAutoCertAnnotate";
import { z } from "zod";
import { isHexColor } from "@/utils/color";
import SignatureAnnotateAdd from "./SignatureAnnotateAdd";
import SignatureAnnotateCard from "./SignatureAnnotateCard";
import { useAutoCert } from "@/hooks/useAutoCert";

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

export interface SignatureToolProps {
  currentPdfPage: number;
  signatureAnnotates: SignatureAnnotateStates;
  selectedAnnotateId: string | undefined;
  onSignatureAnnotateAdd: (
    page: number,
    data: SignatureAnnotateFormSchema,
  ) => void;
  onSignatureAnnotateRemove: (id: string) => void;
  onSignatureAnnotateInvite: (id: string) => void;
  onSignatureAnnotateSign: ReturnType<
    typeof useAutoCert
  >["onSignatureAnnotateSign"];
  onAnnotateSelect: (id: string) => void;
}

export default function SignatureTool({
  currentPdfPage,
  signatureAnnotates,
  selectedAnnotateId,
  onAnnotateSelect,
  onSignatureAnnotateAdd,
  onSignatureAnnotateInvite,
  onSignatureAnnotateRemove,
  onSignatureAnnotateSign,
}: SignatureToolProps) {
  return (
    <Space direction="vertical" className="w-full">
      <SignatureAnnotateAdd
        currentPdfPage={currentPdfPage}
        onSignatureAnnotateAdd={onSignatureAnnotateAdd}
      />
      <Space direction="vertical" className="w-full">
        {Object.keys(signatureAnnotates).map((page) =>
          signatureAnnotates[Number(page)].map((sa) => (
            <SignatureAnnotateCard
              key={sa.id}
              pageNumber={Number(page)}
              signatureAnnotate={sa}
              selectedAnnotateId={selectedAnnotateId}
              onAnnotateSelect={onAnnotateSelect}
              onSignatureAnnotateInvite={onSignatureAnnotateInvite}
              onSignatureAnnotateRemove={onSignatureAnnotateRemove}
              onSignatureAnnotateSign={onSignatureAnnotateSign}
            />
          )),
        )}
      </Space>
    </Space>
  );
}
