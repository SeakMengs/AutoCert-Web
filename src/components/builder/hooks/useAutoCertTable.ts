import { useEffect, useState } from "react";
import {
  AutoCertTableColumn,
  AutoCertTableRow,
} from "../panel/table/AutoCertTable";
import useAutoCertChange, { AutoCertChangeType } from "./useAutoCertChange";
import { UseAutoCertProps } from "./useAutoCert";
import { hasPermission, ProjectPermission } from "@/auth/rbac";
import { createScopedLogger } from "@/utils/logger";
import { App } from "antd";

const logger = createScopedLogger("components:builder:hook:useAutoCertTable");

export interface UseAutoCertTableProps
  extends Pick<
    UseAutoCertProps,
    "projectId" | "initialColumns" | "initialRows" | "roles"
  > {
  onChange: ReturnType<typeof useAutoCertChange>["onChange"];
}

const denyMsg = "You do not have permission to update table";

export default function useAutoCertTable({
  roles,
  projectId,
  onChange,
  initialRows = [],
  initialColumns = [],
}: UseAutoCertTableProps) {
  const [rows, setRows] = useState<AutoCertTableRow[]>(initialRows);
  const [columns, setColumns] = useState<AutoCertTableColumn[]>(initialColumns);
  const { message } = App.useApp();

  const onTableChange = (): void => {
    if (rows.length === 0) {
      logger.warn("No rows in table skip onTableChange");
      return;
    }

    const csvContent = toCSv();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    onChange({
      type: AutoCertChangeType.TableUpdate,
      data: {
        csvFile: new File([blob], `${projectId}.csv`, {
          type: "text/csv",
        }),
      },
    });
  };

  useEffect(() => {
    onTableChange();
  }, [rows, columns]);

  const onRowAdd = (newRow: AutoCertTableRow): void => {
    logger.debug(`Add row key: ${newRow.key}`);

    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to add row");
      message.error(denyMsg);
      return;
    }

    setRows((prevRows) => [...prevRows, newRow]);
    // onTableChange();
  };

  const onRowUpdate = (updatedRow: AutoCertTableRow): void => {
    logger.debug(`Update row key: ${updatedRow.key}`);

    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to update row");
      message.error(denyMsg);
      return;
    }

    const newRows = [...rows];

    // Find the row by key and replace it with the new row data
    const index = newRows.findIndex((r) => r.key === updatedRow.key);

    if (index === -1) {
      // Row not found, do nothing
      return;
    }

    newRows[index] = updatedRow;
    setRows(newRows);

    // onTableChange();
  };

  const onColumnAdd = (newColumn: AutoCertTableColumn): void => {
    logger.debug(`Add column title: ${newColumn.title}`);

    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to add column");
      message.error(denyMsg);
      return;
    }

    setColumns((prevCols) => [...prevCols, newColumn]);

    // Add an empty value for the new column to each existing row
    setRows((prevRows) =>
      prevRows.map((r) => ({
        ...r,
        [newColumn.title]: "",
      })),
    );

    // onTableChange();
  };

  const onColumnDelete = (columnTitle: string): void => {
    logger.debug(`Delete column title: ${columnTitle}`);

    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to delete column");
      message.error(denyMsg);
      return;
    }

    // remove column from columns
    setColumns((prevCols) => prevCols.filter((c) => c.title !== columnTitle));

    // remove column from rows
    setRows((prevRows) =>
      prevRows.map((r) => {
        const newRow = { ...r };
        delete newRow[columnTitle];
        return newRow;
      }),
    );

    // onTableChange();
  };

  const onColumnUpdate = (oldTitle: string, newTitle: string): void => {
    logger.debug(`Update column title: ${oldTitle} to ${newTitle}`);

    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to update column");
      message.error(denyMsg);
      return;
    }

    setColumns((prevCols) =>
      prevCols.map((c) =>
        c.title === oldTitle
          ? { ...c, title: newTitle, dataIndex: newTitle }
          : c,
      ),
    );

    setRows((prevRows) =>
      prevRows.map((r) => {
        if (r.hasOwnProperty(oldTitle)) {
          r[newTitle] = r[oldTitle];
          delete r[oldTitle];
        }

        return r;
      }),
    );

    // onTableChange();
  };

  const onRowsDelete = (selectedKeys: React.Key[]): void => {
    logger.debug(`Delete rows keys: ${selectedKeys}`);

    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to delete rows");
      message.error(denyMsg);
      return;
    }

    setRows((prevRows) =>
      prevRows.filter((r) => !selectedKeys.includes(r.key)),
    );

    // onTableChange();
  };

  const onImportFromCSV = (
    newRows: AutoCertTableRow[],
    newColumns: AutoCertTableColumn[],
  ): void => {
    logger.debug("Import from CSV");
    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to import from CSV");
      message.error(denyMsg);
      return;
    }

    setRows(newRows);
    setColumns(newColumns);

    // onTableChange();

    message.success("Imported CSV successfully");
  };

  const toCSv = (): string => {
    const csvRows = [];
    const headers = columns.map((col) => col.title);
    csvRows.push(headers.join(","));
    rows.forEach((row) => {
      const values = headers.map((header) => {
        return row[header];
      });
      csvRows.push(values.join(","));
    });
    return csvRows.join("\n");
  };

  const onExportToCSV = (filename: string): void => {
    const csvContent = toCSv();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    rows,
    columns,
    onRowAdd,
    onRowUpdate,
    onRowsDelete,
    onColumnAdd,
    onColumnDelete,
    onColumnUpdate,
    onImportFromCSV,
    onExportToCSV,
  };
}
