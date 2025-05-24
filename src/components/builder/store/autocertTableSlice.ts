import { StateCreator } from "zustand";
import {
  AutoCertTableColumn,
  AutoCertTableRow,
} from "../panel/table/AutoCertTable";
import { parseCSVUrl } from "../utils";
import { createScopedLogger } from "@/utils/logger";
import { AutoCertStore } from "./useAutoCertStore";
import { AutoCertChangeType } from "./autocertChangeSlice";
import { hasPermission, ProjectPermission } from "@/auth/rbac";
import { App } from "antd";

const logger = createScopedLogger(
  "components:builder:store:autocertTableSlice",
);

const denyMsg = "You do not have permission to update table";

export type AutoCertTableState = {
  csvFileUrl?: string;
  rows: AutoCertTableRow[];
  columns: AutoCertTableColumn[];
  tableLoading: boolean;
  initialCSVParsed: boolean;
};

export interface AutoCertTableActions {
  initTable: (csvUrl: string) => Promise<void>;
  setRows: (rows: AutoCertTableRow[]) => void;
  setColumns: (columns: AutoCertTableColumn[]) => void;
  setTableLoading: (loading: boolean) => void;
  setInitialCSVParsed: (parsed: boolean) => void;
  parseCSV: (csvFileUrl: string) => Promise<void>;
  onTableChange: () => void;
  onRowAdd: (newRow: AutoCertTableRow) => void;
  onRowUpdate: (updatedRow: AutoCertTableRow) => void;
  onColumnAdd: (newColumn: AutoCertTableColumn) => void;
  onColumnDelete: (columnTitle: string) => void;
  onColumnUpdate: (oldTitle: string, newTitle: string) => void;
  onRowsDelete: (selectedKeys: React.Key[]) => void;
  onImportFromCSV: (
    newRows: AutoCertTableRow[],
    newColumns: AutoCertTableColumn[],
  ) => void;
  toCSv: (r: AutoCertTableRow[], c: AutoCertTableColumn[]) => string;
  onExportToCSV: (filename: string) => File;
}

export type AutoCertTableSlice = AutoCertTableState & AutoCertTableActions;

// For typescript reference, read doc: https://zustand.docs.pmnd.rs/guides/typescript#slices-pattern
export const createAutoCertTableSlice: StateCreator<
  AutoCertStore,
  [["zustand/immer", never]],
  [],
  AutoCertTableSlice
