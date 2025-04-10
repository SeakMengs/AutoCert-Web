"use server";

import { apiWithAuth } from "@/utils/axios";
import { formatZodError } from "@/utils/error";
import {
  responseFailed,
  ResponseJson,
  responseSomethingWentWrong,
} from "@/utils/response";
import { z } from "zod";
import {
  GetOwnProjectsParamsSchema,
  GetOwnProjectsSuccessResponseSchema,
} from "./schema";
import { createScopedLogger } from "@/utils/logger";
import { PageSize } from "@/utils/pagination";

const logger = createScopedLogger("src:app:dashboard:projects:action.ts");

export type GetOwnProjectsParams = z.infer<typeof GetOwnProjectsParamsSchema>;
export type GetOwnProjectsSucessResponse = z.infer<
  typeof GetOwnProjectsSuccessResponseSchema
>;

export async function getOwnProjects(
  data: GetOwnProjectsParams,
): Promise<ResponseJson<GetOwnProjectsSucessResponse, any>> {
  try {
    logger.info("getOwnProjects", data);

    const params = GetOwnProjectsParamsSchema.safeParse(data);
    if (!params.success) {
      return responseFailed("Invalid params", formatZodError(params.error));
    }

    const searchParams = new URLSearchParams({
      page: data.page ? String(data.page) : "1",
      search: data.search ? data.search : "",
      pageSize: data.pageSize ? String(data.pageSize) : PageSize.toString(),
    });

    Array.isArray(data.status) &&
      data.status.forEach((status) => {
        searchParams.append("status", status.toString());
      });

    const url = `/api/v1/me/projects/?${searchParams.toString()}`;

    const res =
      await apiWithAuth.get<ResponseJson<GetOwnProjectsSucessResponse, any>>(
        url,
      );

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
  } catch (error) {
    logger.error("Failed to get own projects", error);

    return responseSomethingWentWrong("Failed to get own projects");
  }
}
