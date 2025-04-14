import { createScopedLogger } from "@/utils/logger";
import {
  AutoCertTableColumn,
  AutoCertTableRow,
} from "./panel/table/AutoCertTable";
import Papa from "papaparse";
import { nanoid } from "nanoid";

const logger = createScopedLogger("components:builder:utils");

/**
 * Parse a csv file or url and return the columns and rows compatible with AutoCertTable types
 */
export function parseCSV(
  fileOrUrl: File | string,
): Promise<{ columns: AutoCertTableColumn[]; rows: AutoCertTableRow[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(fileOrUrl, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        logger.debug("Parsed csv result", result);

        const newColumns: AutoCertTableColumn[] = [];
        const newRows: AutoCertTableRow[] = [];

        const data = result.data as Record<string, any>[];

        // Get column names from the first row
        const columnNames = Object.keys(data[0]);

        // Create columns
        columnNames.forEach((colName) => {
          newColumns.push({
            title: colName,
            dataIndex: colName,
            editable: true,
          });
        });

        // Create rows
        data.forEach((row) => {
          const newRow: AutoCertTableRow = {
            key: nanoid(),
          };

          columnNames.forEach((colName) => {
            newRow[colName] = row[colName];
          });

          newRows.push(newRow);
        });

        resolve({ columns: newColumns, rows: newRows });
      },
      error: (error) => {
        logger.error("Failed to parse csv file", error);
        reject(error);
      },
    });
  });
}

export function pxToPercent(value: number, total: number): number {
  return (value / total) * 100;
}
