import React, { memo, useRef, useState } from "react";
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
import {
  EditableBodyCell,
  EditableBodyCellProps,
  EditableBodyRow,
  EditableHeaderCell,
  EditableHeaderCellProps,
} from "./EditableTable";
import { parseCSVFile } from "../../utils";
import { wait } from "@/utils";
import { FAKE_LOADING_TIME } from "../../store/autocertChangeSlice";
import { useAutoCertStore } from "../../providers/AutoCertStoreProvider";
import { useShallow } from "zustand/react/shallow";
import { hasPermission, ProjectPermission } from "@/auth/rbac";
import { ProjectStatus } from "@/types/project";

const logger = createScopedLogger(
  "components:builder:panel:table:AutoCertTable",
);

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
  tableLoading: boolean;
  onColumnAdd: (newColumn: AutoCertTableColumn) => void;
  onColumnDelete: (columnTitle: string) => void;
  onColumnUpdate: (oldTitle: string, newTitle: string) => void;
  onRowAdd: (newRow: AutoCertTableRow) => boolean;
  onRowUpdate: (updatedRow: AutoCertTableRow) => void;
  onRowsDelete: (selectedKeys: React.Key[]) => void;
  onImportFromCSV: (
    newRows: AutoCertTableRow[],
    newColumns: AutoCertTableColumn[],
  ) => void;
  onExportToCSV: (filename: string) => File;
}

