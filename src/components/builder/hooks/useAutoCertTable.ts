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
import { parseCSVUrl } from "../utils";

const logger = createScopedLogger("components:builder:hook:useAutoCertTable");

export interface UseAutoCertTableProps
  extends Pick<UseAutoCertProps, "projectId" | "roles" | "csvFileUrl"> {
  onChange: ReturnType<typeof useAutoCertChange>["onChange"];
}

const denyMsg = "You do not have permission to update table";

export default function useAutoCertTable({
  roles,
  projectId,
  csvFileUrl,
  onChange,
}: UseAutoCertTableProps) {
  const [rows, setRows] = useState<AutoCertTableRow[]>([]);
  const [columns, setColumns] = useState<AutoCertTableColumn[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const { message } = App.useApp();

  useEffect(() => {
    const parseCSV = async () => {
      try {
        setTableLoading(true);
        if (!csvFileUrl) {
          logger.warn("No CSV file URL provided");
          return;
        }

        const { columns, rows } = await parseCSVUrl(csvFileUrl);
        setColumns(columns);
        setRows(rows);
      } catch (error) {
        logger.error("Failed to parse CSV", error);
      } finally {
        setTableLoading(false);
      }
    };

    parseCSV();
  }, [csvFileUrl]);

  const onTableChange = (
    r: AutoCertTableRow[],
    c: AutoCertTableColumn[],
  ): void => {
    if (r.length === 0) {
      logger.warn("No rows in table skip onTableChange");
      return;
    }

    const csvContent = toCSv(r, c);
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

  const onRowAdd = (newRow: AutoCertTableRow): void => {
    logger.debug(`Add row key: ${newRow.key}`);

    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to add row");
      message.error(denyMsg);
      return;
    }

    const newRows = [...rows, newRow];
    setRows(newRows);

    onTableChange(newRows, columns);
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

    onTableChange(newRows, columns);
  };

  const onColumnAdd = (newColumn: AutoCertTableColumn): void => {
    logger.debug(`Add column title: ${newColumn.title}`);

    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to add column");
      message.error(denyMsg);
      return;
    }

    const newColumns = [...columns, newColumn];
    setColumns(newColumns);

    const newRows = rows.map((r) => {
      const newRow = { ...r };
      // Add an empty value for the new column to each existing row
      newRow[newColumn.title] = "";
      return newRow;
    });
    setRows(newRows);

    onTableChange(newRows, newColumns);
  };

  const onColumnDelete = (columnTitle: string): void => {
    logger.debug(`Delete column title: ${columnTitle}`);

    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to delete column");
      message.error(denyMsg);
      return;
    }

    // remove column from columns
    const newColumns = columns.filter((c) => c.title !== columnTitle);
    setColumns(newColumns);

    // remove column from rows
    const newRows = rows.map((r) => {
      const newRow = { ...r };
      delete newRow[columnTitle];
      return newRow;
    });
    setRows(newRows);

    onTableChange(newRows, newColumns);
  };

  const onColumnUpdate = (oldTitle: string, newTitle: string): void => {
    logger.debug(`Update column title: ${oldTitle} to ${newTitle}`);

    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to update column");
      message.error(denyMsg);
      return;
    }

    const newColumns = columns.map((c) => {
      if (c.title === oldTitle) {
        return { ...c, title: newTitle, dataIndex: newTitle };
      }
      return c;
    });
    setColumns(newColumns);

    const newRows = rows.map((r) => {
      const newRow = { ...r };
      if (r.hasOwnProperty(oldTitle)) {
        newRow[newTitle] = r[oldTitle];
        delete newRow[oldTitle];
      }
      return newRow;
    });
    setRows(newRows);

    onTableChange(newRows, newColumns);
  };

  const onRowsDelete = (selectedKeys: React.Key[]): void => {
    logger.debug(`Delete rows keys: ${selectedKeys}`);

    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to delete rows");
      message.error(denyMsg);
      return;
    }

    const newRows = rows.filter((r) => !selectedKeys.includes(r.key));
    setRows(newRows);

    onTableChange(newRows, columns);
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

    onTableChange(newRows, newColumns);
  };

  const toCSv = (r: AutoCertTableRow[], c: AutoCertTableColumn[]): string => {
    const csvRows = [];
    const headers = c.map((col) => col.title);
    csvRows.push(headers.join(","));
    r.forEach((row) => {
      const values = headers.map((header) => {
        return row[header];
      });
      csvRows.push(values.join(","));
    });
    return csvRows.join("\n");
  };

  const onExportToCSV = (filename: string): void => {
    const csvContent = toCSv(rows, columns);
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
    tableLoading,
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
