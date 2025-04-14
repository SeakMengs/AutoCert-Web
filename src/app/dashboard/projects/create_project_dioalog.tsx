"use client";

import {
  Form,
  Button,
  Modal,
  Typography,
  Input,
  Upload,
  App,
  UploadProps,
  UploadFile,
} from "antd";
import { useState } from "react";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { FormItem } from "react-hook-form-antd";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema } from "./schema";
import { createProjectAction } from "./action";
import { UploadChangeParam } from "antd/es/upload";
import useAsync from "@/hooks/useAsync";
import FormErrorMessages from "@/components/error/FormErrorMessages";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const logger = createScopedLogger(
  "src:app:dashboard:projects:create_project_dioalog",
);

export type CreateProjectFormValue = z.infer<typeof createProjectSchema>;

interface CreateProjectDialogProps {
  onCreated: (data: CreateProjectFormValue) => void;
}

export default function CreateProjectDialog({
  onCreated,
}: CreateProjectDialogProps) {
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);

  const createProject = useAsync(createProjectAction);

  const form = useForm({
    defaultValues: {
      page: 1,
    },
    resolver: zodResolver(createProjectSchema),
  });

  const reset = (): void => {
    form.reset();
    setPdfPageCount(0);
  };

  const toggleModal = (): void => {
    setModalOpen(!modalOpen);
    reset();
  };

  const onModalCancel = (): void => {
    setModalOpen(false);
    reset();
  };

  const handleCreateProject = async (
    data: CreateProjectFormValue,
  ): Promise<void> => {
    try {
      logger.info("Creating project", data);

      await form.trigger();

      if (data.page && data.page > pdfPageCount) {
        form.setError("page", {
          type: "max",
          message: `Page number must be between 1 and ${pdfPageCount}`,
        });
        return;
      }

      if (!form.formState.isValid) {
        logger.error("Form is invalid", form.formState.errors);
        message.error("Please fill in all required fields");
        return;
      }

      const ok = await createProject.fetch(data);
      if (!ok) {
        message.error("Failed to create project");
        return;
      }

      onCreated(data);

      message.success("Project created successfully");
      toggleModal();
    } catch (error) {
      logger.error("Failed to create project", error);
      message.error("Failed to create project. Please try again later.");
    }
  };

  const getPageCountFromPdf = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const pdfData = new Uint8Array(e.target?.result as ArrayBuffer);
        const pdf = await pdfjs.getDocument(pdfData).promise;
        resolve(pdf.numPages);
      };
      fileReader.onerror = (error) => {
        logger.error("Failed to read PDF file", error);
        reject(error);
      };
      fileReader.readAsArrayBuffer(file);
    });
  };

  const handleBeforeFileUpload: UploadProps["beforeUpload"] = async (file) => {
    const isPdf = file.type === "application/pdf";
    if (!isPdf) return false;

    const pageCount = await getPageCountFromPdf(file);
    setPdfPageCount(pageCount);

    form.setValue("page", 1);
    form.setValue("templateFile", file);
    await form.trigger("templateFile");

    if (form.formState.errors.templateFile) {
      setPdfPageCount(0);
      form.setValue("templateFile", null);
    }

    return false;
  };

  const onFileUploadChange = async (
    info: UploadChangeParam<UploadFile<any>>,
  ) => {
    switch (info.file.status) {
      case "done":
        // since this will never call cuz the beforeUpload is set to false
        break;
      case "removed":
        setPdfPageCount(0);
        form.setValue("templateFile", null);
        break;
      case "error":
        message.error(`${info.file.name} file upload failed.`);
        break;
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
        maskClosable={!form.formState.isSubmitting}
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
          <Form.Item
            // control={form.control}
            required
            name="templateFile"
            label="Upload PDF File"
            valuePropName="templateFile"
            getValueFromEvent={(e) => e?.fileList?.[0] || null}
          >
            <Upload.Dragger
              name="templateFile"
              accept=".pdf"
              showUploadList={true}
              beforeUpload={handleBeforeFileUpload}
              multiple={false}
              maxCount={1}
              onChange={onFileUploadChange}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-hint">Only PDF files are supported.</p>
              Click or drag file to this area to upload
            </Upload.Dragger>
            {form.formState.errors.templateFile && (
              <Typography.Text type="danger">
                {form.formState.errors.templateFile?.message?.toString()}
              </Typography.Text>
            )}
          </Form.Item>
          {pdfPageCount > 0 && (
            <FormItem
              control={form.control}
              required
              name="page"
              label={
                <>
                  Page Number{" "}
                  <Typography.Text type="secondary">
                    {" "}
                    (1 - {pdfPageCount})
                  </Typography.Text>
                </>
              }
            >
              <Input
                type="number"
                min={1}
                max={pdfPageCount}
                placeholder={`Enter a page number between 1 and ${pdfPageCount}`}
              />
            </FormItem>
          )}
        </Form>
        {createProject.error && (
          <FormErrorMessages errors={createProject.error} />
        )}
      </Modal>
    </>
  );
}
