import BaseAnnotate, { BaseAnnotateProps } from "./BaseAnnotate";

export type BaseSignatureAnnotate = {
    signatureData: string | null;
};

export interface SignatureAnnotateProps
    extends Omit<BaseAnnotateProps, "children">,
        BaseSignatureAnnotate {}

export default function SignatureAnnotate({
    signatureData,
    ...restProps
}: SignatureAnnotateProps) {
    return (
        <BaseAnnotate {...restProps}>
            {signatureData ? (
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
