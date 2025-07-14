import { CertificateSchema } from "@/schemas/autocert_api/certificate";
import {
  ProjectLogSchema,
  ProjectSchema,
} from "@/schemas/autocert_api/project";
import { ProjectRole } from "@/types/project";
import { z } from "zod";

export const getCertificatesByProjectIdSuccessResponseSchema = z.object({
  roles: z.array(z.nativeEnum(ProjectRole)).default([]),
  project: ProjectSchema.pick({
    id: true,
    title: true,
    createdAt: true,
    isPublic: true,
    signatories: true,
    status: true,
  }).extend({
    logs: z.array(ProjectLogSchema).default([]),
    certificates: z.array(CertificateSchema).default([]),
    certificateMergedUrl: z.string().nullable().default(null),
    certificateZipUrl: z.string().nullable().default(null),
  }),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const getCertificatesByProjectIdParamsSchema = z.object({
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
  projectId: z.string().min(1, "Project ID is required"),
});