> = (set, get) => {
  const { message } = App.useApp();

  return {
    rows: [],
    columns: [],
    tableLoading: false,
    initialCSVParsed: false,
    csvFileUrl: undefined,

    initTable: async (csvUrl) => {
      logger.debug("Initializing table with rows and columns");
      set((state) => {
        state.csvFileUrl = csvUrl;
        state.rows = [];
        state.columns = [];
        state.tableLoading = true;
        state.initialCSVParsed = false;
      });
      await get().parseCSV(csvUrl);
    },

    setRows: (rows) =>
      set((state) => {
        state.rows = rows;
      }),
    setColumns: (columns) =>
      set((state) => {
        state.columns = columns;
      }),
    setTableLoading: (loading) =>
      set((state) => {
        state.tableLoading = loading;
      }),
    setInitialCSVParsed: (parsed) =>
      set((state) => {
        state.initialCSVParsed = parsed;
      }),

    parseCSV: async (csvFileUrl: string) => {
      try {
        get().setTableLoading(true);
        if (!csvFileUrl) {
          logger.warn("No CSV file URL provided");
          return;
        }

        const { columns, rows } = await parseCSVUrl(csvFileUrl);
        get().setColumns(columns);
        get().setRows(rows);
      } catch (error) {
        logger.error("Failed to parse CSV", error);
      } finally {
        get().setTableLoading(false);
        get().setInitialCSVParsed(true);
      }
    },

    onTableChange: () => {
      get().enqueueChange({
        type: AutoCertChangeType.TableUpdate,
        data: {
          csvFile: get().onExportToCSV(`${get().project.id}.csv`),
        },
      });
    },

    onRowAdd: (newRow) => {
      logger.debug(`Add row key: ${newRow.key}`);

      if (!hasPermission(get().roles, [ProjectPermission.TableUpdate])) {
        logger.warn("Permission denied to add row");
        message.error(denyMsg);
        return;
      }

      const newRows = [...get().rows, newRow];
      get().setRows(newRows);

      get().onTableChange();
    },

    onRowUpdate: (updatedRow) => {
      logger.debug(`Update row key: ${updatedRow.key}`);

      if (!hasPermission(get().roles, [ProjectPermission.TableUpdate])) {
        logger.warn("Permission denied to update row");
        message.error(denyMsg);
        return;
      }

      const newRows = [...get().rows];

      // Find the row by key and replace it with the new row data
      const index = newRows.findIndex((r) => r.key === updatedRow.key);

      if (index === -1) {
        // Row not found, do nothing
        return;
      }

      newRows[index] = updatedRow;
      get().setRows(newRows);

      get().onTableChange();
    },

    onColumnAdd: (newColumn) => {
      logger.debug(`Add column title: ${newColumn.title}`);

      if (!hasPermission(get().roles, [ProjectPermission.TableUpdate])) {
        logger.warn("Permission denied to add column");
        message.error(denyMsg);
        return;
      }

      const newColumns = [...get().columns, newColumn];
      get().setColumns(newColumns);

      const newRows = get().rows.map((r) => {
        const newRow = { ...r };
        // Add an empty value for the new column to each existing row
        newRow[newColumn.title] = "";
        return newRow;
      });
      get().setRows(newRows);

      get().onTableChange();
    },

    onColumnDelete: (columnTitle) => {
      logger.debug(`Delete column title: ${columnTitle}`);

      if (!hasPermission(get().roles, [ProjectPermission.TableUpdate])) {
        logger.warn("Permission denied to delete column");
        message.error(denyMsg);
        return;
      }

      // remove column from columns
      const newColumns = get().columns.filter((c) => c.title !== columnTitle);
      get().setColumns(newColumns);

      // remove column from rows
      const newRows = get().rows.map((r) => {
        const newRow = { ...r };
        delete newRow[columnTitle];
        return newRow;
      });
      get().setRows(newRows);

      get().onTableChange();
    },

    onColumnUpdate: (oldTitle, newTitle) => {
      logger.debug(`Update column title: ${oldTitle} to ${newTitle}`);

      if (!hasPermission(get().roles, [ProjectPermission.TableUpdate])) {
        logger.warn("Permission denied to update column");
        message.error(denyMsg);
        return;
      }

      const newColumns = get().columns.map((c) => {
        if (c.title === oldTitle) {
          return { ...c, title: newTitle, dataIndex: newTitle };
        }
        return c;
      });
      get().setColumns(newColumns);

      const newRows = get().rows.map((r) => {
        const newRow = { ...r };
        if (r.hasOwnProperty(oldTitle)) {
          newRow[newTitle] = r[oldTitle];
          delete newRow[oldTitle];
        }
        return newRow;
      });
      get().setRows(newRows);

      get().onTableChange();
      get().replaceAnnotatesColumnValue(oldTitle, newTitle);
    },

    onRowsDelete: (selectedKeys) => {
      logger.debug(`Delete rows keys: ${selectedKeys}`);

      if (!hasPermission(get().roles, [ProjectPermission.TableUpdate])) {
        logger.warn("Permission denied to delete rows");
        message.error(denyMsg);
        return;
      }

      const newRows = get().rows.filter((r) => !selectedKeys.includes(r.key));
      get().setRows(newRows);

      get().onTableChange();
    },

    onImportFromCSV: (newRows, newColumns) => {
      logger.debug("Import from CSV");
      if (!hasPermission(get().roles, [ProjectPermission.TableUpdate])) {
        logger.warn("Permission denied to import from CSV");
        message.error(denyMsg);
        return;
      }

      get().setRows(newRows);
      get().setColumns(newColumns);

      get().onTableChange();
    },

    toCSv: (r, c) => {
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
    },

    onExportToCSV: (filename) => {
      const csvContent = get().toCSv(get().rows, get().columns);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      return new File([blob], filename, { type: "text/csv;charset=utf-8;" });
    },
  };
};
