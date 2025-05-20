import {
  AutoCertStoreProvider,
  AutoCertStoreProviderProps,
} from "@/components/builder/providers/AutoCertStoreProvider";
import { apiWithAuth } from "@/utils/axios";
import { useMemo } from "react";
import Builder, { ProjectBuilderProps } from "./builder";
import { AuthUser } from "@/auth";
import {
  SignatureAnnotateStates,
  ColumnAnnotateStates,
  AnnotateStates,
} from "@/components/builder/store/autocertAnnotate";
import { AutoCertChangeType } from "@/components/builder/store/autocertChangeSlice";
import { AutoCertSettings } from "@/components/builder/store/autocertSettingSlice";

interface ProjectBuilderWithProviderProps extends ProjectBuilderProps {
  user: AuthUser;
}

export default function ProjectBuilderWithProvider({
  user,
  project,
  roles,
}: ProjectBuilderWithProviderProps) {
  const { annot } = useMemo(() => {
    const sigAnnot: SignatureAnnotateStates = {};
    const colAnnot: ColumnAnnotateStates = {};
    const annot: AnnotateStates = {};

    if (project.signatureAnnotates) {
      for (const sig of project.signatureAnnotates) {
        sigAnnot[sig.page] = [
          ...(sigAnnot[sig.page] || []),
          {
            ...sig,
            type: "signature",
            signatureData: "",
            status: sig.status,
          },
        ];
        annot[sig.page] = [
          ...(annot[sig.page] || []),
          {
            ...sig,
            type: "signature",
            signatureData: "",
            status: sig.status,
          },
        ];
      }
    }

    if (project.columnAnnotates) {
      for (const col of project.columnAnnotates) {
        colAnnot[col.page] = [
          ...(colAnnot[col.page] || []),
          {
            ...col,
            type: "column",
          },
        ];
        annot[col.page] = [
          ...(annot[col.page] || []),
          {
            ...col,
            type: "column",
          },
        ];
      }
    }

    return { sigAnnot, colAnnot, annot };
  }, [project.signatureAnnotates, project.columnAnnotates]);

  // memoize the initial settings to avoid passing a new object reference
  // on every render
  const initialSettings = useMemo(() => {
    return {
      qrCodeEnabled: project.embedQr,
    } satisfies AutoCertSettings;
  }, [project.embedQr]);

  const contextValue = {
    user,
    project,
    annotates: annot,
    csvUrl: project.csvFileUrl,
    pdfUrl: project.templateUrl,
    roles: roles,
    settings: initialSettings,
    // TOOD: update change
    saveChanges: async (changes) => {
      console.log("saveChanges called with changes:", changes);

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
      });

      console.log("saveChanges to backend", changes);
      try {
        const res = await apiWithAuth.putForm(
          `/api/v1/projects/${project.id}/builder`,
          formData,
        );

        console.log("saveChanges res", res.data);

        if (!res.data.success) {
          return false;
        }

        return true;
      } catch (error: any) {
        console.error("Error saving changes:", error.response.data);
        // Handle error (e.g., show a notification)
        return false;
      }
    },
  } satisfies AutoCertStoreProviderProps["value"];

  return (
    <AutoCertStoreProvider value={contextValue}>
      <Builder project={project} roles={roles} />
    </AutoCertStoreProvider>
  );
}
