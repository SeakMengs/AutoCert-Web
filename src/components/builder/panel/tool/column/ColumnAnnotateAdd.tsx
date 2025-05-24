import {
  Select,
  Form,
  Button,
  Modal,
  ColorPicker,
  Alert,
  Flex,
  Switch,
  Tooltip,
  Typography,
} from "antd";
import { AggregationColor } from "antd/es/color-picker/color";
import { useState } from "react";
import {
  FontOptions,
  ColumnAnnotateFormSchema,
  ColumnToolProps,
} from "./ColumnTool";
import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";
import { wait } from "@/utils";
import { FAKE_LOADING_TIME } from "@/components/builder/store/autocertChangeSlice";
import { AnnotateColor } from "@/components/builder/annotate/BaseAnnotate";

const logger = createScopedLogger(
  "components:builder:panel:tool:column:ColumnAnnotateAdd",
);

interface ColumnAnnotateAddProps
  extends Pick<
    ColumnToolProps,
    "onColumnAnnotateAdd" | "columns" | "currentPdfPage"
  > {
  canAdd: boolean;
}

const { Option } = Select;
const { Text } = Typography;

export default function ColumnAnnotateAdd({
  currentPdfPage,
  columns,
  canAdd,
  onColumnAnnotateAdd,
}: ColumnAnnotateAddProps) {
  const [adding, setAdding] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<ColumnAnnotateFormSchema>();

  const resetForm = (): void => {
    form.setFieldsValue({
      value: columns[0]?.title,
      fontName: FontOptions[0].value,
      color: AnnotateColor,
      textFitRectBox: true,
    });
  };

  const toggleModal = (): void => {
    setModalOpen(!modalOpen);
    resetForm();
  };

  const onModalCancel = (): void => {
    setModalOpen(false);
    resetForm();
  };

  const handleAddAnnotate = async (): Promise<void> => {
    logger.debug("AutoCert add column annotate field confirmed");

    if (!canAdd) {
      logger.warn("AutoCert add column annotate field is not allowed");
      return;
    }

    setAdding(true);

    try {
      const values = await form.validateFields();

      await wait(FAKE_LOADING_TIME);

      onColumnAnnotateAdd(currentPdfPage, values);
      setModalOpen(false);
    } catch (error) {
      logger.error("AutoCert add column annotate field failed", error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <Button
        className="w-full"
        type="dashed"
        icon={<PlusOutlined />}
        onClick={toggleModal}
        disabled={!canAdd}
      >
        Column Field
      </Button>
      <Modal
        title="Add Column Field"
        open={modalOpen}
        onCancel={onModalCancel}
        onOk={handleAddAnnotate}
        confirmLoading={adding}
      >
        {Array.isArray(columns) && columns.length === 0 && (
          <Alert
            className="mb-4"
            message="To add a column field, please insert the table data column on the second tab first."
            type="warning"
            showIcon
            closable
          />
        )}
        <Form form={form} layout="horizontal" disabled={adding}>
          <Form.Item
            required
            name="value"
            label="Field"
            rules={[
              {
                required: true,
                message: "Please select a table column field",
              },
            ]}
          >
            <Select>
              {columns.map((column) => (
                <Option key={column.title} value={column.title}>
                  {column.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            required
            name="fontName"
            label="Font Name"
            initialValue="Arial"
          >
            <Select>
              {FontOptions.map((font) => (
                <Option key={font.value} value={font.value}>
                  {font.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            required
            name="color"
            label="Color"
            initialValue={AnnotateColor}
            getValueFromEvent={(color: AggregationColor) => {
              return `#${color.toHex()}`;
            }}
          >
            <ColorPicker size="small" showText />
          </Form.Item>

          <Form.Item
            required
            name={"textFitRectBox"}
            initialValue={true}
            label={
              <Text>
                Text fit rectangle box
                <Tooltip title="Automatically adjusts font size to fit text within the rectangle box.">
                  <QuestionCircleOutlined className="ml-1" />
                </Tooltip>
              </Text>
            }
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
