import BaseAnnotate, { BaseAnnotateProps } from "./BaseAnnotate";

export interface SignatureAnnotateProps extends Omit<BaseAnnotateProps, "children"> {
    signatureData: string | null;
}

export default function SignatureAnnotate({
    id,
    x,
    y,
    width,
    height,
    signatureData,
    bgColor,
    onDragStop,
    onResizeStop,
}: SignatureAnnotateProps) {
    return (
        <BaseAnnotate
            id={id}
            x={x}
            y={y}
            resizable={undefined}
            width={width}
            height={height}
            bgColor={bgColor}
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
};