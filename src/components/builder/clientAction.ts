import {
  AutoCertChangeEvent,
  AutoCertChangeType,
} from "@/components/builder/store/autocertChangeSlice";
import { apiWithAuth } from "@/utils/axios";
import { createScopedLogger } from "@/utils/logger";
import { ResponseJson, responseSomethingWentWrong } from "@/utils/response";

const logger = createScopedLogger(
  "app:compoents:builder:clientAction.ts",
);

export type PushBuilderChangeParams = {
  changes: AutoCertChangeEvent[];
  projectId: string;
};

export type PushBuilderChangeResponse = {};

export async function pushBuilderChange({
  changes,
  projectId,
}: PushBuilderChangeParams): Promise<
  ResponseJson<
    PushBuilderChangeResponse,
    {
      events: string;
    }
  >
> {
  try {
    logger.info("push builder change (client side)", { changes, projectId });
    const formData = new FormData();

    // TODO: Optimzie this
    // Prepare an array to include in the form's "events" field.
    // Here we make a deep copy of changes, but remove the csvFile property
    // from TableUpdate events to avoid issues with JSON.stringify.
    const changesWithoutFiles = changes.map((change) => {
      if (change.type === AutoCertChangeType.TableUpdate) {
        return {
          ...change,
          data: {
            ...change.data,
            csvFile: undefined,
          },
        };
      }

      if (
        change.type === AutoCertChangeType.AnnotateSignatureApprove &&
        change.data.signatureFile
      ) {
        return {
          ...change,
          data: {
            ...change.data,
            signatureFile: undefined,
          },
        };
      }
      return change;
    });

    // Append the events field as JSON string.
    formData.append("events", JSON.stringify(changesWithoutFiles));

    changes.forEach((change, index) => {
      if (
        change.type === AutoCertChangeType.TableUpdate &&
        change.data.csvFile
      ) {
        formData.append("csvFile", change.data.csvFile);
      }

      if (
        change.type === AutoCertChangeType.AnnotateSignatureApprove &&
        change.data.signatureFile
      ) {
        formData.append(
          `signature_approve_file_${change.data.id}`,
          change.data.signatureFile,
        );
      }
    });

    //  TODO: remove this console log
    console.log("saveChanges to backend", changes);
    const res = await apiWithAuth.patchForm(
      `/api/v1/projects/${projectId}/builder`,
      formData,
    );

    console.log("saveChanges res", res.data);

    if (!res.data.success) {
      logger.error("Failed to push builder changes", res.data.errors);
      return res.data;
    }

    return res.data;
  } catch (error: any) {
    logger.error("Failed to push builder changes", error);
    return responseSomethingWentWrong("Failed to push builder changes");
  }
}
