"use server";

import { apiWithAuth } from "@/utils/axios";
import { formatZodError } from "@/utils/error";
import { responseFailed, ResponseJson } from "@/utils/response";
import { z } from "zod";
import {
  GetOwnProjectsParamsSchema,
  GetOwnProjectsSuccessResponseSchema,
} from "./schema";

export type GetOwnProjectsParams = z.infer<typeof GetOwnProjectsParamsSchema>;
export type GetOwnProjectsSucessResponse = z.infer<
  typeof GetOwnProjectsSuccessResponseSchema
>;

export async function getOwnProjects(
  data: GetOwnProjectsParams,
): Promise<ResponseJson<GetOwnProjectsSucessResponse, any>> {
  const params = GetOwnProjectsParamsSchema.safeParse(data);
  if (!params.success) {
    return responseFailed("Invalid params", formatZodError(params.error));
  }

  const searchParams = new URLSearchParams(params.data as any);
  const url = `/api/v1/projects/me?${searchParams.toString()}`;

  const res =
    await apiWithAuth.get<ResponseJson<GetOwnProjectsSucessResponse, any>>(url);

  if (!res.data.success) {
    return res.data;
  }

  const parseData = GetOwnProjectsSuccessResponseSchema.safeParse(
    res.data.data,
  );
  if (!parseData.success) {
    return responseFailed(
      "Parse and get invalid expect response data",
      formatZodError(parseData.error),
    );
  }

  return {
    ...res.data,
    data: parseData.data,
  };
}
