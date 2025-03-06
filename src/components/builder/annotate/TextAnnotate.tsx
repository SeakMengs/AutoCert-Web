import { z } from "zod";
import BaseAnnotate, { BaseAnnotateProps } from "./BaseAnnotate";
import { memo } from "react";

export type TextAnnotateFont = {
  name: string;
  size: number;
  weight: number;
  color: string;
};

export type BaseTextAnnotate = {
  value: string;
  font: TextAnnotateFont;
};

export interface TextAnnotateProps
  extends Omit<BaseAnnotateProps, "children">,
    BaseTextAnnotate {}

function TextAnnotate({ font, value, ...restProps }: TextAnnotateProps) {
  return (
    <BaseAnnotate {...restProps}>
      <span
        contentEditable={!restProps.previewMode}
        suppressContentEditableWarning
        id={`textAnnotate-${restProps.id}`}
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

export default memo(TextAnnotate);
