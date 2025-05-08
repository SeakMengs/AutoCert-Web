"use client";

import { apiWithAuth } from "@/utils/axios";
import { createScopedLogger } from "@/utils/logger";
import { ResponseJson, responseSomethingWentWrong } from "@/utils/response";

const logger = createScopedLogger("src:app:components:builder:panel:action.ts");

export type GenerateCertificateById = {
  projectId: string;
};

export type GenerateCertificateByIdSuccessResponse = {};

export async function generateCertificatesByIdAction(
  data: GenerateCertificateById,
): Promise<ResponseJson<GenerateCertificateByIdSuccessResponse, {
  status: string;
}>> {
  try {
    logger.info("generate certificates by id action", data);

    const url = `/api/v1/projects/${data.projectId}/builder/generate`;

    const res =
      await apiWithAuth.post<
        ResponseJson<GenerateCertificateByIdSuccessResponse, {}>
      >(url);

    return res.data;
  } catch (error) {
    logger.error("Failed to generate certificates by id", error);

    return responseSomethingWentWrong("Failed to generate certificates by id");
  }
}
