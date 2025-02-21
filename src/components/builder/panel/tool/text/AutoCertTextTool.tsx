"use client";
import {
    Button,
    Card,
    ColorPicker,
    Form,
    Input,
    Modal,
    Select,
    Space,
} from "antd";
import { AutoCertPanelProps } from "../../AutoCertPanel";
import { useState } from "react";
import { AnnotateColor } from "@/components/builder/hooks/useAutoCert";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger(
    "components:builder:panel:tool:text:AutoCertTextTool"
);

interface AutoCertTextToolProps
    extends Pick<
        AutoCertPanelProps,
        "addTextField" | "tableColumns" | "textAnnotates"
    > {}

type FontOption = {
    label: string;
    value: string;
};

export default function AutoCertTextTool({
    textAnnotates,
    tableColumns,
    addTextField,
}: AutoCertTextToolProps) {
    return (
        <Space direction="vertical" className="w-full">
            <Add addTextField={addTextField} tableColumns={tableColumns} />
            <List textAnnotates={textAnnotates} />
        </Space>
    );
}

interface AutoCertTextToolAddProps
    extends Pick<AutoCertTextToolProps, "addTextField" | "tableColumns"> {}

const { Option } = Select;
function Add({ tableColumns, addTextField }: AutoCertTextToolAddProps) {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [form] = Form.useForm();

    const fontOptions = [
        { label: "Arial", value: "Arial" },
        { label: "Helvetica", value: "Helvetica" },
        { label: "Times New Roman", value: "Times New Roman" },
    ] satisfies FontOption[];

    const toggleModal = () => {
        form.resetFields();
        setModalOpen(!modalOpen);
    };

    const onModalCancel = () => {
        setModalOpen(false);
    };

    const handleAddField = async () => {
        logger.debug("AutoCert add text field confirmed");
        try {
            const values = await form.validateFields();
            addTextField();
            setModalOpen(false);
        } catch (error) {
            logger.error("AutoCert add text field failed", error);
        }
    };

    return (
        <>
            <Button type="dashed" onClick={toggleModal}>
                Add Text Field
            </Button>
            <Modal
                title="Add New Field"
                open={modalOpen}
                onCancel={onModalCancel}
                onOk={handleAddField}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="field"
                        label="field"
                        rules={[
                            {
                                required: true,
                                message: "Please select a table column field",
                            },
                        ]}
                    >
                        <Select>
                            {tableColumns.map((column) => (
                                <Option key={column.title} value={column.title}>
                                    {column.title}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="fontName"
                        label="Font Name"
                        initialValue="Arial"
                    >
                        <Select>
                            {fontOptions.map((font) => (
                                <Option key={font.value} value={font.value}>
                                    {font.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="color"
                        label="Color"
                        initialValue={AnnotateColor}
                        getValueFromEvent={(color) => color.hex}
                    >
                        <ColorPicker size="small" showText />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

interface AutoCertTextToolListProps
    extends Pick<AutoCertTextToolProps, "textAnnotates"> {}

function List({ textAnnotates }: AutoCertTextToolListProps) {
    return (
        <Space direction="vertical" className="w-full">
            {textAnnotates.map((annotate) => (
                <Card key={annotate.id} size="small">
                    <div>{annotate.value}</div>
                </Card>
            ))}
        </Space>
    );
}
