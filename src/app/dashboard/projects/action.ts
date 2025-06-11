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
  createProjectSchema,
  createProjectSuccessResponseSchema,
  getOwnProjectsParamsSchema,
  getOwnProjectsSuccessResponseSchema,
} from "./schema";
import { createScopedLogger } from "@/utils/logger";
import { PageSize } from "@/utils/pagination";

const logger = createScopedLogger("src:app:dashboard:projects:action.ts");

export type GetOwnProjectsParams = z.infer<typeof getOwnProjectsParamsSchema>;
export type GetOwnProjectsSuccessResponse = z.infer<
  typeof getOwnProjectsSuccessResponseSchema
>;

export async function getOwnProjectsAction(
  data: GetOwnProjectsParams,
): Promise<ResponseJson<GetOwnProjectsSuccessResponse, {}>> {
  try {
    logger.info("get own project action", data);

    const params = getOwnProjectsParamsSchema.safeParse(data);
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
      await apiWithAuth.get<ResponseJson<GetOwnProjectsSuccessResponse, {}>>(
        url,
      );

    if (!res.data.success) {
      return res.data;
    }

    const parseData = getOwnProjectsSuccessResponseSchema.safeParse(
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

export type CreateProjectParams = z.infer<typeof createProjectSchema>;
export type CreateProjectSuccessResponse = z.infer<
  typeof createProjectSuccessResponseSchema
>;

export async function createProjectAction(
  data: CreateProjectParams,
): Promise<ResponseJson<CreateProjectSuccessResponse, {}>> {
  try {
    logger.info("create project action", data);

    const form = new FormData();
    form.append("page", data.page.toString());
    form.append("title", data.title);
    if (data.templateFile) {
      form.append("templateFile", data.templateFile);
    }

    const url = `/api/v1/projects/`;
    const res = await apiWithAuth.postForm<
      ResponseJson<CreateProjectSuccessResponse, {}>
    >(url, form);

    if (!res.data.success) {
      return res.data;
    }

    const parseData = createProjectSuccessResponseSchema.safeParse(
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
    };
  } catch (error) {
    logger.error("Failed to create project", error);

    return responseSomethingWentWrong("Failed to create project");
  }
}

export type DeleteProjectByIdParams = {
  projectId: string;
};
export type DeleteProjectByIdSuccessResponse = {};

export async function deleteProjectByIdAction(
  data: DeleteProjectByIdParams,
): Promise<ResponseJson<DeleteProjectByIdSuccessResponse, {}>> {
  try {
    logger.info("delete project by id action", data);

    const url = `/api/v1/projects/${data.projectId}/`;
    const res =
      await apiWithAuth.delete<
        ResponseJson<DeleteProjectByIdSuccessResponse, {}>
      >(url);

    if (!res.data.success) {
      return res.data;
    }

    return {
      ...res.data,
      data: {},
    };
  } catch (error) {
    logger.error("Failed to delete project by id", error);

    return responseSomethingWentWrong("Failed to delete project by id");
  }
}
