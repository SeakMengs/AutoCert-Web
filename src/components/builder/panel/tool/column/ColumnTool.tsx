"use client";
import { Space } from "antd";
import { ColumnAnnotateStates } from "@/components/builder/hooks/useAutoCertAnnotate";
// import { createScopedLogger } from "@/utils/logger";
import { AutoCertTableColumn } from "../../table/AutoCertTable";
import { z } from "zod";
import { isHexColor } from "@/utils/color";
import ColumnAnnotateAdd from "./ColumnAnnotateAdd";
import ColumnAnnotateCard from "./ColumnAnnotateCard";
import fontMetadata from "../../../../../../public/font_metadata.json";

// const logger = createScopedLogger(
//   "components:builder:panel:tool:column:ColumnTool",
// );

export const columnAnnotateFormSchema = z.object({
  value: z.string().trim(),
  fontName: z.string().trim(),
  color: z
    .string()
    .trim()
    .refine((val) => {
      // check if hex
      return isHexColor(val);
    }, "Invalid hex color"),
  textFitRectBox: z.boolean().default(true),
});

export type ColumnAnnotateFormSchema = z.infer<typeof columnAnnotateFormSchema>;

export interface ColumnToolProps {
  currentPdfPage: number;
  columnAnnotates: ColumnAnnotateStates;
  columns: AutoCertTableColumn[];
  selectedAnnotateId: string | undefined;
  onAnnotateSelect: (id: string) => void;
  onColumnAnnotateAdd: (page: number, data: ColumnAnnotateFormSchema) => void;
  onColumnAnnotateUpdate: (id: string, data: ColumnAnnotateFormSchema) => void;
  onColumnAnnotateRemove: (id: string) => void;
}

export type FontOption = {
  label: string;
  value: string;
};

export const FontOptions = fontMetadata.map((f) => ({
  label: f.name,
  value: f.name,
})) satisfies readonly FontOption[];

export default function ColumnTool({
  currentPdfPage,
  onColumnAnnotateAdd,
  selectedAnnotateId,
  columnAnnotates,
  columns,
  onColumnAnnotateUpdate,
  onColumnAnnotateRemove,
  onAnnotateSelect,
}: ColumnToolProps) {
  return (
    <Space direction="vertical" className="w-full">
      <ColumnAnnotateAdd
        currentPdfPage={currentPdfPage}
        onColumnAnnotateAdd={onColumnAnnotateAdd}
        columns={columns}
      />
      <Space direction="vertical" className="w-full">
        {Object.keys(columnAnnotates).map((page) =>
          columnAnnotates[Number(page)].map((ca) => (
            <ColumnAnnotateCard
              key={ca.id}
              columnAnnotate={ca}
              selectedAnnotateId={selectedAnnotateId}
              columns={columns}
              pageNumber={Number(page)}
              onColumnAnnotateUpdate={onColumnAnnotateUpdate}
              onColumnAnnotateRemove={onColumnAnnotateRemove}
              onAnnotateSelect={onAnnotateSelect}
            />
          )),
        )}
      </Space>
    </Space>
  );
}
