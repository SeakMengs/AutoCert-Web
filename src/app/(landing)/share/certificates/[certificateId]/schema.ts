import { z } from "zod";

export const getCertificateByIdSuccessResponseSchema = z.object({
  id: z.string(),
  certificateUrl: z.string(),
  issuedAt: z.string(),
  issuer: z.string(),
  projectTitle: z.string(),
  number: z.number(),
});