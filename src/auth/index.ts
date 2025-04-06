import { z } from "zod";

export const authUserSchema = z.object({
  id: z.string().trim().min(1, {
    message: "ID is required",
  }),
  email: z.string().trim().email({
    message: "Invalid email address",
  }),
  firstName: z.string().trim().min(1, {
    message: "First name is required",
  }),
  lastName: z.string().trim().min(1, {
    message: "Last name is required",
  }),
  profileUrl: z.string().url(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
