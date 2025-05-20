import { ProjectStatus, SignatoryStatus } from "@/types/project";
import { z } from "zod";
import { columnAnnotateSchema, signatureAnnotateSchema } from "./annotate";

export const ProjectSignatorySchema = z.object({
  email: z.string().email(),
  profileUrl: z.string().url(),
  status: z.nativeEnum(SignatoryStatus).catch(SignatoryStatus.NotInvited),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  templateUrl: z.string(),
  isPublic: z.boolean(),
  signatories: z.array(ProjectSignatorySchema).default([]),
  status: z.nativeEnum(ProjectStatus).catch(ProjectStatus.Draft),
  createdAt: z.string().nullable(),
});

// TODO: change role type if use enum in go api
export const ProjectLogSchema = z.object({
  id: z.string(),
  role: z.string(),
  action: z.string(),
  description: z.string(),
  timestamp: z.string(),
});

export const ProjectByIdSchema = ProjectSchema.pick({
  id: true,
  title: true,
  isPublic: true,
  signatories: true,
  status: true,
  templateUrl: true,
}).extend({
  embedQr: z.boolean(),
  csvFileUrl: z.string(),
  columnAnnotates: z.array(columnAnnotateSchema),
  signatureAnnotates: z.array(signatureAnnotateSchema),
});