import BaseAnnotate, { BaseAnnotateProps } from "./BaseAnnotate";
import { memo } from "react";

export const FontWeight = {
  Regular: "regular",
  Bold: "bold",
} as const;
export type FontWeight = (typeof FontWeight)[keyof typeof FontWeight];

export type ColumnAnnotateFont = {
  fontName: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontColor: string;
};

export type BaseColumnAnnotate = ColumnAnnotateFont & {
  value: string;
  textFitRectBox: boolean;
};

export interface ColumnAnnotateProps
  extends BaseAnnotateProps,
    BaseColumnAnnotate {}

function ColumnAnnotate({
  fontName,
  fontSize,
  fontColor,
  fontWeight,
  value,
  ...restProps
}: ColumnAnnotateProps) {
  return (
    <BaseAnnotate {...restProps} lockResizeY={true}>
      <span
        // contentEditable={!restProps.previewMode}
        suppressContentEditableWarning
        className={`text-center border-none bg-transparent outline-none resize-none`}
        style={{
          fontFamily: fontName,
          // fontSize: `${font.size}px`,
          fontSize: `1.6vw`,
          fontWeight: fontWeight === FontWeight.Bold ? 700 : 400,
          color: fontColor,
          lineHeight: "1.2",
        }}
      >
        {`{${value}}`}
      </span>
    </BaseAnnotate>
  );
}

export default memo(ColumnAnnotate);
