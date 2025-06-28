"use client";
import BaseAnnotate, {
  BaseAnnotateLock,
  BaseAnnotateProps,
} from "./BaseAnnotate";
import { memo, useEffect } from "react";
import { FontWeight, loadCustomFont } from "./util";
import { createScopedLogger } from "@/utils/logger";
import { fontMetadata } from "@/utils/font";

const logger = createScopedLogger("components:builder:annotate:ColumnAnnotate");

export type FontWeight = (typeof FontWeight)[keyof typeof FontWeight];

export type ColumnAnnotateFont = {
  fontName: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontColor: string;
};

export type ColumnAnnotateLock = BaseAnnotateLock & {};

export type BaseColumnAnnotate = ColumnAnnotateFont & {
  value: string;
  textFitRectBox: boolean;
};

export interface ColumnAnnotateProps
  extends BaseAnnotateProps,
    BaseColumnAnnotate {
  lock: ColumnAnnotateLock;
}

function ColumnAnnotate({
  fontName,
  fontSize,
  fontColor,
  fontWeight,
  value,
  width,
  height,
  ...restProps
}: ColumnAnnotateProps) {
  useEffect(() => {
    const fetchFont = async () => {
      try {
        const targetFont = fontMetadata.find((f) => f.name === fontName);
        if (targetFont) {
          await loadCustomFont(targetFont.name, targetFont.path);
        }
      } catch (e) {
        logger.error("Failed to load custom font", {
          fontName,
          error: e,
        });
      }
    };

    fetchFont();
  }, [fontName]);

  return (
    <BaseAnnotate height={height} width={width} {...restProps}>
      <span
        suppressContentEditableWarning
        className="text-center border-none bg-transparent outline-none resize-none"
        style={{
          fontSize: `1.6vw`,
          fontFamily: fontName,
          fontWeight: fontWeight === FontWeight.Bold ? 700 : 400,
          color: fontColor,
          lineHeight: "1.2",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {`{${value}}`}
      </span>
    </BaseAnnotate>
  );
}

export default memo(ColumnAnnotate);
