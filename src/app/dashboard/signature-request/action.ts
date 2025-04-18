"use server";

import { z } from "zod";
import {
  getSignatoryProjectsParamsSchema,
  getSignatoryProjectsSuccessResponseSchema,
} from "./schema";
import { createScopedLogger } from "@/utils/logger";
import {
  responseFailed,
  ResponseJson,
  responseSomethingWentWrong,
} from "@/utils/response";
import { apiWithAuth } from "@/utils/axios";
import { formatZodError } from "@/utils/error";
import { PageSize } from "@/utils/pagination";

const logger = createScopedLogger(
  "src:app:dashboard:signature-request:action.ts",
);

export type GetSignatoryProjectsParams = z.infer<
  typeof getSignatoryProjectsParamsSchema
>;
export type GetSignatoryProjectsSuccessResponse = z.infer<
  typeof getSignatoryProjectsSuccessResponseSchema
>;

export async function getSignatoryProjectsAction(
  data: GetSignatoryProjectsParams,
): Promise<ResponseJson<GetSignatoryProjectsSuccessResponse, {} | undefined>> {
  try {
    logger.info("get signatory project action", data);

    const params = getSignatoryProjectsParamsSchema.safeParse(data);
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

    const url = `/api/v1/me/projects/signatory/?${searchParams.toString()}`;

    const res =
      await apiWithAuth.get<
        ResponseJson<GetSignatoryProjectsSuccessResponse, {} | undefined>
      >(url);

    if (!res.data.success) {
      return res.data;
    }

    const parseData = getSignatoryProjectsSuccessResponseSchema.safeParse(
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
    logger.error("Failed to get signatory projects", error);

    return responseSomethingWentWrong("Failed to get signatory projects");
  }
}
