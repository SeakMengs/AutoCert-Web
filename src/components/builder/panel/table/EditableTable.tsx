import {
  FormInstance,
  Form,
  InputRef,
  Input,
  Button,
  Flex,
  Popconfirm,
  Tooltip,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  useState,
  useRef,
  useContext,
  useEffect,
  PropsWithChildren,
  memo,
} from "react";
import { AutoCertTableColumn, AutoCertTableRow } from "./AutoCertTable";
import React from "react";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger(
  "components:builder:panel:table:EditableTable",
);

// Props of this function as passed by processedColumns onCell and onHeaderCell from AutoCertTable

// Refer to doc: https://ant.design/components/table#table-demo-edit-cell
const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

// Refer to doc: https://ant.design/components/table#table-demo-edit-cell
export const EditableBodyRow = memo(({ index, ...props }: EditableRowProps) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
});

export interface EditableBodyCellProps extends AutoCertTableColumn {
  record: AutoCertTableRow;
  onSaveBodyRow: (record: AutoCertTableRow) => void;
}

// Refer to doc: https://ant.design/components/table#table-demo-edit-cell
export const EditableBodyCell = memo(
  ({
    title,
    editable,
    children,
    dataIndex,
    record,
    onSaveBodyRow,
    ...restProps
  }: PropsWithChildren<EditableBodyCellProps>) => {
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
        onSaveBodyRow({ ...record, ...values });
      } catch (err) {
        logger.error("Editable cell save failed:", err);
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
        <div className="editable-cell-value-wrap min-h-6" onClick={toggleEdit}>
          {children}
        </div>
      );
    }

    return <td {...restProps}>{childNode}</td>;
  },
);

// Verify similar to the above components but for header
interface EditableHeaderRowProps {
  index: number;
}

export const EditableHeaderRow = memo(
  ({ index, ...props }: EditableHeaderRowProps) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  },
);

export interface EditableHeaderCellProps extends AutoCertTableColumn {
  onDeleteHeaderColumn: (dataIndex: string) => void;
  onSaveHeaderRow: (dataIndex: string, value: any) => void;
}

export const EditableHeaderCell = memo(
  ({
    title,
    dataIndex,
    editable,
    onDeleteHeaderColumn,
    onSaveHeaderRow,
    children,
    ...restProps
  }: PropsWithChildren<EditableHeaderCellProps>) => {
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
      form.setFieldsValue({ [dataIndex]: title });
    };

    const save = async (): Promise<void> => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        onSaveHeaderRow(dataIndex, values[dataIndex]);
      } catch (err) {
        logger.error("Editable cell save failed:", err);
        setEditing(false);
      }
    };

    let childNode = children;

    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[{ required: true, message: `Column title is required.` }]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      ) : (
        <Flex
          justify="space-between"
          align="center"
          className="editable-cell-value-wrap min-h-6 group"
          onClick={toggleEdit}
        >
          <div>{children}</div>
          <Popconfirm
            title="All rows and annotations under this column will be deleted. Are you sure?"
            onConfirm={() => onDeleteHeaderColumn(dataIndex)}
          >
            <Tooltip title="Delete column">
              <Button
                className="opacity-0 group-hover:opacity-100"
                type="text"
                danger
                icon={<DeleteOutlined />}
                // Prevent the click event from propagating to the parent element which trigger edit mode
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>
        </Flex>
      );
    }

    return <th {...restProps}>{childNode}</th>;
  },
);
