"use client";
import { App, Button, Popconfirm, Tooltip } from "antd";
import { SignatureAnnotateCardProps } from "./SignatureAnnotateCard";
import { createScopedLogger } from "@/utils/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getTranslatedErrorMessage } from "@/utils/error";
import { useAutoCertStore } from "@/components/builder/providers/AutoCertStoreProvider";
import { useShallow } from "zustand/react/shallow";
import { QueryKey } from "@/utils/react_query";

const logger = createScopedLogger(
  "components:builder:panel:tool:signature:SignatureAnnotateSign",
);

export interface SignatureAnnotateSignProps
  extends Pick<
    SignatureAnnotateCardProps,
    "onSignatureAnnotateSign" | "signatureAnnotate"
  > {
  canSign: boolean;
}

export default function SignatureAnnotateSign({
  signatureAnnotate,
  canSign,
  onSignatureAnnotateSign,
}: SignatureAnnotateSignProps) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { project } = useAutoCertStore(
    useShallow((state) => {
      return {
        project: state.project,
        roles: state.roles,
        getAnnotateLockState: state.getAnnotateLockState,
      };
    }),
  );

  const { mutateAsync, isPending: approving } = useMutation({
    mutationFn: async () => {
      logger.debug("AutoCert sign signature annotate confirmed");
      return await onSignatureAnnotateSign(signatureAnnotate.id);
    },
    onSuccess: (data, variables) => {
      if (!data.success) {
        const { errors } = data;

        const specificError = getTranslatedErrorMessage(errors, {
          type: "Wrong annotate type",
          status: "Signature request is not in a valid state to be signed",
          notSignatory:
            "You are not allowed to sign this signature request as you are not a signatory of this request",
          signatureFile: "Signature file is not valid",
          notFound: "Could not find the signature annotate",
          forbidden: "You are not allowed to sign this signature request",
          noSignatureInCookie:
            "You have not uploaded a signature file yet. Please go to signature request and upload a signature file",
        });
        if (specificError) {
          message.error(specificError);
          return;
        }

        message.error("Failed to approve signature");
        return;
      }

      queryClient.invalidateQueries({ queryKey: [QueryKey.ProjectBuilderById, project.id] });
    },
    onError: (error) => {
      logger.error("Failed to approve signature", error);
      message.error("Failed to approve signature");
    },
  });

  return (
    <Popconfirm
      title="Are you sure you want to approve signature to this project?"
      onConfirm={async () => mutateAsync()}
    >
      <Tooltip title="Approve signature">
        <Button
          type="primary"
          size="small"
          color="green"
          loading={approving}
          disabled={!canSign || approving}
        >
          Approve
        </Button>
      </Tooltip>
    </Popconfirm>
  );
}
