import {
  AutoCertStoreProvider,
  AutoCertStoreProviderProps,
} from "@/components/builder/providers/AutoCertStoreProvider";
import { useMemo } from "react";
import Builder, { ProjectBuilderProps } from "./builder";
import { AuthUser } from "@/auth";
import {
  SignatureAnnotateStates,
  ColumnAnnotateStates,
  AnnotateStates,
  SignatureAnnotateState,
  ColumnAnnotateState,
} from "@/components/builder/store/autocertAnnotate";
import { AutoCertSettings } from "@/components/builder/store/autocertSettingSlice";

interface ProjectBuilderWithProviderProps
  extends Omit<ProjectBuilderProps, "contextValue"> {
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
        const sigWithType = {
          ...sig,
          type: "signature",
        } satisfies SignatureAnnotateState;
        sigAnnot[sig.page] = [...(sigAnnot[sig.page] || []), sigWithType];
        annot[sig.page] = [...(annot[sig.page] || []), sigWithType];
      }
    }

    if (project.columnAnnotates) {
      for (const col of project.columnAnnotates) {
        const colWithType = {
          ...col,
          type: "column",
        } satisfies ColumnAnnotateState;
        colAnnot[col.page] = [...(colAnnot[col.page] || []), colWithType];
        annot[col.page] = [...(annot[col.page] || []), colWithType];
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

  const contextValue = useMemo(() => ({
    user,
    project,
    annotates: annot,
    csvUrl: project.csvFileUrl,
    pdfUrl: project.templateUrl,
    roles: roles,
    settings: initialSettings,
  } satisfies AutoCertStoreProviderProps["value"]), [user, project, annot, roles, initialSettings]);

  return (
    <AutoCertStoreProvider value={contextValue}>
      <Builder project={project} roles={roles} contextValue={contextValue} />
    </AutoCertStoreProvider>
  );
}
