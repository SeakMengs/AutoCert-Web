import { memo } from "react";
import BaseAnnotate, { BaseAnnotateProps } from "./BaseAnnotate";
import { SignatoryStatus } from "@/types/project";
import { SignatureOutlined } from "@ant-design/icons";
import { Flex } from "antd";

export const SignatureStatusColors: Record<
  SignatoryStatus,
  string | undefined
> = {
  [SignatoryStatus.NotInvited]: undefined,
  [SignatoryStatus.Invited]: "#1677FF",
  [SignatoryStatus.Signed]: "#90EE90",
};

export type BaseSignatureAnnotate = {
  signatureData: string | null;
  email: string;
  status: SignatoryStatus;
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
          className="w-full h-full pointer-events-none select-none!"
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
