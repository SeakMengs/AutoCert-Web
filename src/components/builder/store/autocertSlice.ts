import { StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createScopedLogger } from "@/utils/logger";
import { AutoCertStore } from "./useAutoCertStore";
import useApp from "antd/es/app/useApp";
import { generateCertificatesByIdAction } from "../action";
import { ProjectRole } from "@/types/project";
import { AnnotateStates } from "./autocertAnnotate";
import { AutoCertSettings } from "./autocertSettingSlice";
import { SaveChangesCallback } from "./autocertChangeSlice";

const logger = createScopedLogger("components:builder:store:autocertSlice");

type AutocertState = {
  projectId: string;
  roles: ProjectRole[];
};

interface AutocertActions {
  init: (params: {
    projectId: string;
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

export type AutocertSlice = AutocertState & AutocertActions;

export const createAutocertSlice: StateCreator<
  AutoCertStore,
  [["zustand/immer", never]],
  [],
  AutocertSlice
> = (set, get) => {
  const { message } = useApp();

  return {
    projectId: "",
    roles: [],

    init: async ({
      projectId,
      roles,
      annotates,
      settings,
      csvUrl,
      pdfUrl,
      saveChanges,
    }) => {
      logger.info("Initializing AutoCert store", {
        projectId,
        roles,
        annotates,
        settings,
        csvUrl,
        pdfUrl,
      });
      set((state) => {
        state.projectId = projectId;
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
        projectId: get().projectId,
      });
    },
  };
};
