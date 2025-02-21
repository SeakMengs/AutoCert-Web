import React, { useRef, useState } from "react";
import {
    Button,
    Form,
    Input,
    Popconfirm,
    Table,
    Flex,
    App,
    InputRef,
    Space,
    TableProps,
} from "antd";
import {
    DeleteOutlined,
    ImportOutlined,
    PlusOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import { nanoid } from "nanoid";
import { createScopedLogger } from "@/utils/logger";
import { parseCSV } from "../utils";
import {
    EditableBodyCell,
    EditableBodyCellProps,
    EditableBodyRow,
    EditableHeaderCell,
    EditableHeaderCellProps,
} from "./EditableTable";

const logger = createScopedLogger("components:builder:panel:AutoCertTable");

export type AutoCertTableColumn = {
    // Actual column name shown in the table header
    title: string;
    // Unique key for each column, should be the same as title to avoid confusion
    dataIndex: string;
    // Whether the column is editable
    editable: boolean;
};

/**
 * Basically is type for each column
 * Example autoCertTableRow = {
 *  key: "aiemvneg" // unique key for each row
 *  name: "Jonh"
 *  ... // other columns, the key can be any
 * }
 */
export type AutoCertTableRow = {
    // unique key for each row, can be string or number (required by antd)
    key: React.Key;
} & {
    // other columns, this represents column type
    [key: string]: string | number;
};

export interface AutoCertTableProps {
    columns: AutoCertTableColumn[];
    rows: AutoCertTableRow[];
    setRows: React.Dispatch<React.SetStateAction<AutoCertTableRow[]>>;
    setColumns: React.Dispatch<React.SetStateAction<AutoCertTableColumn[]>>;
}

export default function AutoCertTable({
    rows,
    setRows,
    columns,
    setColumns,
}: AutoCertTableProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const tblRef: Parameters<typeof Table>[0]["ref"] = React.useRef(null);
    const { modal, message } = App.useApp();
    const csvFileInput = useRef<InputRef>(null);
    const [addRowForm] = Form.useForm<AutoCertTableRow>();
    const [addColumForm] = Form.useForm<{
        columnTitle: string;
    }>();
    const [parsingCSV, setParsingCSV] = useState<boolean>(false);

    const handleAddRow = (): void => {
        logger.debug("Add new row");

        const inputs = columns.map((col) => (
            <Form.Item
                key={col.dataIndex}
                label={col.title}
                name={col.dataIndex}
            >
                <Input />
            </Form.Item>
        ));

        modal.confirm({
            title: "Add New Row",
            content: (
                <div className="max-h-[calc(100vh-200px)] overflow-auto">
                    <Form
                        form={addRowForm}
                        className="mr-2"
                        layout="horizontal"
                    >
                        {inputs}
                    </Form>
                </div>
            ),
            onOk: async () => {
                const values = await addRowForm.validateFields();
                const newRow: AutoCertTableRow = {
                    ...values,
                    key: nanoid(),
                };
                setRows([...rows, newRow]);
                addRowForm.resetFields();
                message.success("New row added.");
            },
            maskClosable: true,
            centered: true,
        });
    };

    const handleAddColumn = (): void => {
        logger.debug("Add new column");

        modal.confirm({
            title: "Add New Column",
            content: (
                <Form form={addColumForm} layout="horizontal">
                    <Form.Item
                        label="Column Title"
                        name="columnTitle"
                        key={"columnTitle"}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            ),
            onOk: async () => {
                const { columnTitle } = await addColumForm.validateFields();

                if (!columnTitle) {
                    message.warning("Column title is empty.");
                    return;
                }

                if (columns.some((col) => col.title === columnTitle)) {
                    message.warning("Column title already exists.");
                    return;
                }

                const newColumn = {
                    title: columnTitle,
                    dataIndex: columnTitle,
                    editable: true,
                } satisfies AutoCertTableColumn;

                setColumns([...columns, newColumn]);

                // Append new column to existing rows with empty values
                setRows(
                    rows.map((row) => ({
                        ...row,
                        [columnTitle]: "",
                    }))
                );

                addColumForm.resetFields();
                message.success("New column added.");
            },
            maskClosable: true,
            centered: true,
        });
    };

    const handleDeleteSelectedRows = (): void => {
        setRows((prev) =>
            prev.filter((item) => !selectedRowKeys.includes(item.key))
        );
        setSelectedRowKeys([]);
    };

    const handleSaveBodyRow = (row: AutoCertTableRow): void => {
        const newData = [...rows];
        // Find the row by key and replace it with the new row data
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setRows(newData);
    };

    const handleDeleteHeaderColumn = (columnTitle: string): void => {
        logger.debug("Delete column", columnTitle);
        // remove column from columns
        const newColumns = columns.filter((col) => col.title !== columnTitle);

        // remove column from rows
        const newRows = rows.map((row) => {
            const newRow = { ...row };
            // Delete the property with key `columnTitle`
            delete newRow[columnTitle];
            return newRow;
        }) as AutoCertTableRow[];

        setColumns(newColumns);
        setRows(newRows);
    };

    const handleSaveHeaderRow = (columnTitle: string, value: any): void => {
        logger.debug("Save header row", columnTitle, value);

        if (columnTitle === value) {
            return;
        }

        const newColumns = columns.map((col) => {
            if (col.title === columnTitle) {
                return {
                    ...col,
                    title: value,
                    dataIndex: value,
                };
            }
            return col;
        });

        // update column title in rows
        const newRows = rows.map((row) => {
            const newRow = { ...row };
            newRow[value] = newRow[columnTitle];
            delete newRow[columnTitle];
            return newRow;
        }) as AutoCertTableRow[];

        setColumns(newColumns);
        setRows(newRows);
    };

    const handleCSVFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
        logger.debug("User upload a csv file", e.target.files);

        setParsingCSV(true);
        const file = e.target.files?.[0];

        if (!file) {
            message.error("No file selected.");
            setParsingCSV(false);
            return;
        }

        if (file.type !== "text/csv") {
            message.error("Invalid file type. Please upload a csv file.");
            setParsingCSV(false);
            return;
        }

        try {
            // Parse csv already handle duplicate column name by adding a number suffix
            const { columns, rows } = await parseCSV(file);

            setColumns(columns);
            setRows(rows);
            message.success("CSV file parsed successfully.");
        } catch (error) {
            message.error("Failed to parse csv file.");
        } finally {
            setParsingCSV(false);
        }
    };

    const processedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            // Add extra props to each column for custom cell rendering
            onCell: (record: AutoCertTableRow): EditableBodyCellProps => ({
                ...col,
                record,
                onSaveBodyRow: handleSaveBodyRow,
            }),
            // Add extra props to each column for custom header rendering
            onHeaderCell: (): EditableHeaderCellProps => ({
                ...col,
                onDeleteHeaderColumn: handleDeleteHeaderColumn,
                onSaveHeaderRow: handleSaveHeaderRow,
            }),
        };
    });

    const onRowSelectChange = (newSelectedRowKeys: React.Key[]): void => {
        logger.debug(`Selected ${newSelectedRowKeys.length} rows`);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onRowSelectChange,
    } satisfies TableProps<AutoCertTableRow>["rowSelection"];

    const components = {
        header: {
            row: EditableBodyRow,
            cell: EditableHeaderCell,
        },
        body: {
            row: EditableBodyRow,
            cell: EditableBodyCell,
        },
    } satisfies Exclude<TableProps<AutoCertTableRow>["components"], undefined>;

    const hasColumns = columns.length > 0;
    const hasSelected = selectedRowKeys.length > 0;

    const Buttons = (
        <Flex gap="small" wrap="wrap">
            {hasSelected && (
                <Space>
                    <span>{selectedRowKeys.length} Selected</span>
                    <Popconfirm
                        title="The selected rows will be deleted permanently. Are you sure?"
                        onConfirm={handleDeleteSelectedRows}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            disabled={!hasSelected}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )}
            <Button
                onClick={handleAddColumn}
                size="small"
                icon={<PlusOutlined />}
            >
                Column
            </Button>
            {hasColumns && (
                <Button
                    onClick={handleAddRow}
                    disabled={!hasColumns}
                    size="small"
                    icon={<PlusOutlined />}
                >
                    Row
                </Button>
            )}
            <Input
                ref={csvFileInput}
                className="hidden"
                accept=".csv"
                type="file"
                id="csvInput"
                onChange={handleCSVFileUpload}
            />
            <Button
                type="primary"
                onClick={() => {
                    const csvInput = csvFileInput.current;
                    if (csvInput && csvInput.input) {
                        csvInput.input.click();
                    }
                }}
                size="small"
                icon={<UploadOutlined />}
            >
                Import from CSV
            </Button>
        </Flex>
    ) satisfies React.ReactNode;

    return (
        <Flex vertical gap="middle">
            <Table
                title={() => Buttons}
                loading={parsingCSV}
                ref={tblRef}
                bordered
                components={components}
                rowClassName={() => "editable-row"}
                dataSource={rows}
                columns={processedColumns}
                rowSelection={hasColumns ? rowSelection : undefined}
                size="small"
                scroll={{
                    x: "fit-content",
                    // y: "fit-content",
                    // y: '50px',
                }}
                pagination={{
                    // position: ["topRight"],
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `Showing ${range[0]}-${range[1]} of ${total} items`,
                    pageSizeOptions: [10, 20, 50, 100, 200, 500],
                    responsive: true,
                }}
            />
        </Flex>
    );
}
