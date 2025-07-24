/**
 * AutoCert auto sync (AI Summary)
 *
 * This slice manages the synchronization of user changes with the backend.
 * It implements a robust system to handle concurrent edits and ensure data consistency.
 *
 * KEY CONCEPTS:
 *
 * 1. LOGICAL KEYS: Group changes by their logical entity (e.g., "annotate:column:update-colA")
 *    - Only the latest change per logical key is kept
 *    - Prevents sending redundant/outdated changes to the backend
 *
 * 2. UNIQUE KEYS: Each individual change gets a unique identifier using changeVersion
 *    - Allows precise tracking of which specific changes were pushed
 *    - Prevents accidentally removing newer changes during cleanup
 *
 * 3. CHANGE VERSION: Incremented for every change to detect concurrent modifications
 *    - Used to determine if new changes were added during sync operations
 *    - Ensures no changes are lost during concurrent operations
 *
 * CONCURRENT CHANGE HANDLING EXAMPLE:
 *
 * Timeline:
 * 1. User changes column A to "X" → changeVersion: 1, logicalKey: "annotate:column:update-colA"
 * 2. Sync starts, captures version 1, pushes "X" to backend
 * 3. During sync, user changes column A to "Y" → changeVersion: 2, overwrites in map
 * 4. Sync completes successfully
 * 5. System detects version changed (1 → 2), knows there are new changes
 * 6. Only removes the specific "X" change (by unique key), keeps "Y" change
 * 7. Triggers new sync to push "Y"
 *
 * This ensures the latest change always gets synced, even during concurrent operations.
 */

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
import { pushBuilderChange, PushBuilderChangeErrorKey } from "../clientAction";
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

const CHANGE_DEBOUNCE_TIME = 1.5 * SECOND;

// When the user enqueues a change, we want to wait until the user stops interacting
// before invalidate queries such that it never flickers the ui with the old state
const INTERACTION_SETTLE_TIME = 3 * SECOND;
// to make change feel natural with loading state
export const FAKE_LOADING_TIME = 0.5 * SECOND;
const messageKey = "autoCertPushChangesMessageKey";

