import { createScopedLogger } from "@/utils/logger";
import {
  AutoCertTableColumn,
  AutoCertTableRow,
} from "./panel/table/AutoCertTable";
import Papa from "papaparse";

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
        logger.debug("Parsed csv url", result);
        resolve(processCSVData(result));
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
        logger.debug("Parsed csv url", result);
        resolve(processCSVData(result));
      },
      error: (error) => {
        logger.error("Failed to parse csv from URL", error);
        reject(error);
      },
    });
  });
}

// Helper function to process the parsed CSV data
function processCSVData(result: Papa.ParseResult<unknown>): {
  columns: AutoCertTableColumn[];
  rows: AutoCertTableRow[];
} {
  // result.data === [] when no rows
  // result.meta.fields === ["name"]
  const fields = result.meta.fields ?? [];

  const columns: AutoCertTableColumn[] = fields.map((field) => ({
    title: field,
    dataIndex: field,
    editable: true,
  }));

  const rows: AutoCertTableRow[] = (result.data as Record<string, any>[]).map(
    (row, idx) => ({ key: idx, ...row }),
  );

  return { columns, rows };
}

export function pxToPercent(value: number, total: number): number {
  return (value / total) * 100;
}
