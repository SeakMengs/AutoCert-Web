import { StateCreator } from "zustand";
import { createScopedLogger } from "@/utils/logger";
import { AutoCertStore } from "./useAutoCertStore";
import { generateCertificatesByIdAction } from "../action";
import { ProjectRole } from "@/types/project";
import { AnnotateStates } from "./autocertAnnotate";
import { AutoCertSettings } from "./autocertSettingSlice";
import { SyncChangesWithBackendCallback } from "./autocertChangeSlice";
import { AuthUser } from "@/auth";
import { z } from "zod";
import { ProjectByIdSchema } from "@/schemas/autocert_api/project";

// TODO: watch for project, roles change
const logger = createScopedLogger("components:builder:store:autocertSlice");

export type AutoCertState = {
  project: z.infer<typeof ProjectByIdSchema>;
  user: AuthUser;
  roles: ProjectRole[];
};

export interface AutoCertActions {
  initCount: number;
  init: (params: {
    user: AuthUser;
    project: z.infer<typeof ProjectByIdSchema>;
    roles: ProjectRole[];
    annotates: AnnotateStates;
    settings: AutoCertSettings;
    csvUrl: string;
    pdfUrl: string;
  }) => Promise<void>;
  setRoles: (roles: ProjectRole[]) => void;
  setProject: (project: z.infer<typeof ProjectByIdSchema>) => void;
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
  return {
    initCount: 0,
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
    }) => {
      logger.info(
        `Initializing AutoCert store for the ${get().initCount} time`,
        {
          project,
          roles,
          annotates,
          settings,
          csvUrl,
          pdfUrl,
        },
      );

      if (get().isUserInteracting) {
        logger.warn("User is interacting, while initialize AutoCert store");
      }

      set((state) => {
        state.user = user;
        state.project = project;
        state.roles = roles;
      });
      get().initAnnotates(annotates);
      get().initSettings(settings);

      if (get().initCount === 0) {
        get().initChange();
      } else {
        logger.info(
          "AutoCert store already initialized change, skipping change init",
        );
      }

      // Only initialize pdf once since we only need to load it once
      if (!get().pdfFileUrl) {
        get().initPdf(pdfUrl);
      }

      await get().initTable(csvUrl);

      set((state) => {
        state.initCount += 1;
      });
    },

    setProject: (project) => {
      logger.debug("Setting project", project);
      set((state) => {
        state.project = project;
      });
    },

    setRoles: (roles) => {
      logger.debug("Setting roles", roles);
      set((state) => {
        state.roles = roles;
      });
    },

    onGenerateCertificates: async () => {
      logger.info("Generate certificates");

      await get().cancelInvalidateQueries();

      return await generateCertificatesByIdAction({
        projectId: get().project.id,
      });
    },
  };
};
