import {
  columnAnnotateSchema,
  signatureAnnotateSchema,
} from "@/schemas/autocert_api/annotate";
import { ProjectSchema } from "@/schemas/autocert_api/project";
import { ProjectRole } from "@/types/project";
import { z } from "zod";

export const projectByIdSchema = ProjectSchema.pick({
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

export const getProjectByIdSuccessResponseSchema = z.object({
  roles: z.array(z.nativeEnum(ProjectRole)).default([]),
  project: projectByIdSchema,
});