export type AutoCertChangeState = {
  lastSync: Date | null;
  changeVersion: number; // Incremented for each change to detect concurrent modifications during sync
  changes: AutoCertChangeEvent[];
  isPushingChanges: boolean;
  changeMap: Map<
    string,
    { change: AutoCertChangeEvent; timestamp: Date; uniqueKey: string }
  >;
  isUserInteracting: boolean;
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
   * Returns a logical key for grouping changes of the same type and id.
   * This is used to ensure we only keep the latest change for each logical entity.
   */
  const getLogicalKey = (change: AutoCertChangeEvent): string => {
    switch (change.type) {
      case AutoCertChangeType.AnnotateColumnAdd:
      case AutoCertChangeType.AnnotateColumnUpdate:
      case AutoCertChangeType.AnnotateColumnRemove:
      case AutoCertChangeType.AnnotateSignatureAdd:
      case AutoCertChangeType.AnnotateSignatureUpdate:
      case AutoCertChangeType.AnnotateSignatureRemove:
      case AutoCertChangeType.AnnotateSignatureInvite:
      case AutoCertChangeType.AnnotateSignatureApprove:
      case AutoCertChangeType.AnnotateSignatureReject:
        return `${change.type}-${change.data.id}`;
      case AutoCertChangeType.SettingsUpdate:
      case AutoCertChangeType.TableUpdate:
      default:
        return change.type;
    }
  };

  /**
   * Returns a unique key for the change based on change version.
   * Uses the logical key plus version for uniqueness.
   */
  const getChangeKey = (
    change: AutoCertChangeEvent,
    version: number,
  ): string => {
    return `${getLogicalKey(change)}-${version}`;
  };

  const debouncedPushChanges = debounce(async () => {
    await get().pushChanges();
  }, CHANGE_DEBOUNCE_TIME);

  const debouncedSetUserInteractionEnd = debounce(() => {
    get().setIsUserInteracting(false);
  }, INTERACTION_SETTLE_TIME);

  const debouncedInvalidateQueries = debounce(async () => {
    // Only invalidate if user is no longer interacting and no changes are pending
    if (!get().isUserInteracting && get().changeMap.size === 0) {
      await get().invalidateQueries();
    }
  }, INTERACTION_SETTLE_TIME);

  return {
    lastSync: null,
    changes: [],
    isPushingChanges: false,
    changeMap: new Map<
      string,
      { change: AutoCertChangeEvent; timestamp: Date; uniqueKey: string }
    >(),
    isUserInteracting: false,
    changeVersion: 0,

    initChange: () => {
      get().cancelInvalidateQueries();
      set((state) => {
        state.lastSync = null;
        state.changes = [];
        state.changeMap = new Map<
          string,
          { change: AutoCertChangeEvent; timestamp: Date; uniqueKey: string }
        >();
        state.isPushingChanges = false;
        state.isUserInteracting = false;
        state.changeVersion = 0;
      });
    },

    setIsUserInteracting: (isUserInteracting) => {
      set((state) => {
        state.isUserInteracting = isUserInteracting;
      });

      if (isUserInteracting) {
        // Cancel any pending debounced actions when user starts interacting
        debouncedSetUserInteractionEnd.cancel();
        debouncedInvalidateQueries.cancel();
      } else {
        // When user stops interacting, schedule a query invalidation
        // This ensures UI is eventually consistent even if some syncs didn't trigger invalidation
        debouncedInvalidateQueries();
      }
    },

    /**
     * Enqueues a change to be synced with the backend.
     *
     * CHANGE TRACKING LOGIC:
     * We use a Map<logicalKey, change> to ensure only the latest change per logical entity is kept.
     * This prevents duplicate/redundant changes from being sent to the backend.
     *
     * CONCURRENT CHANGE HANDLING:
     * When changes are made during an ongoing sync, we need to ensure they don't get lost.
     * We increment changeVersion for every change to detect concurrent modifications.
     *
     * EXAMPLE SCENARIO:
     * 1. User changes column A value to "X"
     * 2. Sync starts, pushing "X" to backend
     * 3. While syncing, user changes column A to "Y"
     * 4. The "Y" change overwrites "X" in changeMap (correct - we want latest)
     * 5. But we track the unique key of "X" that was pushed
     * 6. After sync completes, we only remove the specific "X" change
     * 7. The "Y" change remains and triggers a new sync
     *
     * This ensures the latest change always gets synced, even during concurrent operations.
     */
    enqueueChange: (change) => {
      const nextVersion = get().changeVersion + 1;
      const logicalKey = getLogicalKey(change);
      const uniqueKey = getChangeKey(change, nextVersion);
      const timestamp = new Date();

      // Always increment version to track this change
      set((state) => {
        state.changeVersion = nextVersion;
      });

      // Store with logical key to ensure only latest change per logical entity
      get().changeMap.set(logicalKey, {
        change,
        timestamp,
        uniqueKey,
      });

      set((state) => {
        state.changes = Array.from(get().changeMap.values()).map(
          (item) => item.change,
        );
      });

      get().setIsUserInteracting(true);
      debouncedSetUserInteractionEnd();

      // Cancel any pending invalidation since we have new changes
      debouncedInvalidateQueries.cancel();

      // Only trigger push if we're not already pushing
      if (!get().isPushingChanges) {
        debouncedPushChanges();
      }
    },

    syncChangesWithBackend: pushBuilderChange,

    clearChanges: () => {
      get().changeMap.clear();
      set((state) => {
        state.changes = [];
      });
    },

    /**
     * Pushes pending changes to the backend.
     *
     * CONCURRENT SYNC PROTECTION:
     * We capture the changeVersion at the start of the sync operation.
     * If the version changes during sync, it means new changes were added.
     * We only remove the specific changes that were successfully pushed,
     * preserving any newer changes that came in during the sync.
     */
    pushChanges: async () => {
      if (get().changeMap.size === 0) return;

      // Prevent concurrent pushes
      if (get().isPushingChanges) {
        return;
      }

      // Create snapshot of current changes and their unique keys
      const currentChangeEntries = Array.from(get().changeMap.entries());
      const changesToPush = currentChangeEntries.map(
        ([key, item]) => item.change,
      );
      // Used later to remove only the pushed changes that were successfully pushed
      // This ensures we don't accidentally remove newer changes that came in during the sync
      const pushedChangeUniqueKeys = new Set(
        currentChangeEntries.map(([key, item]) => item.uniqueKey),
      );

      // Capture the version at the start of the push operation
      const versionAtStart = get().changeVersion;

      get().setIsPushingChanges(true);

      logger.debug(
        `Pushing changes (v${versionAtStart}: ${changesToPush.length} changes)`,
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
            // similar to project: errors.project but auto based on object
            ...Object.fromEntries(
              Object.entries(PushBuilderChangeErrorKey).map(([key, value]) => [
                value,
                errors[value as keyof typeof errors],
              ]),
            ),
          });

            if (specificError) {
            const s = changesToPush.length > 1 ? "s" : "";
            message.error(`Failed to sync change${s}: ${specificError}`);
            return;
            }

            const s = changesToPush.length > 1 ? "s" : "";
            message.error(`Failed to sync change${s}`);
          return;
        }

        // Check if new changes were added while we were pushing
        // If version is still the same as when we started, no new changes were added
        if (get().changeVersion === versionAtStart) {
          get().clearChanges();

          set((state) => {
            state.lastSync = moment().toDate();
          });

          // Trigger invalidation after successful sync
          debouncedInvalidateQueries();
        } else {
          // New changes were added while pushing, trigger another push
          logger.debug(
            `New changes detected, triggering another push (Current version: ${get().changeVersion}, Started version: ${versionAtStart})`,
          );

          // Clear only the changes that were just pushed successfully
          const currentChanges = new Map(get().changeMap);

          // Remove only the changes that were just pushed using their unique keys
          for (const [logicalKey, item] of currentChanges.entries()) {
            if (pushedChangeUniqueKeys.has(item.uniqueKey)) {
              currentChanges.delete(logicalKey);
            }
          }

          set((state) => {
            state.changeMap = currentChanges;
            state.changes = Array.from(currentChanges.values()).map(
              (item) => item.change,
            );
            state.lastSync = moment().toDate();
          });

          // Trigger invalidation and schedule next push
          debouncedInvalidateQueries();
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

    invalidateQueries: async () => {
      logger.info("Invalidating queries for project builder");

      await queryClient.invalidateQueries({
        queryKey: [QueryKey.ProjectBuilderById, get().project.id],
        // fetch only if the query data is being mounted in component
        refetchType: "active",
      });
    },

    cancelInvalidateQueries: async () => {
      logger.info("Cancelling pending debounced actions and queries");

      debouncedSetUserInteractionEnd.cancel();
      debouncedPushChanges.cancel();
      debouncedInvalidateQueries.cancel();

      await queryClient.cancelQueries({
        queryKey: [QueryKey.ProjectBuilderById, get().project.id],
      });
    },
  };
};