function AutoCertTable({
  rows,
  columns,
  tableLoading,
  onColumnAdd,
  onColumnDelete,
  onColumnUpdate,
  onRowAdd,
  onRowUpdate,
  onRowsDelete,
  onImportFromCSV,
  onExportToCSV,
}: AutoCertTableProps) {
  const { roles, project } = useAutoCertStore(
    useShallow((state) => {
      return {
        roles: state.roles,
        project: state.project,
      };
    }),
  );

  const canEdit =
    project.status === ProjectStatus.Draft &&
    hasPermission(roles, [ProjectPermission.TableUpdate]);

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

    if (!canEdit) {
      message.warning("You do not have permission to update the table.");
      return;
    }

    const inputs = columns.map((col) => (
      <Form.Item key={col.dataIndex} label={col.title} name={col.dataIndex}>
        <Input />
      </Form.Item>
    ));

    modal.confirm({
      title: "Add New Row",
      content: (
        <div className="max-h-[calc(100vh-200px)] overflow-auto">
          <Form form={addRowForm} className="mr-2" layout="horizontal">
            {inputs}
          </Form>
        </div>
      ),
      onOk: async () => {
        try {
          const values = await addRowForm.validateFields();

          await wait(FAKE_LOADING_TIME / 2);

          const newRow: AutoCertTableRow = {
            ...values,
            key: nanoid(),
          };

          const ok = onRowAdd(newRow);
          if (ok) {
            addRowForm.resetFields();
            message.success("New row added.");
          }
        } catch (error) {
          logger.error("Failed to add new row", error);
          message.error("Failed to add new row.");
        }
      },
      maskClosable: true,
      centered: true,
    });
  };

  const handleAddColumn = (): void => {
    logger.debug("Add new column");

    if (!canEdit) {
      message.warning("You do not have permission to update the table.");
      return;
    }

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
        try {
          const { columnTitle } = await addColumForm.validateFields();

          if (!columnTitle) {
            message.warning("Column title is empty.");
            addColumForm.resetFields();
            return;
          }

          if (columns.some((col) => col.title === columnTitle)) {
            message.warning("Column title already exists.");
            addColumForm.resetFields();
            return;
          }

          const newColumn = {
            title: columnTitle,
            dataIndex: columnTitle,
            editable: true,
          } satisfies AutoCertTableColumn;

          onColumnAdd(newColumn);
          addColumForm.resetFields();

          message.success("New column added.");
        } catch (error) {
          logger.error("Failed to add new column", error);
          message.error("Failed to add new column.");
        }
      },
      maskClosable: true,
      centered: true,
    });
  };

  const handleDeleteSelectedRows = (): void => {
    logger.debug("Delete selected rows", selectedRowKeys);

    if (!canEdit) {
      message.warning("You do not have permission to update the table.");
      return;
    }

    onRowsDelete(selectedRowKeys);
    setSelectedRowKeys([]);
  };

  const handleSaveBodyRow = (row: AutoCertTableRow): void => {
    logger.debug("Save body row", row);

    if (!canEdit) {
      message.warning("You do not have permission to update the table.");
      return;
    }

    onRowUpdate(row);
  };

  const handleDeleteHeaderColumn = (columnTitle: string): void => {
    logger.debug("Delete column", columnTitle);

    if (!canEdit) {
      message.warning("You do not have permission to update the table.");
      return;
    }

    onColumnDelete(columnTitle);
  };

  const handleSaveHeaderRow = (columnTitle: string, newTitle: any): void => {
    logger.debug("Save header row", columnTitle, newTitle);

    if (!canEdit) {
      message.warning("You do not have permission to update the table.");
      return;
    }

    if (columnTitle === newTitle) {
      return;
    }

    if (columns.some((c) => c.title === newTitle)) {
      message.warning("Column title already exists.");
      return;
    }

    onColumnUpdate(columnTitle, newTitle);
  };

  const handleCSVFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    logger.debug("User upload a csv file", e.target.files);

    if (!canEdit) {
      message.warning("You do not have permission to update the table.");
      return;
    }

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
      const { columns, rows } = await parseCSVFile(file);

      onImportFromCSV(rows, columns);

      message.success("CSV file imported successfully.");
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
        editable: canEdit && col.editable,
        record,
        onSaveBodyRow: handleSaveBodyRow,
      }),
      // Add extra props to each column for custom header rendering
      onHeaderCell: (): EditableHeaderCellProps => ({
        ...col,
        editable: canEdit && col.editable,
        onDeleteHeaderColumn: handleDeleteHeaderColumn,
        onSaveHeaderRow: handleSaveHeaderRow,
      }),
    };
  });

  const onRowSelectChange = (newSelectedRowKeys: React.Key[]): void => {
    logger.debug(`Selected ${newSelectedRowKeys.length} rows`);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const exportAndDownloadCSV = (): void => {
    logger.debug("Export and download CSV");

    if (rows.length === 0 || columns.length === 0) {
      message.warning("Table is empty. Cannot export to CSV.");
      return;
    }

    const csvFile = onExportToCSV(new Date().toISOString() + ".csv");
    if (!csvFile) {
      message.error("Failed to export CSV file.");
      return;
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(csvFile);
    link.download = new Date().toISOString() + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              disabled={!canEdit}
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
        disabled={!canEdit || parsingCSV}
      >
        Column
      </Button>
      {hasColumns && (
        <>
          <Button
            onClick={handleAddRow}
            disabled={!canEdit || !hasColumns}
            size="small"
            icon={<PlusOutlined />}
          >
            Row
          </Button>
          <Button
            onClick={exportAndDownloadCSV}
            size="small"
            icon={<UploadOutlined />}
          >
            Export to CSV
          </Button>
        </>
      )}
      <Input
        ref={csvFileInput}
        className="hidden"
        accept=".csv"
        type="file"
        id="csvInput"
        onChange={handleCSVFileUpload}
        disabled={!canEdit || parsingCSV}
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
        icon={<ImportOutlined />}
        loading={parsingCSV}
        disabled={!canEdit || parsingCSV}
      >
        Import from CSV
      </Button>
    </Flex>
  ) satisfies React.ReactNode;

  return (
    <Flex vertical gap="middle">
      <Table
        title={() => Buttons}
        loading={tableLoading || parsingCSV}
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
          pageSizeOptions: [10, 20, 50, 100, 200],
          responsive: true,
        }}
      />
    </Flex>
  );
}

export default memo(AutoCertTable);
