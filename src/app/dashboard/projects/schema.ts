import { ProjectSchema } from "@/schemas/autocert_api/project";
import { ProjectStatus } from "@/types/project";
import { MB, readableFileSize } from "@/utils/file";
import { z } from "zod";

export const getOwnProjectsSuccessResponseSchema = z.object({
  total: z.number(),
  projects: z.array(ProjectSchema).default([]),
  page: z.number(),
  pageSize: z.number(),
  totalPage: z.number(),
  search: z.string().optional(),
  status: z.array(z.nativeEnum(ProjectStatus)).optional(),
});

export const getOwnProjectsParamsSchema = z.object({
  page: z
    .number()
    .int()
    .positive({ message: "Page must be a positive integer" })
    .optional(),
  pageSize: z
    .number()
    .int()
    .positive({ message: "Page size must be a positive integer" })
    .optional(),
  status: z.array(z.nativeEnum(ProjectStatus)).optional(),
  search: z.string().optional(),
});

const MAX_PDF_FILE_SIZE = 5 * MB;
export const createProjectSchema = z.object({
  title: z
    .string({ required_error: "Please enter a project title." })
    .trim()
    .min(1, "Project title cannot be empty.")
    .max(100, {
      message: "Project title must be 100 characters or fewer.",
    }),
  templateFile: z
    .instanceof(File, { message: "Template file is required" })
    .refine((file) => file && file instanceof File, {
      message: "Please upload a valid PDF file.",
    })
    .refine((file) => file.type === "application/pdf", {
      message: "Only PDF file is allowed. Please upload a .pdf file.",
    })
    .refine((file) => file.size <= MAX_PDF_FILE_SIZE, {
      message: `PDF file size must be ${readableFileSize(
        MAX_PDF_FILE_SIZE,
      )} or smaller.`,
    })
    .nullable(),
  page: z.coerce.number({
    required_error: "Please specify the page number.",
    invalid_type_error: "Page number must be a valid number.",
  }),
});
