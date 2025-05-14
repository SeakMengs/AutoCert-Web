import { HttpStatusCode } from "@/types/http";
import { apiWithAuth } from "@/utils/axios";
import { createScopedLogger } from "@/utils/logger";
import { responseFailed } from "@/utils/response";
import { NextRequest, NextResponse } from "next/server";

const logger = createScopedLogger(
  "app:api:proxy:projects:[projectId]:certificates:[certNumber]:thumbnail",
);

interface ParamsProps {
  params: Promise<{ projectId: string; certNumber: string }>;
}

export async function GET(request: NextRequest, { params }: ParamsProps) {
  const { projectId, certNumber } = await params;

  if (!projectId) {
    return NextResponse.json(
      responseFailed("Project id is required", {
        projectId: "Project id is required",
      }),
      {
        status: HttpStatusCode.BAD_REQUEST_400,
      },
    );
  }

  if (!certNumber) {
    return NextResponse.json(
      responseFailed("Certificate number is required", {
        certNumber: "Certificate number is required",
      }),
      {
        status: HttpStatusCode.BAD_REQUEST_400,
      },
    );
  }

  try {
    const apiRes = await apiWithAuth.get(
      `/api/v1/projects/${projectId}/certificates/${certNumber}/thumbnail`,
      { responseType: "arraybuffer" },
    );

    return new Response(apiRes.data, {
      status: apiRes.status,
      headers: {
        "Content-Type":
          apiRes.headers["content-type"] || "application/octet-stream",
      },
    });
  } catch (error: any) {
    logger.error(
      `Error fetching certificate number ${certNumber} thumbnail:`,
      error,
    );
    return NextResponse.json(
      responseFailed(
        "Error fetching certificate number ${certNumber} thumbnail:",
        {
          unknown: error.toString(),
        },
      ),
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR_500 },
    );
  }
}
