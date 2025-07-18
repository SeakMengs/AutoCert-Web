"use client";
import { Button, Tooltip } from "antd";
import { SignatureAnnotateCardProps } from "./SignatureAnnotateCard";
import { createScopedLogger } from "@/utils/logger";
import { useState } from "react";
import { wait } from "@/utils";
import { FAKE_LOADING_TIME } from "@/components/builder/store/autocertChangeSlice";

const logger = createScopedLogger(
  "components:builder:panel:tool:signature:SignatureAnnotateInvite",
);

export interface SignatureAnnotateInviteProps
  extends Pick<
    SignatureAnnotateCardProps,
    "onSignatureAnnotateInvite" | "signatureAnnotate"
  > {
  canInvite: boolean;
}

export default function SignatureAnnotateInvite({
  signatureAnnotate,
  canInvite,
  onSignatureAnnotateInvite,
}: SignatureAnnotateInviteProps) {
  const [inviting, setInviting] = useState<boolean>(false);

  const handleInviteSignatory = async (): Promise<void> => {
    logger.debug(
      "AutoCert invite signatory confirmed",
      signatureAnnotate.email,
      signatureAnnotate.id,
    );

    if (!canInvite) {
      logger.warn("AutoCert invite signatory is not allowed");
      return;
    }

    setInviting(true);

    try {
      // fake loading to simulate the invite process
      await wait(FAKE_LOADING_TIME);

      onSignatureAnnotateInvite(signatureAnnotate.id);
    } catch (error) {
      logger.error("AutoCert invite signatory failed", error);
    } finally {
      setInviting(false);
    }
  };

  return (
    <Tooltip title="Invite signatory">
      <Button
        variant="solid"
        size="small"
        color="blue"
        onClick={handleInviteSignatory}
        loading={inviting}
        disabled={!canInvite || inviting}
      >
        Invite
      </Button>
    </Tooltip>
  );
}
