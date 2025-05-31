"use server";

import { getSignatureByIdAction } from "@/app/dashboard/signature-request/action";
import { SIGNATURE_COOKIE_NAME } from "@/utils";
import { api, apiWithAuth } from "@/utils/axios";
import { generateAndFormatZodError } from "@/utils/error";
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

export type ApproveSignature = {
  projectId: string;
  signatureAnnotateId: string;
};
export type ApproveSignatureSuccessResponse = {};

// TODO: decrypt signature file after implementing encryption
export async function approveSignatureAction(data: ApproveSignature): Promise<
  ResponseJson<
    ApproveSignatureSuccessResponse,
    {
      forbbiden: string;
      status: string;
      notSignatory: string;
      signatureFile: string;
      noSignatureInCookie: string;
    }
  >
> {
  try {
    logger.info("approve signature action", data);

    const url = `/api/v1/projects/${data.projectId}/builder/signature/${data.signatureAnnotateId}/approve`;

    const signatureId = await getCookie(SIGNATURE_COOKIE_NAME);

    if (!signatureId) {
      logger.error("Get signature by id but id not found in cookie");
      return responseFailed(
        "Get signature by id but id not found in cookie",
        generateAndFormatZodError(
          "noSignatureInCookie",
          "Get signature by id but id not found in cookie",
        ),
      );
    }

    const sig = await getSignatureByIdAction({
      signatureId,
    });

    if (!sig.success) {
      return responseFailed(
        "Failed to get signature by id",
        generateAndFormatZodError(
          "signatureFile",
          "Failed to get signature by id",
        ),
      );
    }

    const res = await api.get(sig.data.signature.url, {
      responseType: "arraybuffer",
    });

    if (res.status !== 200) {
      return responseFailed(
        "Failed to get signature file",
        generateAndFormatZodError(
          "signatureFile",
          "Failed to get signature file",
        ),
      );
    }

    const mimeType = res.headers["content-type"] || "application/octet-stream";

    const signatureFile = new Blob([res.data], {
      type: mimeType,
    });

    const file = new File([signatureFile], sig.data.signature.filename, {
      type: mimeType,
      lastModified: Date.now(),
    });

    const form = new FormData();
    form.append("signatureFile", file);

    const res2 = await apiWithAuth.patchForm<
      ResponseJson<ApproveSignatureSuccessResponse, {}>
    >(url, form);

    return res2.data;
  } catch (error) {
    logger.error("Failed to approve signature", error);

    return responseSomethingWentWrong("Failed to approve signature");
  }
}
