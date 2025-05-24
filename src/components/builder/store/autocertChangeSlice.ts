import { StateCreator } from "zustand";
import { createScopedLogger } from "@/utils/logger";
import { AutoCertStore } from "./useAutoCertStore";
import { SECOND } from "@/utils/time";
import debounce from "lodash.debounce";
import {
  ColumnAnnotateState,
  SignatureAnnotateState,
} from "./autocertAnnotate";
import { AutoCertSettings } from "./autocertSettingSlice";
import { App } from "antd";
import { queryClient } from "@/app/react_query";
import { QueryKey } from "@/app/dashboard/projects/[projectId]/builder/query";

const logger = createScopedLogger(
  "components:builder:store:autocertChangeSlice",
);

export const AutoCertChangeType = {
  AnnotateColumnAdd: "annotate:column:add",
  AnnotateColumnUpdate: "annotate:column:update",
  AnnotateColumnRemove: "annotate:column:remove",
  AnnotateSignatureAdd: "annotate:signature:add",
  AnnotateSignatureUpdate: "annotate:signature:update",
  AnnotateSignatureRemove: "annotate:signature:remove",
  AnnotateSignatureInvite: "annotate:signature:invite",
  AnnotateSignatureApprove: "annotate:signature:approve",
  SettingsUpdate: "settings:update",
  TableUpdate: "table:update",
} as const;

export type AutoCertChangeType =
  (typeof AutoCertChangeType)[keyof typeof AutoCertChangeType];

export type AnnotateColumnAdd = {
  type: typeof AutoCertChangeType.AnnotateColumnAdd;
  data: ColumnAnnotateState & { page: number };
};

export type AnnotateColumnUpdate = {
  type: typeof AutoCertChangeType.AnnotateColumnUpdate;
  data: ColumnAnnotateState & { page: number };
};

export type AnnotateColumnRemove = {
  type: typeof AutoCertChangeType.AnnotateColumnRemove;
  data: { id: string };
};

export type AnnotateSignatureAdd = {
  type: typeof AutoCertChangeType.AnnotateSignatureAdd;
  data: SignatureAnnotateState & { page: number };
};

export type AnnotateSignatureUpdate = {
  type: typeof AutoCertChangeType.AnnotateSignatureUpdate;
  data: SignatureAnnotateState & { page: number };
};

export type AnnotateSignatureRemove = {
  type: typeof AutoCertChangeType.AnnotateSignatureRemove;
  data: { id: string };
};

export type AnnotateSignatureInvite = {
  type: typeof AutoCertChangeType.AnnotateSignatureInvite;
  data: { id: string };
};

export type AnnotateSignatureApprove = {
  type: typeof AutoCertChangeType.AnnotateSignatureApprove;
  data: { id: string };
};

export type SettingsUpdate = {
  type: typeof AutoCertChangeType.SettingsUpdate;
  data: AutoCertSettings;
};

export type TableUpdate = {
  type: typeof AutoCertChangeType.TableUpdate;
  data: {
    csvFile: File;
  };
};

export type AutoCertChangeEvent =
  | AnnotateColumnAdd
  | AnnotateColumnUpdate
  | AnnotateColumnRemove
  | AnnotateSignatureAdd
  | AnnotateSignatureUpdate
  | AnnotateSignatureRemove
  | AnnotateSignatureInvite
  | AnnotateSignatureApprove
  | SettingsUpdate
  | TableUpdate;

// const CHANGE_DEBOUNCE_TIME = 0.5 * SECOND;
const CHANGE_DEBOUNCE_TIME = 1 * SECOND;
// to make change feel natural with loading state
export const FAKE_LOADING_TIME = 0.5 * SECOND;
const messageKey = "autoCertPushChangesMessageKey";

export type AutoCertChangeState = {
  changes: AutoCertChangeEvent[];
  isPushingChanges: boolean;
  changeMap: Map<string, AutoCertChangeEvent>;
};

export type SaveChangesCallback = (
  changes: AutoCertChangeEvent[],
) => Promise<boolean>;

