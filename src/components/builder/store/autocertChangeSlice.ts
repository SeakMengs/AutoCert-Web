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
import moment from "moment";
import { pushBuilderChange } from "../clientAction";
import { getTranslatedErrorMessage } from "@/utils/error";
import { QueryKey } from "@/utils/react_query";

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
  AnnotateSignatureReject: "annotate:signature:reject",
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
  data: { id: string; sendMail: boolean };
};

export type AnnotateSignatureReject = {
  type: typeof AutoCertChangeType.AnnotateSignatureReject;
  data: { id: string; reason: string | undefined };
};

export type AnnotateSignatureApprove = {
  type: typeof AutoCertChangeType.AnnotateSignatureApprove;
  data: { id: string; signatureFile: File };
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
  | AnnotateSignatureReject
  | AnnotateSignatureApprove
  | SettingsUpdate
  | TableUpdate;

// When the user enqueues a change, we want to wait until the user stops interacting
// before invalidate queries such that it never flickers the ui with the old state
const INTERACTION_SETTLE_TIME = 2 * SECOND;

const CHANGE_DEBOUNCE_TIME = 1 * SECOND;
// to make change feel natural with loading state
export const FAKE_LOADING_TIME = 0.5 * SECOND;
const messageKey = "autoCertPushChangesMessageKey";

export type AutoCertChangeState = {
  lastSync: Date | null;
  pushVersion: number;
  changes: AutoCertChangeEvent[];
  isPushingChanges: boolean;
  changeMap: Map<string, AutoCertChangeEvent>;
  isUserInteracting: boolean;
  pendingInvalidation: boolean;
};

export type SyncChangesWithBackendCallback = typeof pushBuilderChange;

export interface AutoCertChangeActions {
  initChange: () => void;
  enqueueChange: (change: AutoCertChangeEvent) => void;
  clearChanges: () => void;
  pushChanges: () => Promise<void>;
  setIsPushingChanges: (isPushing: boolean) => void;
  syncChangesWithBackend: SyncChangesWithBackendCallback;
  setIsUserInteracting: (isUserInteracting: boolean) => void;
  checkAndInvalidateQueries: () => Promise<void>;
  invalidateQueries: () => Promise<void>;
  cancelInvalidateQueries: () => Promise<void>;
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

  const debouncedSetUserInteractionEnd = debounce(() => {
    get().setIsUserInteracting(false);
  }, INTERACTION_SETTLE_TIME);

  const debouncedCheckAndInvalidateQueries = debounce(async () => {
    await get().checkAndInvalidateQueries();
  }, INTERACTION_SETTLE_TIME);

  return {
    lastSync: null,
    changes: [],
    isPushingChanges: false,
    changeMap: new Map<string, AutoCertChangeEvent>(),
    isUserInteracting: false,
    pendingInvalidation: false,
    pushVersion: 0,

    initChange: () => {
      get().cancelInvalidateQueries();
      set((state) => {
        state.lastSync = null;
        state.changes = [];
        state.changeMap = new Map<string, AutoCertChangeEvent>();
        state.isPushingChanges = false;
        state.isUserInteracting = false;
        state.pendingInvalidation = false;
        state.pushVersion = 0;
      });
    },

    setIsUserInteracting: (isUserInteracting) => {
      set((state) => {
        state.isUserInteracting = isUserInteracting;
      });

      if (isUserInteracting) {
        get().cancelInvalidateQueries();
      } else {
        if (get().pendingInvalidation) {
          debouncedCheckAndInvalidateQueries();
        }
      }
    },

    enqueueChange: (change) => {
      const key = getChangeKey(change);
      get().changeMap.set(key, change);
      set((state) => {
        state.changes = Array.from(get().changeMap.values());
      });

      get().setIsUserInteracting(true);
      debouncedSetUserInteractionEnd();

      debouncedPushChanges();
    },

    syncChangesWithBackend: pushBuilderChange,

    clearChanges: () => {
      get().changeMap.clear();
      set((state) => {
        state.changes = [];
      });
    },

    pushChanges: async () => {
      if (get().changeMap.size === 0) return;

      // Prevent concurrent pushes
      if (get().isPushingChanges) {
        return;
      }

      // Create snapshot of current changes and increment version
      const changesToPush = Array.from(get().changeMap.values());
      const currentVersion = get().pushVersion + 1;

      set((state) => {
        state.pushVersion = currentVersion;
      });

      get().setIsPushingChanges(true);

      logger.debug(
        `Pushing changes (v${get().pushVersion}: ${changesToPush.length} changes)`,
      );

      try {
        if (
          typeof get().syncChangesWithBackend !== "function" ||
          !get().syncChangesWithBackend
        ) {
          throw new Error("syncChangesWithBackend function is not set");
        }

        const data = await get().syncChangesWithBackend!({
          changes: changesToPush,
          projectId: get().project.id,
        });

        if (!data.success) {
          const { errors } = data;
          const specificError = getTranslatedErrorMessage(errors, {
            events: errors.events,
            project: errors.project,
          });

          if (specificError) {
            message.error(`Failed to sync changes: ${specificError}`);
            return;
          }

          message.error("Failed to sync changes");
          return;
        }

        // Only clear changes if this is still the current version
        // (no new changes were added while we were pushing)
        // Example:
        // Time 0: Changes A,B,C → pushVersion=1 → Start push
        // Time 1: Change D added → pushVersion=2
        // Time 2: Push completes → Check version (1 ≠ 2) → Don't clear → Trigger new push
        // Time 3: New push starts with A,B,C,D → pushVersion=3 → Start push
        // Time 4: Push completes → Check version (3 = 3) → Clear all changes
        if (get().pushVersion === currentVersion) {
          get().clearChanges();
          await get().checkAndInvalidateQueries();

          set((state) => {
            state.lastSync = moment().toDate();
          });
        } else {
          // New changes were added while pushing, trigger another push
          logger.debug(
            `New changes detected, triggering another push (Current version: ${get().pushVersion}, Pushed version: ${currentVersion})`,
          );
          debouncedPushChanges();
        }
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

    checkAndInvalidateQueries: async () => {
      if (!get().isUserInteracting) {
        await get().invalidateQueries();
        set((state) => {
          state.pendingInvalidation = false;
        });
        return;
      }

      logger.debug(
        "User is interacting in the builder, deferring query invalidation",
      );
      set((state) => {
        state.pendingInvalidation = true;
      });
    },

    invalidateQueries: async () => {
      logger.info("Invalidating queries for project builder");

      await queryClient.invalidateQueries({
        queryKey: [QueryKey.ProjectBuilderById, get().project.id],
      });
    },

    cancelInvalidateQueries: async () => {
      logger.info(
        "Cancelling pending query invalidation and debounced actions",
      );

      debouncedSetUserInteractionEnd.cancel();
      debouncedCheckAndInvalidateQueries.cancel();
      debouncedPushChanges.cancel();

      set((state) => {
        state.pendingInvalidation = false;
      });

      await queryClient.cancelQueries({
        queryKey: [QueryKey.ProjectBuilderById, get().project.id],
      });
    },
  };
};
