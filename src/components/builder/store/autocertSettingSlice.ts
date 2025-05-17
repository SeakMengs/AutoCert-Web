import { StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createScopedLogger } from "@/utils/logger";
import { AutoCertStore } from "./useAutoCertStore";
import { AutoCertChangeType } from "./autocertChangeSlice";
import { hasPermission, ProjectPermission } from "@/auth/rbac";
import useApp from "antd/es/app/useApp";
import { SettingsToolProps } from "../panel/tool/settings/settings";

const logger = createScopedLogger(
  "components:builder:store:autocertSettingSlice",
);

export type AutoCertSettings = Pick<SettingsToolProps, "qrCodeEnabled"> & {};

export type AutocertSettingState = {
  settings: AutoCertSettings;
};

export interface AutocertSettingActions {
  initSettings: (settings: AutoCertSettings) => void;
  setSettings: (settings: AutoCertSettings) => void;
  onQrCodeEnabledChange: (enabled: boolean) => void;
}

export type AutocertSettingSlice = AutocertSettingState &
  AutocertSettingActions;

export const createAutocertSettingSlice: StateCreator<
  AutoCertStore,
  [["zustand/immer", never]],
  [],
  AutocertSettingSlice
> = (set, get) => {
  const { message } = useApp();

  return {
    settings: {
      qrCodeEnabled: false,
    },

    initSettings: (settings) => {
      logger.debug("Initializing settings", settings);
      get().setSettings(settings);
    },

    setSettings: (settings) =>
      set((state) => {
        state.settings = settings;
      }),

    onQrCodeEnabledChange: (enabled) => {
      logger.debug(`QR code enabled: ${enabled}`);

      if (!hasPermission(get().roles, [ProjectPermission.SettingsUpdate])) {
        logger.warn("Permission denied to update settings (Embed QR code)");
        message.error("You do not have permission to update settings");
        return;
      }

      get().setSettings({
        ...get().settings,
        qrCodeEnabled: enabled,
      });

      get().enqueueChange({
        type: AutoCertChangeType.SettingsUpdate,
        data: {
          qrCodeEnabled: enabled,
        },
      });
    },
  };
};