export interface AutoCertChangeActions {
  initChange: (fn: SaveChangesCallback) => void;
  enqueueChange: (change: AutoCertChangeEvent) => void;
  clearChanges: () => void;
  pushChanges: () => Promise<void>;
  setIsPushingChanges: (isPushing: boolean) => void;
  saveChanges?: SaveChangesCallback;
  setSaveChanges: (fn: SaveChangesCallback) => void;
}

export type AutoCertChangeSlice = AutoCertChangeState & AutoCertChangeActions;

export const createAutoCertChangeSlice: StateCreator<
  AutoCertStore,
  [["zustand/immer", never]],
  [],
  AutoCertChangeSlice
> = (set, get) => {
  const { message } = App.useApp();

  /**
   * Returns a unique key for the change.
   * For annotate changes that have a related id, the key is "<type>-<id>".
   * For settings or other changes, the type itself is used as the key.
   */
  const getChangeKey = (change: AutoCertChangeEvent): string => {
    switch (change.type) {
      case AutoCertChangeType.AnnotateColumnAdd:
      case AutoCertChangeType.AnnotateColumnUpdate:
      case AutoCertChangeType.AnnotateColumnRemove:
      case AutoCertChangeType.AnnotateSignatureAdd:
      case AutoCertChangeType.AnnotateSignatureUpdate:
      case AutoCertChangeType.AnnotateSignatureRemove:
      case AutoCertChangeType.AnnotateSignatureInvite:
      case AutoCertChangeType.AnnotateSignatureApprove:
        // Because there can be multiple annotations with the same type, we need to use the id as part of the key to ensure uniqueness.
        return `${change.type}-${change.data.id}`;
      case AutoCertChangeType.SettingsUpdate:
      case AutoCertChangeType.TableUpdate:
      default:
        return change.type;
    }
  };

  const debouncedPushChanges = debounce(async () => {
    await get().pushChanges();
  }, CHANGE_DEBOUNCE_TIME);

  return {
    changes: [],
    isPushingChanges: false,
    changeMap: new Map<string, AutoCertChangeEvent>(),

    initChange: (fn) => {
      get().setSaveChanges(fn);
      set((state) => {
        state.changes = [];
        state.changeMap = new Map<string, AutoCertChangeEvent>();
        state.isPushingChanges = false;
      });
    },

    setSaveChanges: (fn) => {
      set((state) => {
        state.saveChanges = fn;
      });
    },

    enqueueChange: (change) => {
      const key = getChangeKey(change);
      get().changeMap.set(key, change);
      set((state) => {
        state.changes = Array.from(get().changeMap.values());
      });

      debouncedPushChanges();
    },

    clearChanges: () => {
      // since immer freezes the state, we need to create a new Map
      const newMap = new Map();
      set((state) => {
        state.changeMap = newMap;
      });
      // get().changeMap.clear();
      set((state) => {
        state.changes = [];
      });
    },

    pushChanges: async () => {
      if (get().changeMap.size === 0) return;
      get().setIsPushingChanges(true);

      message.loading({
        content: "Saving changes...",
        key: messageKey,
        duration: 0,
      });

      const batchedChanges = Array.from(get().changeMap.values());
      logger.debug("Pushing changes:", batchedChanges);

      try {
        if (typeof get().saveChanges !== "function" || !get().saveChanges) {
          throw new Error("saveChanges function is not set");
        }

        const success = (await get().saveChanges?.(batchedChanges)) ?? false;

        if (!success) {
          throw new Error("Failed to save changes");
        }

        get().clearChanges();

        queryClient.invalidateQueries({
          queryKey: [QueryKey, get().project.id],
        });

        message.success({
          content: "Changes saved successfully",
          key: messageKey,
          duration: 2,
        });
      } catch (error) {
        message.error({
          content: "Failed to save changes",
          key: messageKey,
          duration: 2,
        });

        logger.error("Error pushing changes:", error);
      } finally {
        get().setIsPushingChanges(false);
      }
    },

    setIsPushingChanges: (isPushing) => {
      set((state) => {
        state.isPushingChanges = isPushing;
      });
    },
  };
};
