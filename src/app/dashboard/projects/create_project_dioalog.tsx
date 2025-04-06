"use client";
import { Select, Form, Button, Modal, Typography, Input, Upload } from "antd";
import { useState } from "react";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";
import { z } from "zod";

const logger = createScopedLogger(
  "src:app:dashboard:projects:create_project_dioalog",
);

interface CreateProjectDialogProps {
  onCreated: (values: any) => void;
}

export default function CreateProjectDialog({
  onCreated,
}: CreateProjectDialogProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const formSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(100, {
      message: "Title must be less than 100 characters",
    }),
    pdfFile: z.instanceof(File, {
      message: "Please upload a PDF file",
    }),
  });

  const [form] = Form.useForm<z.infer<typeof formSchema>>();

  const resetForm = (): void => {
    form.setFieldsValue({
      title: "",
      pdfFile: "",
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

  const handleSubmit = async (): Promise<void> => {
    try {
      // logger.debug("");

      const values = await form.validateFields();
      onCreated(values);
      setModalOpen(false);
    } catch (error) {
      //   logger.error()
    }
  };

  return (
    <>
      <Button className="" icon={<PlusOutlined />} onClick={toggleModal} />
      <Modal
        title="Create New Project"
        open={modalOpen}
        onCancel={onModalCancel}
        onOk={handleSubmit}
        maskClosable={false}
        okButtonProps={{
          disabled: true,
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            required
            name="title"
            label="Project Title"
            rules={[
              {
                required: true,
                message: "Please enter the project title",
              },
            ]}
          >
            <Input placeholder="Enter project title" />
          </Form.Item>
          <Form.Item
            required
            name="pdfFile"
            label="Upload PDF File"
            valuePropName="pdfFile"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[
              {
                required: true,
                message: "Please upload a PDF file",
              },
            ]}
          >
            <Upload.Dragger name="pdfFile" accept=".pdf" showUploadList={true}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-hint">Only PDF files are supported.</p>
              Click or drag file to this area to upload
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
