import { useState, useRef } from "react";
import {
  AutoCertSettings,
  ColumnAnnotateState,
  SignatureAnnotateState,
} from "./useAutoCert";
import debounce from "lodash.debounce";
import { createScopedLogger } from "@/utils/logger";

export const AutoCertChangeType = {
  AnnotateColumnAdd: "annotate:column:add",
  AnnotateColumnUpdate: "annotate:column:update",
  AnnotateColumnRemove: "annotate:column:remove",
  AnnotateSignatureAdd: "annotate:signature:add",
  AnnotateSignatureUpdate: "annotate:signature:update",
  AnnotateSignatureRemove: "annotate:signature:remove",
  SettingsUpdate: "settings:update",
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

export type SettingsUpdate = {
  type: typeof AutoCertChangeType.SettingsUpdate;
  data: Pick<AutoCertSettings, "qrCodeEnabled">;
};

export type AutoCertChangeEvent =
  | AnnotateColumnAdd
  | AnnotateColumnUpdate
  | AnnotateColumnRemove
  | AnnotateSignatureAdd
  | AnnotateSignatureUpdate
  | AnnotateSignatureRemove
  | SettingsUpdate;

const CHANGE_DEBOUNCE_TIME = 1000; // 1 second
const logger = createScopedLogger("components:builder/hooks/useAutoCertChange");

export interface UseAutoCertChangeProps {
  saveChanges: (changes: AutoCertChangeEvent[]) => Promise<boolean>;
}

export default function useAutoCertChange({
  saveChanges,
}: UseAutoCertChangeProps) {
  const [changes, setChanges] = useState<AutoCertChangeEvent[]>([]);
  // This ensures that only the most recent change is  retained for each unique key, even if multiple changes occur within a short period.
  const changeMap = useRef(new Map<string, AutoCertChangeEvent>());
  const [isPushingChanges, setIsPushingChanges] = useState<boolean>(false);

  /**
   * Returns a unique key for the change.
   * For annotate changes that have a related id, the key is "<type>-<id>".
   * For settings or other changes, the type itself is used as the key.
   */
  const getChangeKey = (change: AutoCertChangeEvent): string => {
    switch (change.type) {
      case AutoCertChangeType.AnnotateColumnAdd:
      case AutoCertChangeType.AnnotateColumnUpdate:
        return `${change.type}-${change.data.id}`;
      case AutoCertChangeType.AnnotateColumnRemove:
        return `${change.type}-${change.data.id}`;
      case AutoCertChangeType.AnnotateSignatureAdd:
      case AutoCertChangeType.AnnotateSignatureUpdate:
        return `${change.type}-${change.data.id}`;
      case AutoCertChangeType.AnnotateSignatureRemove:
        return `${change.type}-${change.data.id}`;
      default:
        // For settings or any change without a specific id
        return change.type;
    }
  };

  // Adds a change to the batch. If a change with the same key exists, replace it so backend only receives the latest change.
  const onChange = (change: AutoCertChangeEvent) => {
    const key = getChangeKey(change);
    changeMap.current.set(key, change);
    setChanges(Array.from(changeMap.current.values()));

    debouncedPushChanges();
  };

  const clearChanges = () => {
    changeMap.current.clear();
    setChanges([]);
  };

  const pushChanges = async () => {
    if (changeMap.current.size === 0) return;
    setIsPushingChanges(true);
    const batchedChanges = Array.from(changeMap.current.values());

    logger.debug("Pushing changes:", batchedChanges);

    try {
      const success = await saveChanges(batchedChanges);

      if (!success) {
        throw new Error("Failed to save changes");
      }

      // After sending (assuming success), clear the batch.
      clearChanges();
    } catch (error) {
      logger.error("Error pushing changes:", error);
      // Optional: handle the error (retry, notify user, etc.)
    } finally {
      setIsPushingChanges(false);
    }
  };

  // Delay pushing until no changes occur for the specified period.
  const debouncedPushChanges = useRef(
    debounce(async () => {
      await pushChanges();
    }, CHANGE_DEBOUNCE_TIME),
  ).current;

  return { changes, onChange, clearChanges, isPushingChanges };
}
