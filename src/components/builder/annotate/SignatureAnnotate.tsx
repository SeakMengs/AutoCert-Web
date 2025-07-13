import { memo } from "react";
import BaseAnnotate, {
  BaseAnnotateLock,
  BaseAnnotateProps,
} from "./BaseAnnotate";
import { SignatureOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { SignatoryStatus, SignatureStatusColors } from "./util";

export type SignatureAnnotateLock = BaseAnnotateLock & {
  sign: boolean;
  invite: boolean;
};

export type BaseSignatureAnnotate = {
  signatureUrl?: string;
  email: string;
  status: SignatoryStatus;
  reason?: string;
};

export interface SignatureAnnotateProps
  extends BaseAnnotateProps,
    BaseSignatureAnnotate {
  lock: SignatureAnnotateLock;
  isCurrentSignatory: boolean;
}

function SignatureAnnotate({
  signatureUrl,
  email,
  status,
  isCurrentSignatory,
  ...restProps
}: SignatureAnnotateProps) {
  return (
    <BaseAnnotate
      style={{
        borderStyle: isCurrentSignatory ? "dashed" : "solid",
      }}
      {...restProps}
    >
      {signatureUrl ? (
        <img
          src={signatureUrl}
          alt="Signature"
          className="max-w-full max-h-full w-auto h-auto pointer-events-none select-none"
        />
      ) : (
        <Flex
          vertical
          justify="center"
          align="center"
          className="w-full h-full"
        >
          <SignatureOutlined
            style={{
              fontSize: `1.6vw`,
              color: SignatureStatusColors[status],
            }}
          />
        </Flex>
      )}
    </BaseAnnotate>
  );
}

export default memo(SignatureAnnotate);
