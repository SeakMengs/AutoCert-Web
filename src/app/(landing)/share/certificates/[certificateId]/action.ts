import { createScopedLogger } from "@/utils/logger";
import { getCertificateByIdSuccessResponseSchema } from "./schema";
import { responseFailed, ResponseJson, responseSomethingWentWrong } from "@/utils/response";
import { apiWithAuth } from "@/utils/axios";
import { z } from "zod";
import { formatZodError } from "@/utils/error";

const logger = createScopedLogger(
  "src:app:(landing):share:certificates:[certificateId]:action.ts",
);

export type GetCertificateByIdParams = {
  certificateId: string;
};

export type GetCertificateByProjectIdSuccessResponse = z.infer<
  typeof getCertificateByIdSuccessResponseSchema
>;

export async function getCertificateByProjectIdAction(
  data: GetCertificateByIdParams,
): Promise<ResponseJson<GetCertificateByProjectIdSuccessResponse, {
    certificateId: string;
    forbidden: string;
    notFound: string;
}>> {
  try {
    logger.info("get certificate by id action", data);

    const url = `/api/v1/certificates/${data.certificateId}`;

    const res =
      await apiWithAuth.get<
        ResponseJson<GetCertificateByProjectIdSuccessResponse, {}>
      >(url);

    if (!res.data.success) {
      return res.data;
    }

    const parseData = getCertificateByIdSuccessResponseSchema.safeParse(
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
    logger.error("Failed to get certificate by id", error);

    return responseSomethingWentWrong(
      "Failed to get certificate by id",
    );
  }
}
