import { useState } from "react";
import { AutoCertTableColumn, AutoCertTableRow } from "../panel/AutoCertTable";

export default function useAutoCertTable({
    initialRows = [],
    initialColumns = [],
}: {
    initialRows?: AutoCertTableRow[];
    initialColumns?: AutoCertTableColumn[];
}) {
    const [rows, setRows] = useState<AutoCertTableRow[]>(initialRows);
    const [columns, setColumns] =
        useState<AutoCertTableColumn[]>(initialColumns);

    const onRowAdd = (newRow: AutoCertTableRow): void => {
        setRows((prevRows) => [...prevRows, newRow]);
    };

    const onRowUpdate = (updatedRow: AutoCertTableRow): void => {
        const newRows = [...rows];

        // Find the row by key and replace it with the new row data
        const index = newRows.findIndex((r) => r.key === updatedRow.key);

        if (index === -1) {
            // Row not found, do nothing
            return;
        }

        newRows[index] = updatedRow;
        setRows(newRows);
    };

    const onColumnAdd = (newColumn: AutoCertTableColumn): void => {
        setColumns((prevCols) => [...prevCols, newColumn]);

        // Add an empty value for the new column to each existing row
        setRows((prevRows) =>
            prevRows.map((r) => ({
                ...r,
                [newColumn.title]: "",
            }))
        );
    };

    const onColumnDelete = (columnTitle: string): void => {
        // remove column from columns
        setColumns((prevCols) =>
            prevCols.filter((c) => c.title !== columnTitle)
        );

        // remove column from rows
        setRows((prevRows) =>
            prevRows.map((r) => {
                const newRow = { ...r };
                delete newRow[columnTitle];
                return newRow;
            })
        );
    };

    const onColumnUpdate = (oldTitle: string, newTitle: string): void => {
        setColumns((prevCols) =>
            prevCols.map((c) =>
                c.title === oldTitle
                    ? { ...c, title: newTitle, dataIndex: newTitle }
                    : c
            )
        );

        setRows((prevRows) =>
            prevRows.map((r) => {
                if (r.hasOwnProperty(oldTitle)) {
                    r[newTitle] = r[oldTitle];
                    delete r[oldTitle];
                }

                return r;
            })
        );
    };

    const onRowsDelete = (selectedKeys: React.Key[]): void => {
        setRows((prevRows) =>
            prevRows.filter((r) => !selectedKeys.includes(r.key))
        );
    };

    const onImportFromCSV = (
        newRows: AutoCertTableRow[],
        newColumns: AutoCertTableColumn[]
    ): void => {
        setRows(newRows);
        setColumns(newColumns);
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
    };
}
