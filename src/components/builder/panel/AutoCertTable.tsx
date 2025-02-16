import React, { useContext, useEffect, useRef, useState } from "react";
import {
    Button,
    Form,
    Input,
    Popconfirm,
    Table,
    Flex,
    App,
    FormInstance,
    InputRef,
    Space,
    TableProps,
} from "antd";
import Papa from "papaparse";
import { nanoid } from "nanoid";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("components:builder:panel:AutoCertTable");

type AutoCertTableColumn = {
    // Actual column name shown in the table header
    title: string;
    // Unique key for each column, should be the same as title to avoid confusion
    dataIndex: string;
    // Whether the column is editable
    editable: boolean;
};

/**
 * Example dataType = {
 *  key: "aiemvneg" // unique key for each row
 *  name: "Jonh"
 *  ... // other columns, the key can be any
 * }
 */
type DataType = {
    // unique key for each row, can be string or number (required by antd)
    key: React.Key;
} & {
    // other columns, this represents column type
    [key: string]: string | number;
};

// Refer to doc: https://ant.design/components/table#table-demo-edit-cell
const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
    index: number;
}

// Refer to doc: https://ant.design/components/table#table-demo-edit-cell
function EditableRow({ index, ...props }: EditableRowProps) {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
}

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: string;
    record: DataType;
    children: React.ReactNode;
    handleSave: (record: DataType) => void;
}

// Refer to doc: https://ant.design/components/table#table-demo-edit-cell
function EditableCell({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}: EditableCellProps) {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    const toggleEdit = (): void => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async (): Promise<void> => {
        try {
            const values = await form.validateFields();

            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log("Save failed:", errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{ margin: 0 }}
                name={dataIndex}
                // rules={[{ required: true, message: `${title} is required.` }]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap min-h-6"
                style={{ paddingInlineEnd: 24 }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
}

const AutoCertTable = () => {
    const [rows, setRows] = useState<DataType[]>([]);
    const [columns, setColumns] = useState<AutoCertTableColumn[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const tblRef: Parameters<typeof Table>[0]["ref"] = React.useRef(null);
    const { modal, message } = App.useApp();
    const csvFileInput = useRef<InputRef>(null);
    const [addRowForm] = Form.useForm();

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
                        id="addRowForm"
                        layout="horizontal"
                    >
                        {inputs}
                    </Form>
                </div>
            ),
            onOk: async () => {
                const values = await addRowForm.validateFields();
                const newRow: DataType = {
                    key: nanoid(),
                };
                const updatedRow = { ...newRow, ...values };
                setRows([...rows, updatedRow]);

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
            content: <Input placeholder="Column title" id="columnTitle" />,
            onOk: () => {
                const columnTitle = (
                    document.getElementById("columnTitle") as HTMLInputElement
                )?.value;

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

                message.success("New column added.");
            },
            maskClosable: true,
            centered: true,
        });
    };

    const handleDeleteSelected = (): void => {
        setRows((prev) =>
            prev.filter((item) => !selectedRowKeys.includes(item.key))
        );
        setSelectedRowKeys([]);
    };

    // For delete one row
    // const handleDelete = (key: React.Key) => {
    //   const newData = rows.filter((item) => item.key !== key);
    //   setRows(newData);
    // };

    const handleSave = (row: DataType): void => {
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

    const handleCSVFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        logger.debug("User upload a csv file", e.target.files);
        try {
            const file = e.target.files?.[0];
            if (file) {
                Papa.parse(file, {
                    header: true,
                    complete: (result) => {
                        logger.debug("Parsed csv file", result);

                        const newColumns: AutoCertTableColumn[] = [];
                        const newRows: DataType[] = [];

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
                            const newRow: DataType = {
                                key: nanoid(),
                            };

                            columnNames.forEach((colName) => {
                                newRow[colName] = row[colName];
                            });

                            newRows.push(newRow);
                        });

                        setColumns(newColumns);
                        setRows(newRows);
                    },
                });
                message.success("CSV file parsed successfully.");
                return;
            }

            throw new Error("No file selected.");
        } catch (error) {
            logger.error("Failed to parse csv file", error);
            message.error("Failed to parse csv file.");
        }
    };

    const processedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record: DataType) => ({
                ...col,
                record,
                handleSave: handleSave,
            }),
        };
    });

    const onSelectChange = (newSelectedRowKeys: React.Key[]): void => {
        logger.debug(`Selected ${newSelectedRowKeys.length} rows`);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    } satisfies TableProps<DataType>["rowSelection"];

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    } satisfies Exclude<TableProps<DataType>["components"], undefined>;

    const hasColumns = columns.length > 0;
    const hasSelected = selectedRowKeys.length > 0;

    return (
        <Flex
            vertical
            gap="middle"
            // className={styles.responsiveTable}
        >
            <Flex gap="small" wrap="wrap">
                <Button onClick={handleAddColumn}>Add Column</Button>
                <Button onClick={handleAddRow} disabled={!hasColumns}>
                    Add Row
                </Button>
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
                >
                    Import CSV
                </Button>
                <Space>
                    <Popconfirm
                        title="Delete selected rows, this action cannot be undone!"
                        onConfirm={handleDeleteSelected}
                    >
                        <Button danger disabled={!hasSelected}>
                            Delete Selected
                        </Button>
                    </Popconfirm>
                    {hasSelected && (
                        <span>Selected {selectedRowKeys.length} rows</span>
                    )}
                </Space>
            </Flex>

            <Table
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
                    y: "fit-content",
                    // y: '50px',
                }}
                pagination={{
                    position: ["topRight"],
                    showSizeChanger: true,
                    showTotal: (total, range) =>
                        `Showing ${range[0]}-${range[1]} of ${total} items`,
                }}
            />
        </Flex>
    );
};

export default AutoCertTable;
