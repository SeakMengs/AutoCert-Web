import { ProjectSchema } from "@/schemas/autocert_api/project";
import { ProjectStatus } from "@/types/project";
import { MB, readableFileSize } from "@/utils/file";
import { z } from "zod";

export const getSignatoryProjectsSuccessResponseSchema = z.object({
  total: z.number(),
  projects: z.array(ProjectSchema).default([]),
  page: z.number(),
  pageSize: z.number(),
  totalPage: z.number(),
  search: z.string().optional(),
  status: z.array(z.nativeEnum(ProjectStatus)).optional(),
});

export const getSignatoryProjectsParamsSchema = z.object({
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

const MAX_SIG_FILE_SIZE = 5 * MB;
export const ALLOWED_SIG_FILE_TYPES = ["image/png", "image/svg+xml"];
export const addSignatureSchema = z.object({
  signatureFile: z
    .instanceof(File, { message: "Signature file is required" })
    .refine((file) => file && file instanceof File, {
      message: "Please upload a valid signature file.",
    })
    .refine((file) => file.type && ALLOWED_SIG_FILE_TYPES.includes(file.type), {
      message: `Invalid file type. Only allow ${ALLOWED_SIG_FILE_TYPES.map(
        (type) => type.replace("image/", "").replace("+xml", ""),
      ).join(", ")} formats.`,
    })
    .refine((file) => file.size <= MAX_SIG_FILE_SIZE, {
      message: `Signature file size must be ${readableFileSize(
        MAX_SIG_FILE_SIZE,
      )} or smaller.`,
    })
    .nullable(),
});

export const addSignatureSuccessResponseSchema = z.object({
  signature: z.object({
    id: z.string(),
    url: z.string(),
  }),
});

export const getSignatureByIdSuccessResponseSchema = z.object({
  signature: z.object({
    url: z.string(),
  }),
});