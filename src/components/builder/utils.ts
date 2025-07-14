import { createScopedLogger } from "@/utils/logger";
import {
  AutoCertTableColumn,
  AutoCertTableRow,
} from "./panel/table/AutoCertTable";
import Papa from "papaparse";
import { ProjectRole, ProjectStatus } from "@/types/project";
import { ProjectByIdSchema } from "@/schemas/autocert_api/project";
import { z } from "zod";
import { hasRole } from "@/auth/rbac";

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

export function getCanGenerateCertificateState({
  roles,
  project,
  signatureCount,
  signaturesSigned,
  hasAtLeastOneAnnotate,
  hasPendingChange,
}: {
  roles: ProjectRole[];
  project: z.infer<typeof ProjectByIdSchema>;
  signatureCount: number;
  signaturesSigned: number;
  hasAtLeastOneAnnotate: boolean;
  hasPendingChange: boolean;
}): { canGenerate: boolean; cannotGenerateReasons: string[] } {
  const isRequestor = hasRole(roles, ProjectRole.Requestor);
  const isDraft = project.status === ProjectStatus.Draft;
  const isProcessing = project.status === ProjectStatus.Processing;
  const allSignaturesSigned = signaturesSigned === signatureCount;

  const cannotGenerateReasons: string[] = [];

  if (isProcessing) {
    cannotGenerateReasons.push(
      "Certificate generation is currently in progress. Please wait for the process to complete.",
    );
  }

  if (!isDraft && !isProcessing) {
    cannotGenerateReasons.push(
      "Certificates can only be generated while the project is in draft status.",
    );
  }

  if (!isRequestor) {
    cannotGenerateReasons.push(
      "You must be the project requestor to generate certificates.",
    );
  }

  if (hasPendingChange) {
    cannotGenerateReasons.push(
      "There are pending changes. Please wait for them to be applied before generating certificates.",
    );
  }

  if (!hasAtLeastOneAnnotate) {
    cannotGenerateReasons.push(
      "At least one annotation (e.g., a signature or column) is required before generating certificates.",
    );
  }

  if (!allSignaturesSigned) {
    cannotGenerateReasons.push(
      "All signature fields must be signed before you can generate certificates. Please ensure all signatories have approved their signatures.",
    );
  }

  return {
    canGenerate: cannotGenerateReasons.length === 0,
    cannotGenerateReasons,
  };
}
