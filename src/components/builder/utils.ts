import { createScopedLogger } from "@/utils/logger";
import { AnnotateState, AnnotateStates } from "./hooks/useAutoCert";
import { AutoCertTableColumn, AutoCertTableRow } from "./panel/AutoCertTable";
import Papa from "papaparse";
import { nanoid } from "nanoid";

const logger = createScopedLogger("components:builder:utils");

// Scale ratio threshold to determine if the scale is too small to update annotates
export const ScaleRatioThreshold = 0;

export function getAnnotatesByScale(
    annotates: AnnotateStates,
    scale: number,
    previousScale: number
): AnnotateStates {
    const scaleRatio = scale / previousScale;
    if (scaleRatio <= ScaleRatioThreshold) {
        logger.debug("Scale ratio too small, not updating annotates");
        return annotates;
    }

    const newAnnotates: AnnotateStates = {};

    for (const page in annotates) {
        const pageAnnotates = annotates[page];
        newAnnotates[page] = pageAnnotates.map((annotate) => {
            return getAnnotateByScaleRatio(annotate, scaleRatio);
        });
    }
    return newAnnotates;
}

export function getAnnotateByScale(
    annotate: AnnotateState,
    scale: number,
    previousScale: number
): AnnotateState {
    const scaleRatio = scale / previousScale;
    return getAnnotateByScaleRatio(annotate, scaleRatio);
}

export function getAnnotateByScaleRatio(
    annotate: AnnotateState,
    scaleRatio: number
): AnnotateState {
    if (scaleRatio <= ScaleRatioThreshold) {
        logger.debug("Scale ratio too small, not updating annotate");
        return annotate;
    }

    const baseProps = {
        position: {
            x: annotate.position.x * scaleRatio,
            y: annotate.position.y * scaleRatio,
        },
        size: {
            width: annotate.size.width * scaleRatio,
            height: annotate.size.height * scaleRatio,
        },
    };

    if (annotate.type !== "text") {
        return { ...annotate, ...baseProps };
    }

    return {
        ...annotate,
        ...baseProps,
        font: {
            ...annotate.font,
            size: annotate.font.size * scaleRatio,
        },
    };
}

/**
 * Parse a csv file or url and return the columns and rows compatible with AutoCertTable types
 */
export function parseCSV(
    fileOrUrl: File | string
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
