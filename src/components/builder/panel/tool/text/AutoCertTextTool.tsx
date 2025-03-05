"use client";
import { Space } from "antd";
import { TextAnnotateStates } from "@/components/builder/hooks/useAutoCert";
import { createScopedLogger } from "@/utils/logger";
import { AutoCertTableColumn } from "../../table/AutoCertTable";
import AnnotateTextCard from "./AnnotateTextCard";
import AutoCertTextToolAdd from "./AutoCertTextToolAdd";
import { z } from "zod";

const logger = createScopedLogger(
  "components:builder:panel:tool:text:AutoCertTextTool",
);

export const textAnnotateFormSchema = z.object({
  value: z.string().trim(),
  fontName: z.string().trim(),
  color: z
    .string()
    .trim()
    .refine((val) => {
      // check if hex
      return isHexColor(val);
    }, "Invalid hex color"),
});

export type TextAnnotateFormSchema = z.infer<typeof textAnnotateFormSchema>;

export interface AutoCertTextToolProps {
  currentPdfPage: number;
  textAnnotates: TextAnnotateStates;
  columns: AutoCertTableColumn[];
  selectedAnnotateId: string | undefined;
  onAnnotateSelect: (id: string) => void;
  onTextAnnotateAdd: (
    page: number,
    { value, fontName, color }: TextAnnotateFormSchema,
  ) => void;
  onTextAnnotateUpdate: (
    id: string,
    { value, fontName, color }: TextAnnotateFormSchema,
  ) => void;
  onTextAnnotateRemove: (id: string) => void;
}

export type FontOption = {
  label: string;
  value: string;
};

// TODO: Add font options based on backend fonts
export const fontOptions = [
  { label: "Arial", value: "Arial" },
  { label: "Helvetica", value: "Helvetica" },
  { label: "Times New Roman", value: "Times New Roman" },
] satisfies FontOption[];

export default function AutoCertTextTool({
  currentPdfPage,
  onTextAnnotateAdd,
  selectedAnnotateId,
  textAnnotates,
  columns,
  onTextAnnotateUpdate,
  onTextAnnotateRemove,
  onAnnotateSelect,
}: AutoCertTextToolProps) {
  return (
    <Space direction="vertical" className="w-full">
      <AutoCertTextToolAdd
        currentPdfPage={currentPdfPage}
        onTextAnnotateAdd={onTextAnnotateAdd}
        columns={columns}
      />
      <Space direction="vertical" className="w-full">
        {Object.keys(textAnnotates).map((page) =>
          textAnnotates[Number(page)].map((ta) => (
            <AnnotateTextCard
              key={ta.id}
              textAnnotate={ta}
              selectedAnnotateId={selectedAnnotateId}
              columns={columns}
              pageNumber={Number(page)}
              onTextAnnotateUpdate={onTextAnnotateUpdate}
              onTextAnnotateRemove={onTextAnnotateRemove}
              onAnnotateSelect={onAnnotateSelect}
            />
          )),
        )}
      </Space>
    </Space>
  );
}
