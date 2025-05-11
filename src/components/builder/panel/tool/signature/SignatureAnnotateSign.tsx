"use client";
import { App, Button, Popconfirm, Tooltip } from "antd";
import { SignatureAnnotateCardProps } from "./SignatureAnnotateCard";
import { createScopedLogger } from "@/utils/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@/app/dashboard/projects/[projectId]/builder/query";
import { getTranslatedErrorMessage } from "@/utils/error";

const logger = createScopedLogger(
  "components:builder:panel:tool:signature:SignatureAnnotateSign",
);

export interface SignatureAnnotateSignProps
  extends Pick<
    SignatureAnnotateCardProps,
    "onSignatureAnnotateSign" | "signatureAnnotate"
  > {}

export default function SignatureAnnotateSign({
  signatureAnnotate,
  onSignatureAnnotateSign,
}: SignatureAnnotateSignProps) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
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

      // TODO: use project id from context
      queryClient.invalidateQueries({ queryKey: [QueryKey] });
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
          loading={isPending}
          disabled={isPending}
        >
          Approve
        </Button>
      </Tooltip>
    </Popconfirm>
  );
}
