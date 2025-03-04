"use client";
import { Space } from "antd";
import {
  TextAnnotateStates,
} from "@/components/builder/hooks/useAutoCert";
import { createScopedLogger } from "@/utils/logger";
import { AutoCertTableColumn } from "../../table/AutoCertTable";
import AnnotateTextCard from "./AnnotateTextCard";
import AutoCertTextToolAdd from "./AutoCertTextToolAdd";

const logger = createScopedLogger(
  "components:builder:panel:tool:text:AutoCertTextTool",
);

export type TextFieldSchema = {
  value: string;
  fontName: string;
  color: string;
};

export interface AutoCertTextToolProps {
  currentPdfPage: number;
  textAnnotates: TextAnnotateStates;
  columns: AutoCertTableColumn[];
  selectedAnnotateId: string | undefined;
  onAnnotateSelect: (id: string) => void;
  onAddTextField: (
    page: number,
    { value, fontName, color }: TextFieldSchema,
  ) => void;
  onUpdateTextField: (
    id: string,
    { value, fontName, color }: TextFieldSchema,
  ) => void;
  onDeleteTextField: (id: string) => void;
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
  onAddTextField,
  selectedAnnotateId,
  textAnnotates,
  columns,
  onUpdateTextField,
  onDeleteTextField,
  onAnnotateSelect,
}: AutoCertTextToolProps) {
  return (
    <Space direction="vertical" className="w-full">
      <AutoCertTextToolAdd
        currentPdfPage={currentPdfPage}
        onAddTextField={onAddTextField}
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
              onUpdateTextField={onUpdateTextField}
              onDeleteTextField={onDeleteTextField}
              onAnnotateSelect={onAnnotateSelect}
            />
          )),
        )}
      </Space>
    </Space>
  );
}
