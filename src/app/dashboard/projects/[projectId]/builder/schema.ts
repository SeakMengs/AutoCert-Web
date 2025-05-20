import { ProjectByIdSchema } from "@/schemas/autocert_api/project";
import { ProjectRole } from "@/types/project";
import { z } from "zod";

export const getProjectByIdSuccessResponseSchema = z.object({
  roles: z.array(z.nativeEnum(ProjectRole)).default([]),
  project: ProjectByIdSchema,
});
