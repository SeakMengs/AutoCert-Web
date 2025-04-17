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
export function parseCSVFile(
  file: File,
): Promise<{ columns: AutoCertTableColumn[]; rows: AutoCertTableRow[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        logger.debug("Parsed csv file", result);
        const parsedData = processCSVData(result.data as any);
        resolve(parsedData);
      },
      error: (error) => {
        logger.error("Failed to parse csv file", error);
        reject(error);
      },
    });
  });
}

export function parseCSVUrl(
  url: string,
): Promise<{ columns: AutoCertTableColumn[]; rows: AutoCertTableRow[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        logger.debug("Parsed csv from URL", result);
        const parsedData = processCSVData(result.data as any);
        resolve(parsedData);
      },
      error: (error) => {
        logger.error("Failed to parse csv from URL", error);
        reject(error);
      },
    });
  });
}

// Helper function to process the parsed CSV data
function processCSVData(data: Record<string, any>[]): {
  columns: AutoCertTableColumn[];
  rows: AutoCertTableRow[];
} {
  const newColumns: AutoCertTableColumn[] = [];
  const newRows: AutoCertTableRow[] = [];

  if (data.length === 0) {
    logger.error("No data found in csv file");
    return { columns: [], rows: [] };
  }

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

  return { columns: newColumns, rows: newRows };
}

export function pxToPercent(value: number, total: number): number {
  return (value / total) * 100;
}
