"use client";
import {
    Button,
    Card,
    ColorPicker,
    Flex,
    Form,
    Modal,
    Popconfirm,
    Select,
    Space,
    Tag,
    theme,
    Tooltip,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import {
    AnnotateColor,
    TextAnnotateState,
} from "@/components/builder/hooks/useAutoCert";
import { createScopedLogger } from "@/utils/logger";
import { AggregationColor } from "antd/es/color-picker/color";
import { AutoCertTableColumn } from "../../table/AutoCertTable";

const logger = createScopedLogger(
    "components:builder:panel:tool:text:AutoCertTextTool"
);

export type TextFieldSchema = {
    value: string;
    fontName: string;
    color: string;
};

export interface AutoCertTextToolProps {
    currentPdfPage: number;
    textAnnotates: TextAnnotateState[];
    tableColumns: AutoCertTableColumn[];
    selectedAnnotateId: string | undefined;
    onAnnotateSelect: (id: string) => void;
    onAddTextField: (
        page: number,
        { value, fontName, color }: TextFieldSchema
    ) => void;
    onUpdateTextField: (
        id: string,
        { value, fontName, color }: TextFieldSchema
    ) => void;
    onDeleteTextField: (id: string) => void;
}

type FontOption = {
    label: string;
    value: string;
};

export default function AutoCertTextTool({
    currentPdfPage,
    selectedAnnotateId,
    textAnnotates,
    tableColumns,
    onAddTextField,
    onUpdateTextField,
    onDeleteTextField,
    onAnnotateSelect,
}: AutoCertTextToolProps) {
    return (
        <Space direction="vertical" className="w-full">
            <Add
                currentPdfPage={currentPdfPage}
                onAddTextField={onAddTextField}
                tableColumns={tableColumns}
            />
            <Space direction="vertical" className="w-full">
                {textAnnotates.map((textAnnotate) => (
                    <AnnotateTextCard
                        key={textAnnotate.id}
                        textAnnotate={textAnnotate}
                        selectedAnnotateId={selectedAnnotateId}
                        tableColumns={tableColumns}
                        onUpdateTextField={onUpdateTextField}
                        onDeleteTextField={onDeleteTextField}
                        onAnnotateSelect={onAnnotateSelect}
                    />
                ))}
            </Space>
        </Space>
    );
}

interface AutoCertTextToolAddProps
    extends Pick<
        AutoCertTextToolProps,
        "onAddTextField" | "tableColumns" | "currentPdfPage"
    > {}

const fontOptions = [
    { label: "Arial", value: "Arial" },
    { label: "Helvetica", value: "Helvetica" },
    { label: "Times New Roman", value: "Times New Roman" },
] satisfies FontOption[];

const { Option } = Select;
function Add({
    currentPdfPage,
    tableColumns,
    onAddTextField,
}: AutoCertTextToolAddProps) {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [form] = Form.useForm<TextFieldSchema>();

    const resetForm = () => {
        form.setFieldsValue({
            value: tableColumns[0]?.title,
            fontName: "Arial",
            color: AnnotateColor,
        });
    };

    const toggleModal = () => {
        setModalOpen(!modalOpen);
        resetForm();
    };

    const onModalCancel = () => {
        setModalOpen(false);
        resetForm();
    };

    const handleAddField = async () => {
        logger.debug("AutoCert add text field confirmed");

        try {
            const values = await form.validateFields();
            onAddTextField(currentPdfPage, values);
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
                <Form form={form} layout="horizontal">
                    <Form.Item
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
                        getValueFromEvent={(color: AggregationColor) => {
                            return `#${color.toHex()}`;
                        }}
                    >
                        <ColorPicker size="small" showText />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

interface AutoCertTextToolListProps
    extends Pick<
        AutoCertTextToolProps,
        | "selectedAnnotateId"
        | "tableColumns"
        | "onAnnotateSelect"
        | "onUpdateTextField"
        | "onDeleteTextField"
    > {
    textAnnotate: TextAnnotateState;
}

function AnnotateTextCard({
    textAnnotate,
    selectedAnnotateId,
    tableColumns,
    onAnnotateSelect,
    onUpdateTextField,
    onDeleteTextField,
}: AutoCertTextToolListProps) {
    const {
        token: { colorPrimary },
    } = theme.useToken();
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [form] = Form.useForm<TextFieldSchema>();

    const resetForm = () => {
        form.setFieldsValue({
            value: textAnnotate.value,
            fontName: textAnnotate.font.name,
            color: textAnnotate.color,
        });
    };

    const toggleEditModal = () => {
        setEditModalOpen(!editModalOpen);
        resetForm();
    };

    const onModalCancel = () => {
        setEditModalOpen(false);
        resetForm();
    };

    const handleEditField = async () => {
        logger.debug("AutoCert edit text field confirmed");
        try {
            const values = await form.validateFields();
            onUpdateTextField(textAnnotate.id, values);
            setEditModalOpen(false);
        } catch (error) {
            logger.error("AutoCert edit text field failed", error);
        }
    };

    return (
        <>
            <Card
                onClick={() => onAnnotateSelect(textAnnotate.id)}
                size="small"
                className="w-full"
                style={{
                    border: "1px solid transparent",
                    borderColor:
                        textAnnotate.id === selectedAnnotateId
                            ? colorPrimary
                            : undefined,
                }}
            >
                <Flex justify="space-between" align="center">
                    <Tag>{textAnnotate.value}</Tag>
                    <Space>
                        <Tooltip title="Edit">
                            <Button
                                onClick={toggleEditModal}
                                icon={<EditOutlined />}
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Are you sure to delete this field?"
                            onConfirm={() => onDeleteTextField(textAnnotate.id)}
                        >
                            <Tooltip title="Delete">
                                <Button icon={<DeleteOutlined />} danger />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                </Flex>
            </Card>
            <Modal
                title="Edit Field"
                open={editModalOpen}
                onCancel={onModalCancel}
                onOk={handleEditField}
            >
                <Form form={form} layout="horizontal">
                    <Form.Item
                        name="value"
                        label="Field"
                        initialValue={textAnnotate.value}
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
                        initialValue={textAnnotate.font.name}
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
                        initialValue={textAnnotate.color}
                        getValueFromEvent={(color: AggregationColor) => {
                            return `#${color.toHex()}`;
                        }}
                    >
                        <ColorPicker size="small" showText />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
