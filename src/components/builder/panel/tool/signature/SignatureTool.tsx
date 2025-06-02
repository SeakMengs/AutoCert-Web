import { Space } from "antd";
import { z } from "zod";
import { isHexColor } from "@/utils/color";
import SignatureAnnotateAdd from "./SignatureAnnotateAdd";
import SignatureAnnotateCard from "./SignatureAnnotateCard";
import {
  AutocertAnnotateSliceActions,
  SignatureAnnotateStates,
} from "@/components/builder/store/autocertAnnotate";
import { useShallow } from "zustand/react/shallow";
import { useAutoCertStore } from "@/components/builder/providers/AutoCertStoreProvider";
import { hasPermission, ProjectPermission } from "@/auth/rbac";
import { ProjectStatus } from "@/types/project";

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
  onSignatureAnnotateReject: (id: string, reason?: string) => void;
  onSignatureAnnotateSign: AutocertAnnotateSliceActions["signSignatureAnnotate"];
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
  onSignatureAnnotateReject,
  onSignatureAnnotateSign,
}: SignatureToolProps) {
  const { project, roles, getAnnotateLockState } = useAutoCertStore(
    useShallow((state) => {
      return {
        project: state.project,
        roles: state.roles,
        getAnnotateLockState: state.getAnnotateLockState,
      };
    }),
  );

  return (
    <Space direction="vertical" className="w-full">
      <SignatureAnnotateAdd
        currentPdfPage={currentPdfPage}
        onSignatureAnnotateAdd={onSignatureAnnotateAdd}
        canAdd={
          project.status === ProjectStatus.Draft &&
          hasPermission(roles, [ProjectPermission.AnnotateSignatureAdd])
        }
      />
      <Space direction="vertical" className="w-full">
        {Object.keys(signatureAnnotates).map((page) =>
          signatureAnnotates[Number(page)].map((sa) => (
            <SignatureAnnotateCard
              key={sa.id}
              pageNumber={Number(page)}
              signatureAnnotate={sa}
              selectedAnnotateId={selectedAnnotateId}
              lock={getAnnotateLockState(sa)}
              onAnnotateSelect={onAnnotateSelect}
              onSignatureAnnotateReject={onSignatureAnnotateReject}
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
