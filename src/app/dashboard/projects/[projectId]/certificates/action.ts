"use server";

import { createScopedLogger } from "@/utils/logger";
import { getCertificatesByProjectIdSuccessResponseSchema } from "./schema";
import {
  responseFailed,
  ResponseJson,
  responseSomethingWentWrong,
} from "@/utils/response";
import { apiWithAuth } from "@/utils/axios";
import { formatZodError } from "@/utils/error";
import { z } from "zod";

const logger = createScopedLogger(
  "src:app:dashboard:projects:[projectId]:certificates:action.ts",
);

export type GetCertificatesByProjectIdParams = {
  projectId: string;
};

export type GetCertificatesByProjectIdSuccessResponse = z.infer<
  typeof getCertificatesByProjectIdSuccessResponseSchema
>;

export async function getCertificatesByProjectIdAction(
  data: GetCertificatesByProjectIdParams,
): Promise<ResponseJson<GetCertificatesByProjectIdSuccessResponse, {}>> {
  try {
    logger.info("get certificates by project id action", data);

    const url = `/api/v1/projects/${data.projectId}/certificates`;

    const res =
      await apiWithAuth.get<
        ResponseJson<GetCertificatesByProjectIdSuccessResponse, {}>
      >(url);

    if (!res.data.success) {
      return res.data;
    }

    const parseData = getCertificatesByProjectIdSuccessResponseSchema.safeParse(
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
    logger.error("Failed to get certificates by project id", error);

    return responseSomethingWentWrong(
      "Failed to get certificates by project id",
    );
  }
}

export type UpdateProjectVisibilityParams = {
  projectId: string;
  isPublic: boolean;
};

export type UpdateProjectVisibilitySuccessResponse = {};

export async function updateProjectVisibilityAction(
  data: UpdateProjectVisibilityParams,
): Promise<ResponseJson<UpdateProjectVisibilitySuccessResponse, {}>> {
  try {
    logger.info("update project visibility action", data);

    const url = `/api/v1/projects/${data.projectId}/visibility`;
    const formData = new FormData();
    formData.append("isPublic", String(data.isPublic));

    const res = await apiWithAuth.patchForm<
      ResponseJson<UpdateProjectVisibilitySuccessResponse, {}>
    >(url, formData);

    if (!res.data.success) {
      return res.data;
    }

    return res.data;
  } catch (error) {
    logger.error("Failed to update project visibility", error);

    return responseSomethingWentWrong("Failed to update project visibility");
  }
}
