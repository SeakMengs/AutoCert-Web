"use server";

import { getSignatureByIdAction } from "@/app/dashboard/signature-request/action";
import { SIGNATURE_AES_COOKIE_NAME, SIGNATURE_COOKIE_NAME } from "@/utils";
import { api, apiWithAuth } from "@/utils/axios";
import { decryptFileAES } from "@/utils/crypto";
import { generateAndFormatZodError } from "@/utils/error";
import { urlToFile } from "@/utils/file";
import { createScopedLogger } from "@/utils/logger";
import {
  responseFailed,
  ResponseJson,
  responseSomethingWentWrong,
} from "@/utils/response";
import { getCookie } from "@/utils/server/cookie";

const logger = createScopedLogger("src:app:components:builder:action.ts");

export type GenerateCertificateById = {
  projectId: string;
};

export type GenerateCertificateByIdSuccessResponse = {};

export async function generateCertificatesByIdAction(
  data: GenerateCertificateById,
): Promise<
  ResponseJson<
    GenerateCertificateByIdSuccessResponse,
    {
      status: string;
      noAnnotate: string;
    }
  >
> {
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