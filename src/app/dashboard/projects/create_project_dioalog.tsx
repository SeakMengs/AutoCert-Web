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
  Tooltip,
} from "antd";
import { useState } from "react";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { FormItem } from "react-hook-form-antd";
import { zodResolver } from "@hookform/resolvers/zod";
import { ALLOWED_TEMPLATE_FILE_TYPES, createProjectSchema } from "./schema";
import { createProjectAction } from "./action";
import { UploadChangeParam } from "antd/es/upload";
import FormErrorMessages from "@/components/error/FormErrorMessages";
import { pdfjs } from "react-pdf";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@/utils/react_query";
import { useRouter } from "next/navigation";
import PdfPreview from "@/components/pdf/PdfPreview";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const logger = createScopedLogger(
  "src:app:dashboard:projects:create_project_dioalog",
);

export type CreateProjectFormValue = z.infer<typeof createProjectSchema>;

interface CreateProjectDialogProps {}

export default function CreateProjectDialog({}: CreateProjectDialogProps) {
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data,
    mutateAsync,
    isPending,
    reset: resetMutation,
  } = useMutation({
    mutationFn: createProjectAction,
    onSuccess: (data, variables) => {
      if (!data.success) {
        message.error("Failed to create project");
        return;
      }

      message.success("Project created successfully");
      toggleModal();

      router.push(`/dashboard/projects/${data.data.projectId}/builder`);
    },
    onError: (error) => {
      logger.error("Failed to create project", error);
      message.error("Failed to create project.");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QueryKey.OwnProjects],
      });
    },
  });

  const form = useForm({
    defaultValues: {
      page: 1,
    },
    resolver: zodResolver(createProjectSchema),
  });

  const reset = (): void => {
    form.reset();
    resetMutation();
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

      await mutateAsync(data);
    } catch (error) {
      logger.error("Failed to create project", error);
      message.error("Failed to create project.");
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
        message.error(`${info.file.name} file (client) upload failed.`);
        break;
    }
  };

  const page = Number(form.watch("page"));
  const validPdfPage = pdfPageCount > 0 && page >= 1 && page <= pdfPageCount;

  return (
    <>
      <Tooltip title="Create project">
        <Button type="primary" icon={<PlusOutlined />} onClick={toggleModal}>
          Create Project
        </Button>
      </Tooltip>
      <Modal
        title="Create New Project"
        open={modalOpen}
        onCancel={onModalCancel}
        onOk={form.handleSubmit(handleCreateProject)}
        cancelButtonProps={{
          disabled: form.formState.isSubmitting || isPending,
        }}
        confirmLoading={form.formState.isSubmitting || isPending}
        maskClosable={!form.formState.isSubmitting && !isPending}
        destroyOnHidden
      >
        <Form
          onFinish={form.handleSubmit(handleCreateProject)}
          layout="vertical"
          disabled={form.formState.isSubmitting || isPending}
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
              accept={ALLOWED_TEMPLATE_FILE_TYPES.map(
                (type) => `.${type.split("/")[1]}`,
              ).join(",")}
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
          </Form.Item>
          {form.formState.errors.templateFile && (
            <Typography.Text type="danger">
              {form.formState.errors.templateFile?.message?.toString()}
            </Typography.Text>
          )}
          {pdfPageCount > 0 && (
            <>
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
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value < 1 || value > pdfPageCount) {
                      form.setError("page", {
                        type: "max",
                        message: `Page number must be between 1 and ${pdfPageCount}`,
                      });
                    } else {
                      form.clearErrors("page");
                    }
                  }}
                />
              </FormItem>
              {validPdfPage && (
                <PdfPreview
                  key={`pdf-preview-${page}`}
                  pdfUrl={form.getValues("templateFile")}
                  pageNumber={page}
                />
              )}
            </>
          )}
        {data && !data.success && <FormErrorMessages errors={data.errors} />}
        </Form>
      </Modal>
    </>
  );
}
