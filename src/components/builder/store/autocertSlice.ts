import { StateCreator } from "zustand";
import { createScopedLogger } from "@/utils/logger";
import { AutoCertStore } from "./useAutoCertStore";
import { generateCertificatesByIdAction } from "../action";
import { ProjectRole } from "@/types/project";
import { AnnotateStates } from "./autocertAnnotate";
import { AutoCertSettings } from "./autocertSettingSlice";
import { SaveChangesCallback } from "./autocertChangeSlice";
import { AuthUser } from "@/auth";
import { z } from "zod";
import { ProjectByIdSchema } from "@/schemas/autocert_api/project";
import { App } from "antd";

// TODO: watch for project, roles change
const logger = createScopedLogger("components:builder:store:autocertSlice");

export type AutoCertState = {
  project: z.infer<typeof ProjectByIdSchema>;
  user: AuthUser;
  roles: ProjectRole[];
};

export interface AutoCertActions {
  init: (params: {
    user: AuthUser;
    project: z.infer<typeof ProjectByIdSchema>;
    roles: ProjectRole[];
    annotates: AnnotateStates;
    settings: AutoCertSettings;
    csvUrl: string;
    pdfUrl: string;
    saveChanges: SaveChangesCallback;
  }) => Promise<void>;
  setRoles: (roles: ProjectRole[]) => void;
  onGenerateCertificates: () => ReturnType<
    typeof generateCertificatesByIdAction
  >;
}

export type AutoCertSlice = AutoCertState & AutoCertActions;

export const createAutoCertSlice: StateCreator<
  AutoCertStore,
  [["zustand/immer", never]],
  [],
  AutoCertSlice
> = (set, get) => {
  const { message } = App.useApp();

  return {
    project: {} as z.infer<typeof ProjectByIdSchema>,
    roles: [],
    user: {} as AuthUser,

    init: async ({
      user,
      project,
      roles,
      annotates,
      settings,
      csvUrl,
      pdfUrl,
      saveChanges,
    }) => {
      logger.info("Initializing AutoCert store", {
        project,
        roles,
        annotates,
        settings,
        csvUrl,
        pdfUrl,
      });
      set((state) => {
        state.user = user;
        state.project = project;
        state.roles = roles;
      });
      get().initAnnotates(annotates);
      get().initSettings(settings);
      get().initPdf(pdfUrl);
      get().initChange(saveChanges);
      await get().initTable(csvUrl);
    },

    setRoles: (roles) => {
      logger.debug("Setting roles", roles);
      set((state) => {
        state.roles = roles;
      });
    },

    onGenerateCertificates: async () => {
      logger.info("Generate certificates");

      return await generateCertificatesByIdAction({
        projectId: get().project.id,
      });
    },
  };
};
