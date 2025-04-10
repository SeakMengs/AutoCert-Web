import { ProjectStatus, SignatoryStatus } from "@/types/project";
import { z } from "zod";

export const ProjectSignatorySchema = z.object({
  email: z.string().email(),
  profileUrl: z.string().url(),
  status: z.nativeEnum(SignatoryStatus),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  templateUrl: z.string(),
  isPublic: z.boolean(),
  signatories: z.array(ProjectSignatorySchema).default([]),
  status: z.nativeEnum(ProjectStatus),
  createdAt: z.string().nullable(),
});
