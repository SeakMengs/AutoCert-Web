import { ProjectSchema } from "@/schemas/autocert_api/project";
import { ProjectStatus } from "@/types/project";
import { z } from "zod";

export const GetOwnProjectsSuccessResponseSchema = z.object({
  total: z.number(),
  projects: z.array(ProjectSchema).default([]),
  page: z.number(),
  pageSize: z.number(),
  totalPage: z.number(),
  search: z.string().optional(),
  status: z.array(z.nativeEnum(ProjectStatus)).optional(),
});

export const GetOwnProjectsParamsSchema = z.object({
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
