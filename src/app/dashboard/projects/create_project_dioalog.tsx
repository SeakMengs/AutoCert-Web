"use client";
import {
  Select,
  Form,
  Button,
  Modal,
  Typography,
  Input,
  Upload,
  message,
} from "antd";
import { useState } from "react";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { FormItem } from "react-hook-form-antd";
import { zodResolver } from "@hookform/resolvers/zod";

const logger = createScopedLogger(
  "src:app:dashboard:projects:create_project_dioalog",
);

interface CreateProjectDialogProps {
  onCreated: () => void;
}

export default function CreateProjectDialog({
  onCreated,
}: CreateProjectDialogProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const formSchema = z.object({
    title: z
      .string({
        required_error: "Title is required",
      })
      .trim()
      .min(1, "Title is required")
      .max(100, {
        message: "Title must be less than 100 characters",
      }),
    pdfFile: z.instanceof(File, {
      message: "Please upload a PDF file",
    }),
    pageNumber: z.coerce.number({
      required_error: "Page number is required",
    }),
  });
  type CreateProjectFormValue = z.infer<typeof formSchema>;

  const form = useForm({
    defaultValues: {
      pageNumber: 1,
    },
    resolver: zodResolver(formSchema),
  });

  const resetForm = (): void => {
    form.reset();
  };

  const toggleModal = (): void => {
    setModalOpen(!modalOpen);
    resetForm();
  };

  const onModalCancel = (): void => {
    setModalOpen(false);
    resetForm();
  };

  const handleCreateProject = async (
    data: CreateProjectFormValue,
  ): Promise<void> => {
    try {
      logger.info("Creating project", data);

      onCreated();
      setModalOpen(false);
    } catch (error) {
      logger.error("Failed to create project", error);
      message.error("Failed to create project. Please try again later.");
    }
  };

  return (
    <>
      <Button className="" icon={<PlusOutlined />} onClick={toggleModal} />
      <Modal
        title="Create New Project"
        open={modalOpen}
        onCancel={onModalCancel}
        onOk={form.handleSubmit(handleCreateProject)}
        confirmLoading={form.formState.isSubmitting}
        maskClosable={form.formState.isSubmitting}
        okButtonProps={{
          disabled: form.formState.isSubmitting,
        }}
        destroyOnClose={true}
      >
        <Form
          onFinish={form.handleSubmit(handleCreateProject)}
          layout="vertical"
          disabled={form.formState.isSubmitting}
        >
          <FormItem
            control={form.control}
            required
            name="title"
            label="Project Title"
          >
            <Input placeholder="Enter project title" />
          </FormItem>
          <FormItem
            control={form.control}
            required
            name="pdfFile"
            label="Upload PDF File"
            valuePropName="pdfFile"
            getValueFromEvent={(e) => e?.fileList?.[0] || null}
          >
            <Upload.Dragger
              name="pdfFile"
              accept=".pdf"
              showUploadList={true}
              multiple={false}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-hint">Only PDF files are supported.</p>
              Click or drag file to this area to upload
            </Upload.Dragger>
          </FormItem>
          {form.watch().pdfFile && (
            <FormItem
              control={form.control}
              required
              name="pageNumber"
              label="Page number"
            >
              <Input
                type="number"
                placeholder="Enter page number for the template"
              />
            </FormItem>
          )}
        </Form>
      </Modal>
    </>
  );
}
