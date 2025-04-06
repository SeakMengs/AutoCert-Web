import { ProjectStatus } from "@/types/project";
import { z } from "zod";

const ProjectSignatorySchema = z.object({
  email: z.string().email(),
  profileUrl: z.string().url(),
  status: z.nativeEnum(ProjectStatus),
});

const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  templateUrl: z.string(),
  isPublic: z.boolean(),
  signatories: z
    .array(ProjectSignatorySchema)
    .default([]),
  status: z.nativeEnum(ProjectStatus),
  createdAt: z.string().nullable(),
});

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
