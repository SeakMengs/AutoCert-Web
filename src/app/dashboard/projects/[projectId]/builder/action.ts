"use server";

import { apiWithAuth } from "@/utils/axios";
import { formatZodError } from "@/utils/error";
import {
  responseFailed,
  ResponseJson,
  responseSomethingWentWrong,
} from "@/utils/response";
import { z } from "zod";
import { createScopedLogger } from "@/utils/logger";
import { getProjectByIdSuccessResponseSchema } from "./schema";

const logger = createScopedLogger("src:app:dashboard:projects:action.ts");

export type GetProjectByIdParams = {
  projectId: string;
};

export type GetProjectByIdSuccessResponse = z.infer<
  typeof getProjectByIdSuccessResponseSchema
>;

export type ProjectById = Awaited<ReturnType<typeof getProjectByIdAction>>;

export async function getProjectByIdAction(data: GetProjectByIdParams): Promise<
  ResponseJson<
    GetProjectByIdSuccessResponse,
    {
      forbidden: string;
      notFound: string;
    }
  >
> {
  try {
    logger.info("get project by id action", data);

    const url = `/api/v1/projects/${data.projectId}`;

    const res =
      await apiWithAuth.get<ResponseJson<GetProjectByIdSuccessResponse, {}>>(
        url,
      );

    if (!res.data.success) {
      return res.data;
    }

    const parseData = getProjectByIdSuccessResponseSchema.safeParse(
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
    logger.error("Failed to get project by id", error);

    return responseSomethingWentWrong("Failed to get project by id");
  }
}
