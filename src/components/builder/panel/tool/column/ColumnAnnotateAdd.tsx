import { AnnotateColor } from "@/components/builder/hooks/useAutoCert";
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
  fontOptions,
  ColumnAnnotateFormSchema,
  ColumnToolProps,
} from "./ColumnTool";
import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger(
  "components:builder:panel:tool:column:ColumnAnnotateAdd",
);

interface ColumnAnnotateAddProps
  extends Pick<
    ColumnToolProps,
    "onColumnAnnotateAdd" | "columns" | "currentPdfPage"
  > {}

const { Option } = Select;
const { Text } = Typography;

export default function ColumnAnnotateAdd({
  currentPdfPage,
  columns,
  onColumnAnnotateAdd,
}: ColumnAnnotateAddProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<ColumnAnnotateFormSchema>();

  const resetForm = (): void => {
    form.setFieldsValue({
      value: columns[0]?.title,
      fontName: fontOptions[0].value,
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

    try {
      const values = await form.validateFields();
      onColumnAnnotateAdd(currentPdfPage, values);
      setModalOpen(false);
    } catch (error) {
      logger.error("AutoCert add column annotate field failed", error);
    }
  };

  return (
    <>
      <Button
        className="w-full"
        type="dashed"
        icon={<PlusOutlined />}
        onClick={toggleModal}
      >
        Column Field
      </Button>
      <Modal
        title="Add Column Field"
        open={modalOpen}
        onCancel={onModalCancel}
        onOk={handleAddAnnotate}
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
        <Form form={form} layout="horizontal">
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
          <Form.Item required name="fontName" label="Font Name" initialValue="Arial">
            <Select>
              {fontOptions.map((font) => (
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
