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

export type ApproveSignature = {
  projectId: string;
  signatureAnnotateId: string;
};
export type ApproveSignatureSuccessResponse = {};

export async function approveSignatureAction(data: ApproveSignature): Promise<
  ResponseJson<
    ApproveSignatureSuccessResponse,
    {
      forbbiden: string;
      status: string;
      notSignatory: string;
      signatureFile: string;
      noSignatureInCookie: string;
      failToDecrypt: string;
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

    const file = await urlToFile(
      sig.data.signature.url,
      sig.data.signature.filename,
    );
    const sigAESKey = await getCookie(SIGNATURE_AES_COOKIE_NAME);
    if (!sigAESKey) {
      logger.error("Signature AES key not found in cookie");
      return responseFailed("Signature AES key not found in cookie", {
        failToDecrypt: "Signature AES key not found",
      });
    }
    let decryptFile: File;
    try {
      decryptFile = await decryptFileAES(file, sigAESKey);
    } catch (error) {
      logger.error("Failed to decrypt signature file", error);
      return responseFailed("Failed to decrypt signature file", {
        failToDecrypt: "Failed to decrypt signature file",
      });
    }

    const form = new FormData();
    form.append("signatureFile", decryptFile);

    const res2 = await apiWithAuth.patchForm<
      ResponseJson<ApproveSignatureSuccessResponse, {}>
    >(url, form);

    return res2.data;
  } catch (error) {
    logger.error("Failed to approve signature", error);

    return responseSomethingWentWrong("Failed to approve signature");
  }
}
