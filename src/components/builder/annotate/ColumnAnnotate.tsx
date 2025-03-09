import BaseAnnotate, { BaseAnnotateProps } from "./BaseAnnotate";
import { memo } from "react";

export type ColumnAnnotateFont = {
  name: string;
  size: number;
  weight: number;
  color: string;
};

export type BaseColumnAnnotate = {
  value: string;
  font: ColumnAnnotateFont;
};

export interface ColumnAnnotateProps
  extends Omit<BaseAnnotateProps, "children">,
    BaseColumnAnnotate {}

function ColumnAnnotate({ font, value, ...restProps }: ColumnAnnotateProps) {
  return (
    <BaseAnnotate {...restProps} lockResizeY={true}>
      <span
        // contentEditable={!restProps.previewMode}
        suppressContentEditableWarning
        className={`text-center border-none bg-transparent outline-none resize-none`}
        style={{
          fontFamily: font.name,
          // fontSize: `${font.size}px`,
          fontSize: `1.6vw`,
          fontWeight: font.weight,
          color: font.color,
          lineHeight: "1.2",
        }}
      >
        {`{${value}}`}
      </span>
    </BaseAnnotate>
  );
}

export default memo(ColumnAnnotate);
