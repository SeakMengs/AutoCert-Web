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
  }),
});
