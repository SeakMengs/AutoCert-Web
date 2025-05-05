import { z } from "zod";

export const CertificateSchema = z.object({
  id: z.string(),
  number: z.number(),
  certificateUrl: z.string(),
  createdAt: z.string().nullable(),
});
