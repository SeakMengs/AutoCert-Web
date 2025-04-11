"use client";
import {
  Select,
  Form,
  Button,
  Modal,
  Typography,
  Input,
  Upload,
  App,
} from "antd";
import { useState } from "react";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { FormItem } from "react-hook-form-antd";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadChangeParam, UploadFile } from "antd/es/upload";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const logger = createScopedLogger(
  "src:app:dashboard:projects:create_project_dioalog",
);

interface CreateProjectDialogProps {
  onCreated: () => void;
}

export default function CreateProjectDialog({
  onCreated,
}: CreateProjectDialogProps) {
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);

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
    pdfFile: z.any().refine((file) => {
      if (file instanceof File) {
        return file.type === "application/pdf";
      }
      return false;
    }, "Please upload a valid PDF file"),

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

      if (data.pageNumber && data.pageNumber > pdfPageCount) {
        form.setError("pageNumber", {
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

      onCreated();

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

  const onFileUploadChange = async (
    info: UploadChangeParam<UploadFile<any>>,
  ) => {
    switch (info.file.status) {
      case "done":
        // since this will never call cuz the beforeUpload is set to false
        break;
      case "removed":
        setPdfPageCount(0);
        form.setValue("pdfFile", null);
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
          <Form.Item
            // control={form.control}
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
              beforeUpload={async (file, fileList) => {
                const isPdf = file.type === "application/pdf";
                if (isPdf) {
                  const pageCount = await getPageCountFromPdf(file);
                  setPdfPageCount(pageCount);
                  form.setValue("pageNumber", 1);
                  form.setValue("pdfFile", file);
                }

                await form.trigger("pdfFile");

                return false;
              }}
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
            {form.formState.errors.pdfFile && (
              <Typography.Text type="danger">
                {form.formState.errors.pdfFile?.message?.toString()}
              </Typography.Text>
            )}
          </Form.Item>
          {pdfPageCount > 0 && (
            <FormItem
              control={form.control}
              required
              name="pageNumber"
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
      </Modal>
    </>
  );
}
