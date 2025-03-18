import BaseAnnotate, { BaseAnnotateProps } from "./BaseAnnotate";
import { memo } from "react";

export type ColumnAnnotateFont = {
  fontName: string;
  fontSize: number;
  fontWeight: "regular" | "bold";
  fontColor: string;
};

export type BaseColumnAnnotate = ColumnAnnotateFont & {
  value: string;
  textFitRectBox: boolean;
};

export interface ColumnAnnotateProps
  extends Omit<BaseAnnotateProps, "children">,
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
          fontWeight: fontWeight === "bold" ? 700 : 400,
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
