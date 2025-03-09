import { memo } from "react";
import BaseAnnotate, { BaseAnnotateProps } from "./BaseAnnotate";

export type BaseSignatureAnnotate = {
  signatureData: string | null;
  email: string;
  status: "not_invited" | "invited" | "signed";
};

export interface SignatureAnnotateProps
  extends Omit<BaseAnnotateProps, "children">,
    BaseSignatureAnnotate {}

function SignatureAnnotate({
  signatureData,
  email,
  status,
  ...restProps
}: SignatureAnnotateProps) {
  return (
    <BaseAnnotate {...restProps}>
      {signatureData ? (
        // eslint-disable-next-line
        <img
          src={signatureData}
          alt="Signature"
          className="w-full h-full pointer-events-none select-none! "
        />
      ) : (
        <span>Signature Field</span>
      )}
    </BaseAnnotate>
  );
}

export default memo(SignatureAnnotate);
