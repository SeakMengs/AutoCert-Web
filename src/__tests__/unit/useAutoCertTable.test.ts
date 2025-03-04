import {
    AutoCertTableRow,
    AutoCertTableColumn,
} from "@/components/builder/panel/table/AutoCertTable";
import { useAutoCertTable } from "@/hooks/useAutoCert";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("useAutoCertTable", () => {
    const initialRows: AutoCertTableRow[] = [
        { key: "1", name: "Row 1" },
        { key: "2", name: "Row 2" },
    ];
    const initialColumns: AutoCertTableColumn[] = [
        { title: "name", dataIndex: "name", editable: true },
    ];

    it("should initialize with given rows and columns", () => {
        const { result } = renderHook(() =>
            useAutoCertTable({ initialRows, initialColumns })
        );

        expect(result.current.rows).toEqual(initialRows);
        expect(result.current.columns).toEqual(initialColumns);
    });

    it("should add a new row", () => {
        const { result } = renderHook(() =>
            useAutoCertTable({ initialRows, initialColumns })
        );

        const newRow = {
            key: "3",
            name: "Row 3",
        } satisfies AutoCertTableRow;

        act(() => {
            result.current.onRowAdd(newRow);
        });

        expect(result.current.rows).toHaveLength(3);
        expect(result.current.rows[2]).toEqual(newRow);
    });

    it("should update an existing row", () => {
        const { result } = renderHook(() =>
            useAutoCertTable({ initialRows, initialColumns })
        );

        const updatedRow = {
            key: "1",
            name: "Updated Row 1",
        } satisfies AutoCertTableRow;

        act(() => {
            result.current.onRowUpdate(updatedRow);
        });

        expect(result.current.rows[0]).toEqual(updatedRow);
    });

    it("should add a new column", () => {
        const { result } = renderHook(() =>
            useAutoCertTable({ initialRows, initialColumns })
        );

        const newColumn = {
            title: "age",
            dataIndex: "age",
            editable: true,
        } satisfies AutoCertTableColumn;

        act(() => {
            result.current.onColumnAdd(newColumn);
        });

        expect(result.current.columns).toHaveLength(2);
        expect(result.current.columns[1]).toEqual(newColumn);
        expect(result.current.rows[0]).toHaveProperty("age", "");
    });

    it("should delete a column", () => {
        const { result } = renderHook(() =>
            useAutoCertTable({ initialRows, initialColumns })
        );

        const columnTitle = "name";

        act(() => {
            result.current.onColumnDelete(columnTitle);
        });

        expect(result.current.columns).toHaveLength(0);
        expect(result.current.rows[0]).not.toHaveProperty(columnTitle);
    });

    it("should update a column title", () => {
        const { result } = renderHook(() =>
            useAutoCertTable({ initialRows, initialColumns })
        );

        const oldTitle = "name";
        const newTitle = "fullName";

        act(() => {
            result.current.onColumnUpdate(oldTitle, newTitle);
        });

        expect(result.current.columns[0]).toEqual({
            title: newTitle,
            dataIndex: newTitle,
            editable: true,
        } satisfies AutoCertTableColumn);
        expect(result.current.rows[0]).toHaveProperty(newTitle, "Row 1");
    });

    it("should delete selected rows", () => {
        const { result } = renderHook(() =>
            useAutoCertTable({ initialRows, initialColumns })
        );

        const selectedRowKeys = [initialRows[0].key];

        act(() => {
            result.current.onRowsDelete(selectedRowKeys);
        });

        expect(result.current.rows).toHaveLength(1);
        expect(result.current.rows[0]).toEqual(initialRows[1]);
    });

    it("should override state with new rows and columns from CSV", () => {
        const { result } = renderHook(() =>
            useAutoCertTable({ initialRows, initialColumns })
        );

        const newRows = [
            { key: "3", name: "Row 3" },
            { key: "4", name: "Row 4" },
        ] satisfies AutoCertTableRow[];
        const newColumns = [
            { title: "name", dataIndex: "name", editable: true },
            { title: "age", dataIndex: "age", editable: true },
        ] satisfies AutoCertTableColumn[];

        act(() => {
            result.current.onImportFromCSV(newRows, newColumns);
        });

        expect(result.current.rows).toEqual(newRows);
        expect(result.current.columns).toEqual(newColumns);
    });
});
