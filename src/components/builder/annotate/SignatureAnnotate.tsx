import BaseAnnotate, { BaseAnnotateProps } from "./BaseAnnotate";

export type BaseSignatureAnnotate = {
    signatureData: string | null;
};

export interface SignatureAnnotateProps
    extends Omit<BaseAnnotateProps, "children">,
        BaseSignatureAnnotate {}

export default function SignatureAnnotate({
    id,
    position,
    size,
    previewMode,
    signatureData,
    resizable,
    color,
    onDragStop,
    onResizeStop,
}: SignatureAnnotateProps) {
    return (
        <BaseAnnotate
            id={id}
            position={position}
            size={size}
            previewMode={previewMode}
            resizable={resizable}
            color={color}
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
        >
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
