import {
  columnAnnotateSchema,
  signatureAnnotateSchema,
} from "@/schemas/autocert_api/annotate";
import { ProjectRole } from "@/types/project";
import { z } from "zod";

export const projectByIdSchema = z.object({
  id: z.string(),
  title: z.string(),
  templateUrl: z.string().url(),
  isPublic: z.boolean(),
  status: z.number(),
  embedQr: z.boolean(),
  csvFileUrl: z.string(),
  columnAnnotates: z.array(columnAnnotateSchema),
  signatureAnnotates: z.array(signatureAnnotateSchema),
});

export const getProjectByIdSuccessResponseSchema = z.object({
  roles: z.array(z.nativeEnum(ProjectRole)).default([]),
  project: projectByIdSchema,
});
