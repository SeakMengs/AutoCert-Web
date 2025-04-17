import { FontWeight } from "@/components/builder/annotate/ColumnAnnotate";
import { SignatoryStatus } from "@/types/project";
import { z } from "zod";

export const columnAnnotateSchema = z.object({
  page: z.number(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: z.string(),
  id: z.string(),
  value: z.string(),
  fontName: z.string(),
  fontSize: z.number(),
  fontWeight: z.nativeEnum(FontWeight).default(FontWeight.Regular),
  fontColor: z.string(),
  textFitRectBox: z.boolean(),
});

export const signatureAnnotateSchema = z.object({
  page: z.number(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: z.string(),
  id: z.string(),
  status: z.nativeEnum(SignatoryStatus).default(SignatoryStatus.NotInvited),
  email: z.string(),
});
