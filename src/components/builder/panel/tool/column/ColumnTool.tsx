"use client";
import { Space } from "antd";
// import { createScopedLogger } from "@/utils/logger";
import { AutoCertTableColumn } from "../../table/AutoCertTable";
import { z } from "zod";
import { isHexColor } from "@/utils/color";
import ColumnAnnotateAdd from "./ColumnAnnotateAdd";
import ColumnAnnotateCard from "./ColumnAnnotateCard";
import { ColumnAnnotateStates } from "@/components/builder/store/autocertAnnotate";
import { ProjectRole, ProjectStatus } from "@/types/project";
import { ColumnAnnotateLock } from "@/components/builder/annotate/ColumnAnnotate";
import { useAutoCertStore } from "@/components/builder/providers/AutoCertStoreProvider";
import { useShallow } from "zustand/react/shallow";
import { hasPermission, ProjectPermission } from "@/auth/rbac";
import { fontMetadata } from "@/utils/font";

// const logger = createScopedLogger(
//   "components:builder:panel:tool:column:ColumnTool",
// );

export const columnAnnotateFormSchema = z.object({
  value: z.string().trim(),
  fontName: z.string().trim(),
  fontColor: z
    .string()
    .trim()
    .refine((val) => {
      // check if hex color
      return isHexColor(val);
    }, "Invalid hex color"),
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
  path: string;
};

export const FontOptions = fontMetadata.map((f) => ({
  label: f.name,
  value: f.name,
  path: f.path,
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
  const { project, roles, getAnnotateLockState } = useAutoCertStore(
    useShallow((state) => {
      return {
        project: state.project,
        roles: state.roles,
        getAnnotateLockState: state.getAnnotateLockState,
      };
    }),
  );

  return (
    <Space direction="vertical" className="w-full">
      <ColumnAnnotateAdd
        currentPdfPage={currentPdfPage}
        onColumnAnnotateAdd={onColumnAnnotateAdd}
        columns={columns}
        canAdd={
          project.status === ProjectStatus.Draft &&
          hasPermission(roles, [ProjectPermission.AnnotateColumnAdd])
        }
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
              lock={getAnnotateLockState(ca)}
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
