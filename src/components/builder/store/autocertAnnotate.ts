import { createScopedLogger } from "@/utils/logger";
import {
  AnnotateColor,
  BaseAnnotateLock,
  BaseAnnotateProps,
} from "../annotate/BaseAnnotate";
import {
  BaseColumnAnnotate,
  ColumnAnnotateLock,
} from "../annotate/ColumnAnnotate";
import {
  BaseSignatureAnnotate,
  SignatureAnnotateLock,
} from "../annotate/SignatureAnnotate";
import { ProjectRole, ProjectStatus } from "@/types/project";
import { nanoid } from "nanoid";
import {
  ColumnAnnotateFormSchema,
  FontOptions,
} from "../panel/tool/column/ColumnTool";
import { SignatureAnnotateFormSchema } from "../panel/tool/signature/SignatureTool";
import { AutoCertTableColumn } from "../panel/table/AutoCertTable";
import { StateCreator } from "zustand";
import { AutoCertStore } from "./useAutoCertStore";
import { hasPermission, hasRole, ProjectPermission } from "@/auth/rbac";
import { App } from "antd";
import { AutoCertChangeType } from "./autocertChangeSlice";
import { IS_PRODUCTION } from "@/utils/env";
import {
  AnnotateFontColor,
  AnnotateFontSize,
  FontWeight,
  SignatoryStatus,
} from "../annotate/util";
import { getSignatureByIdAction } from "@/app/dashboard/signature-request/action";
import { urlToFile } from "@/utils/file";
import { getCookie } from "@/utils/server/cookie";
import { SIGNATURE_AES_COOKIE_NAME, SIGNATURE_COOKIE_NAME } from "@/utils";
import { decryptFileAES } from "@/utils/crypto";

// TODO: Check annotate lock state in each mutation

const logger = createScopedLogger(
  "components:builder:store:autocertAnnotateSlice",
);

const DefaultBaseAnnotateLock: BaseAnnotateLock = {
  resize: false,
  drag: false,
  update: false,
  remove: false,
  disable: false,
  showBg: true,
};

const DefaultColumnLock: ColumnAnnotateLock = {
  ...DefaultBaseAnnotateLock,
};

const DefaultSignatureLock: SignatureAnnotateLock = {
  ...DefaultBaseAnnotateLock,
  invite: false,
  sign: false,
};

export type AnnotateLock = ColumnAnnotateLock | SignatureAnnotateLock;

export const AnnotateType = {
  Column: "column",
  Signature: "signature",
} as const;
export type AnnotateType = (typeof AnnotateType)[keyof typeof AnnotateType];

type BaseAnnotateState = Pick<
  BaseAnnotateProps,
  "id" | "x" | "y" | "width" | "height" | "color"
> & {
  type: AnnotateType;
};

export type ColumnAnnotateState = BaseAnnotateState &
  BaseColumnAnnotate & {
    type: "column";
  };

// page
export type ColumnAnnotateStates = Record<number, ColumnAnnotateState[]>;

export type SignatureAnnotateState = BaseAnnotateState &
  BaseSignatureAnnotate & {
    type: "signature";
  };

// page
export type SignatureAnnotateStates = Record<number, SignatureAnnotateState[]>;

export type AnnotateState = ColumnAnnotateState | SignatureAnnotateState;

// Each page has a list of annotates
export type AnnotateStates = Record<number, AnnotateState[]>;

const ColumnAnnotateWidth = 150;
const ColumnAnnotateHeight = 40;

const SignatureAnnotateWidth = 140;
const SignatureAnnotateHeight = 90;

const newColumnAnnotate = (): ColumnAnnotateState => {
  return {
    id: nanoid(),
    type: AnnotateType.Column,
    x: 0,
    y: 0,
    value: "",
    width: ColumnAnnotateWidth,
    height: ColumnAnnotateHeight,
    fontName: FontOptions[0].value,
    fontSize: AnnotateFontSize,
    fontWeight: FontWeight.Regular,
    fontColor: AnnotateFontColor,
    color: AnnotateColor,
    textFitRectBox: true,
  };
};

const newSignatureAnnotate = (): SignatureAnnotateState => {
  return {
    id: nanoid(),
    type: AnnotateType.Signature,
    x: 0,
    y: 0,
    width: SignatureAnnotateWidth,
    height: SignatureAnnotateHeight,
    signatureUrl: "",
    email: "",
    status: SignatoryStatus.NotInvited,
    color: AnnotateColor,
  };
};

// Return based on annot type, if not match, return BaseAnnotateLock
type GetAnnotateLockReturn<T extends AnnotateState> =
  T extends ColumnAnnotateState
    ? ColumnAnnotateLock
    : T extends SignatureAnnotateState
      ? SignatureAnnotateLock
      : BaseAnnotateLock;

export type AutocertAnnotateSliceState = {
  annotates: AnnotateStates;
  columnAnnotates: ColumnAnnotateStates; // Derived from annotates
  signatureAnnotates: SignatureAnnotateStates; // Derived from annotates
  signaturesSigned: number;
  signatureCount: number;
  selectedAnnotateId?: string;
};

export interface AutocertAnnotateSliceActions {
  initAnnotates: (annotates: AnnotateStates) => void;

  setAnnotates: (annotates: AnnotateStates) => void;

  setSelectedAnnotateId: (id?: string) => void;

  hasAtLeastOneAnnotate: () => boolean;

  addColumnAnnotate: (page: number, data: ColumnAnnotateFormSchema) => void;
  updateColumnAnnotate: (id: string, data: ColumnAnnotateFormSchema) => void;
  removeColumnAnnotate: (id: string) => void;

  addSignatureAnnotate: (
    page: number,
    data: SignatureAnnotateFormSchema,
  ) => void;
  removeSignatureAnnotate: (id: string) => void;
  inviteSignatureAnnotate: (id: string) => void;
  rejectSignatureAnnotate: (id: string, reason?: string) => void;
  signSignatureAnnotate: (id: string) => Promise<void>;

  onAnnotateDragStart: BaseAnnotateProps["onDragStart"];
  onAnnotateDragStop: BaseAnnotateProps["onDragStop"];

  onAnnotateResizeStart: BaseAnnotateProps["onResizeStart"];
  onAnnotateResizeStop: BaseAnnotateProps["onResizeStop"];

  replaceAnnotatesColumnValue: (oldTitle: string, newTitle: string) => void;
  removeUnnecessaryAnnotates: (tableColumns: AutoCertTableColumn[]) => void;

  _updateDerivedAnnotates: () => void;
  findAnnotateById: (
    id: string,
  ) => { annotate: AnnotateState; page: number } | undefined;
  isSignatoryToAnnotate: (annot: SignatureAnnotateState) => boolean;
  getAnnotateLockState: <T extends AnnotateState>(
    annot: T,
  ) => GetAnnotateLockReturn<T>;
}

export type AutocertAnnotateSlice = AutocertAnnotateSliceState &
  AutocertAnnotateSliceActions;

export const createAutoCertAnnotateSlice: StateCreator<
  AutoCertStore,
  [["zustand/immer", never]],
  [],
  AutocertAnnotateSlice
> = (set, get) => {
  const { message } = App.useApp();

  return {
    annotates: {},
    columnAnnotates: {},
    signatureAnnotates: {},
    selectedAnnotateId: undefined,
    signaturesSigned: 0,
    signatureCount: 0,

    initAnnotates: (annotates) => {
      logger.debug("Initializing annotates");
      get().setAnnotates(annotates);
    },

    setAnnotates: (newAnnotates) => {
      set((state) => {
        state.annotates = newAnnotates;
      });
      get()._updateDerivedAnnotates();
    },

    findAnnotateById: (id) => {
      const pages = Object.keys(get().annotates);

      for (const page of pages) {
        const annotate = get().annotates[Number(page)].find((a) => a.id === id);
        if (annotate) {
          return {
            annotate,
            page: Number(page),
          };
        }
      }

      return undefined;
    },

    _updateDerivedAnnotates: () => {
      const columns: ColumnAnnotateStates = {};
      const signatures: SignatureAnnotateStates = {};
      const pages = Object.keys(get().annotates);
      let signaturesSigned = 0;
      let signatureCount = 0;
      let isSignatory = false;

      pages.forEach((p) => {
        get().annotates[Number(p)].forEach((a) => {
          switch (a.type) {
            case AnnotateType.Column:
              columns[Number(p)] = [...(columns[Number(p)] || []), a];
              break;
            case AnnotateType.Signature:
              if (
                a.status !== SignatoryStatus.NotInvited &&
                a.email.toLowerCase() === get().user.email.toLowerCase()
              ) {
                isSignatory = true;
              }

              if (a.status === SignatoryStatus.Signed) {
                signaturesSigned += 1;
              }

              signatures[Number(p)] = [...(signatures[Number(p)] || []), a];
              signatureCount += 1;
              break;
          }
        });
      });

      set((state) => {
        state.columnAnnotates = columns;
        state.signatureAnnotates = signatures;
        state.signaturesSigned = signaturesSigned;
        state.signatureCount = signatureCount;
      });

      let roles = [...(get().roles || [])];
      if (isSignatory) {
        if (!roles.includes(ProjectRole.Signatory)) {
          roles.push(ProjectRole.Signatory);
        }
      } else {
        roles = roles.filter((r) => r !== ProjectRole.Signatory);
      }
      get().setRoles(roles);
    },

    setSelectedAnnotateId: (id) => {
      // logger.debug(`Select annotation event: ${id}`);

      if (!id) {
        logger.debug("Select annotation event: undefined (clear selection)");
        set((state) => {
          state.selectedAnnotateId = undefined;
        });
        return;
      }

      if (id === get().selectedAnnotateId) {
        logger.debug(`Select annotation event: ${id} (skip state update)`);
        return;
      }

      const existingAnnotate = get().findAnnotateById(id);
      if (!existingAnnotate) {
        logger.warn(`Select annotation event: ${id} (not found)`);
        return;
      }

      switch (existingAnnotate.annotate.type) {
        case AnnotateType.Column:
          const colLock = get().getAnnotateLockState(existingAnnotate.annotate);
          if (colLock.disable) {
            logger.warn(
              `Select annotation event: ${id}, dismiss (disable: ${colLock.disable})`,
            );
            return;
          }
          break;
        case AnnotateType.Signature:
          const isSignatory = get().isSignatoryToAnnotate(
            existingAnnotate.annotate,
          );
          const isRequestor = hasRole(get().roles, ProjectRole.Requestor);
          const sigLock = get().getAnnotateLockState(existingAnnotate.annotate);
          if ((!isRequestor && !isSignatory) || sigLock.disable) {
            logger.warn(
              `Select annotation event: ${id}, dismiss (disable: ${sigLock.disable}, isRequestor: ${isRequestor}, isSignatory: ${isSignatory})`,
            );
            return;
          }
          break;
        default:
          logger.warn(`Select annotation event: ${id} (unknown type)`);
          return;
      }

      set((state) => {
        state.selectedAnnotateId = id;
      });
    },

    hasAtLeastOneAnnotate: () => {
      const { annotates } = get();
      const pages = Object.keys(annotates);
      for (const page of pages) {
        if (annotates[Number(page)].length > 0) {
          return true;
        }
      }
      return false;
    },

    addColumnAnnotate: (page, data) => {
      logger.debug("Adding column annotate");

      if (!hasPermission(get().roles, [ProjectPermission.AnnotateColumnAdd])) {
        logger.warn("Permission denied to add column annotate");
        message.error("You do not have permission to add column annotate");
        return;
      }

      let newCA = newColumnAnnotate();
      newCA = {
        ...newCA,
        fontName: data.fontName,
        fontColor: data.fontColor,
        value: data.value,
        color: data.color,
        textFitRectBox: true,
      } satisfies ColumnAnnotateState;

      get().setAnnotates({
        ...get().annotates,
        [page]: [...(get().annotates[page] || []), newCA],
      });

      get().setSelectedAnnotateId(newCA.id);

      get().enqueueChange({
        type: AutoCertChangeType.AnnotateColumnAdd,
        data: {
          ...newCA,
          page: page,
        },
      });
    },

    updateColumnAnnotate: (id, data) => {
      logger.debug(`Update column annotate with id ${id}`);

      if (
        !hasPermission(get().roles, [ProjectPermission.AnnotateColumnUpdate])
      ) {
        logger.warn("Permission denied to update column annotate");
        message.error("You do not have permission to update column annotate");
        return;
      }

      const existingAnnotate = get().findAnnotateById(id);
      if (!existingAnnotate) {
        logger.warn(`Column annotate with id ${id} not found`);
        return;
      }

      const { annotate, page } = existingAnnotate;
      if (annotate.type !== AnnotateType.Column) {
        logger.warn(
          `Column annotate with id ${id} found, but not a column annotate`,
        );
        return;
      }

      const updatedAnnotate = {
        ...annotate,
        fontName: data.fontName,
        fontColor: data.fontColor,
        value: data.value,
        color: data.color,
        textFitRectBox: true,
      } satisfies ColumnAnnotateState;

      get().setAnnotates({
        ...get().annotates,
        [page]: get().annotates[page].map((a) =>
          a.id === id ? updatedAnnotate : a,
        ),
      });

      get().setSelectedAnnotateId(updatedAnnotate.id);

      get().enqueueChange({
        type: AutoCertChangeType.AnnotateColumnUpdate,
        data: {
          ...updatedAnnotate,
          page: page,
        },
      });
    },

    removeColumnAnnotate: (id) => {
      logger.debug(`Remove column annotate with id ${id}`);

      if (
        !hasPermission(get().roles, [ProjectPermission.AnnotateColumnRemove])
      ) {
        logger.warn("Permission denied to remove column annotate");
        message.error("You do not have permission to remove column annotate");
        return;
      }

      const existingAnnotate = get().findAnnotateById(id);
      if (!existingAnnotate) {
        logger.warn(`Column annotate with id ${id} not found`);
        return;
      }

      const { page, annotate } = existingAnnotate;
      if (annotate.type !== AnnotateType.Column) {
        logger.warn(
          `Column annotate with id ${id} found, but not a column annotate`,
        );
        return;
      }

      get().setAnnotates({
        ...get().annotates,
        [page]: get().annotates[page].filter((a) => a.id !== id),
      });

      get().setSelectedAnnotateId(undefined);

      get().enqueueChange({
        type: AutoCertChangeType.AnnotateColumnRemove,
        data: {
          id: id,
        },
      });
    },

    addSignatureAnnotate: (page, data) => {
      logger.debug("Adding signature annotate");

      if (
        !hasPermission(get().roles, [ProjectPermission.AnnotateSignatureAdd])
      ) {
        logger.warn("Permission denied to add signature annotate");
        message.error("You do not have permission to add signature annotate");
        return;
      }

      let newSA = newSignatureAnnotate();
      newSA = {
        ...newSA,
        email: data.email,
        color: data.color,
        status: SignatoryStatus.NotInvited,
      } satisfies SignatureAnnotateState;

      get().setAnnotates({
        ...get().annotates,
        [page]: [...(get().annotates[page] || []), newSA],
      });

      get().setSelectedAnnotateId(newSA.id);

      get().enqueueChange({
        type: AutoCertChangeType.AnnotateSignatureAdd,
        data: {
          ...newSA,
          page: page,
        },
      });
    },

    removeSignatureAnnotate: (id) => {
      logger.debug(`Remove signature annotate with id ${id}`);

      if (
        !hasPermission(get().roles, [ProjectPermission.AnnotateSignatureRemove])
      ) {
        logger.warn("Permission denied to remove signature annotate");
        message.error(
          "You do not have permission to remove signature annotate",
        );
        return;
      }

      const existingAnnotate = get().findAnnotateById(id);
      if (!existingAnnotate) {
        logger.warn(`Signature annotate with id ${id} not found`);
        return;
      }

      const { page, annotate } = existingAnnotate;

      if (annotate.type !== AnnotateType.Signature) {
        logger.warn(
          `Signature annotate with id ${id} found, but not a signature`,
        );
        return;
      }

      get().setAnnotates({
        ...get().annotates,
        [page]: get().annotates[page].filter((a) => a.id !== id),
      });

      get().setSelectedAnnotateId(undefined);

      get().enqueueChange({
        type: AutoCertChangeType.AnnotateSignatureRemove,
        data: {
          id: id,
        },
      });
    },

    inviteSignatureAnnotate: (id) => {
      logger.debug(`Invite signature annotate with id ${id}`);

      if (
        !hasPermission(get().roles, [ProjectPermission.AnnotateSignatureInvite])
      ) {
        logger.warn("Permission denied to invite signature annotate");
        message.error("You do not have permission to invite signature");
        return;
      }

      const existingAnnotate = get().findAnnotateById(id);
      if (!existingAnnotate) {
        logger.warn(`Signature annotate with id ${id} not found`);
        return;
      }
      const { annotate, page } = existingAnnotate;

      if (annotate.type !== AnnotateType.Signature) {
        logger.warn(
          `Signature annotate with id ${id} found, but not a signature`,
        );
        return;
      }

      get().setAnnotates({
        ...get().annotates,
        [page]: get().annotates[page].map((a) =>
          a.id === id ? { ...a, status: SignatoryStatus.Invited } : a,
        ),
      });

      get().enqueueChange({
        type: AutoCertChangeType.AnnotateSignatureInvite,
        data: {
          id: id,
          // TIP: if test smtp in dev, set this to true
          sendMail: IS_PRODUCTION,
        },
      });
    },

    rejectSignatureAnnotate: (id, reason) => {
      logger.debug(
        `Reject signature annotate with id: ${id} with reason: ${reason}`,
      );

      if (
        !hasPermission(get().roles, [ProjectPermission.AnnotateSignatureReject])
      ) {
        logger.warn("Permission denied to reject signature annotate");
        message.error("You do not have permission to reject signature");
        return;
      }

      const existingAnnotate = get().findAnnotateById(id);
      if (!existingAnnotate) {
        logger.warn(`Signature annotate with id ${id} not found`);
        return;
      }

      const { annotate, page } = existingAnnotate;
      if (annotate.type !== AnnotateType.Signature) {
        logger.warn(
          `Signature annotate with id ${id} found, but not a signature`,
        );
        return;
      }

      if (annotate.status !== SignatoryStatus.Invited) {
        logger.warn(`Signature annotate with id ${id} found, but not invited`);
        return;
      }

      get().setAnnotates({
        ...get().annotates,
        [page]: get().annotates[page].map((a) =>
          a.id === id
            ? { ...a, status: SignatoryStatus.Rejected, reason: reason }
            : a,
        ),
      });

      get().enqueueChange({
        type: AutoCertChangeType.AnnotateSignatureReject,
        data: {
          id: id,
          reason: reason,
        },
      });
    },

    signSignatureAnnotate: async (id) => {
      logger.debug(`Sign signature annotate with id ${id}`);

      if (
        !hasPermission(get().roles, [
          ProjectPermission.AnnotateSignatureApprove,
        ])
      ) {
        logger.warn("Permission denied to sign signature annotate");
        message.error("You do not have permission to sign signature");
        return;
      }

      const existingAnnotate = get().findAnnotateById(id);
      if (!existingAnnotate) {
        logger.warn(`Signature annotate with id ${id} not found`);
        return;
      }

      const { annotate, page } = existingAnnotate;
      if (annotate.type !== AnnotateType.Signature) {
        logger.warn(
          `Signature annotate with id ${id} found, but not a signature`,
        );
        return;
      }

      if (annotate.status !== SignatoryStatus.Invited) {
        logger.warn(`Signature annotate with id ${id} found, but not invited`);
        return;
      }

      const signatureId = await getCookie(SIGNATURE_COOKIE_NAME);

      if (!signatureId) {
        logger.error("Get signature by id but id not found in cookie");
        message.error(
          "You do not have a saved signature to approve signature, please add one first in signature request page",
        );
        return;
      }

      const sig = await getSignatureByIdAction({
        signatureId,
      });

      if (!sig.success) {
        logger.error("Failed to get signature by id: ", sig.errors);
        message.error(`Failed to get your saved signature`);
        return;
      }

      const file = await urlToFile(
        sig.data.signature.url,
        sig.data.signature.filename,
      );
      const sigAESKey = await getCookie(SIGNATURE_AES_COOKIE_NAME);
      if (!sigAESKey) {
        logger.error("Signature AES key not found in cookie");
        message.error("Signature AES key not found");
        return;
      }
      let decryptFile: File;
      try {
        decryptFile = await decryptFileAES(file, sigAESKey);
      } catch (error) {
        logger.error("Failed to decrypt signature file", error);
        message.error("Failed to decrypt signature file");
        return;
      }

      if (!decryptFile) {
        logger.error("Decrypted signature file is empty");
        message.error("Decrypted signature file is empty");
        return;
      }

      get().setAnnotates({
        ...get().annotates,
        [page]: get().annotates[page].map((a) =>
          a.id === id
            ? ({
                ...a,
                status: SignatoryStatus.Signed,
                signatureUrl: URL.createObjectURL(decryptFile),
              } as SignatureAnnotateState)
            : a,
        ),
      });

      get().enqueueChange({
        type: AutoCertChangeType.AnnotateSignatureApprove,
        data: {
          id: id,
          signatureFile: decryptFile,
        },
      });
    },

    onAnnotateResizeStart: (id, e, rect, pageNumber) => {
      get().setIsUserInteracting(true);
    },

    onAnnotateResizeStop: (id, e, rect, pageNumber) => {
      logger.debug(
        `Resize annotation, w:${rect.width}, h:${rect.height},  Position: x:${rect.x}, y:${rect.y}, `,
      );

      if (
        !hasPermission(get().roles, [
          ProjectPermission.AnnotateColumnUpdate,
          ProjectPermission.AnnotateSignatureUpdate,
        ])
      ) {
        logger.warn("Permission denied to resize annotate");
        message.error("You do not have permission to resize annotate");
        return;
      }

      const existingAnnotate = get().findAnnotateById(id);
      if (!existingAnnotate) {
        logger.warn(`Annotate with id ${id} not found`);
        return;
      }

      const { annotate, page } = existingAnnotate;

      const updatedAnnotate = {
        ...annotate,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      } satisfies AnnotateState;

      get().setAnnotates({
        ...get().annotates,
        [page]: get().annotates[page].map((a) =>
          a.id === id ? updatedAnnotate : a,
        ),
      });

      switch (updatedAnnotate.type) {
        case AnnotateType.Column:
          get().enqueueChange({
            type: AutoCertChangeType.AnnotateColumnUpdate,
            data: {
              ...updatedAnnotate,
              page: page,
            },
          });
          break;
        case AnnotateType.Signature:
          get().enqueueChange({
            type: AutoCertChangeType.AnnotateSignatureUpdate,
            data: {
              ...updatedAnnotate,
              page: page,
            },
          });
          break;
      }
    },

    onAnnotateDragStart: (id, e, position, pageNumber) => {
      get().setIsUserInteracting(true);
    },

    onAnnotateDragStop: (id, e, position, pageNumber) => {
      logger.debug(
        `Drag annotation, Position: x:${position.x}, y:${position.y}`,
      );

      if (
        !hasPermission(get().roles, [
          ProjectPermission.AnnotateColumnUpdate,
          ProjectPermission.AnnotateSignatureUpdate,
        ])
      ) {
        logger.warn("Permission denied to drag annotate");
        message.error("You do not have permission to drag annotate");
        return;
      }

      const existingAnnotate = get().findAnnotateById(id);
      if (!existingAnnotate) {
        logger.warn(`Annotate with id ${id} not found`);
        return;
      }

      const { annotate, page } = existingAnnotate;

      const updatedAnnotate = {
        ...annotate,
        x: position.x,
        y: position.y,
      } satisfies AnnotateState;

      get().setAnnotates({
        ...get().annotates,
        [page]: get().annotates[page].map((a) =>
          a.id === id ? updatedAnnotate : a,
        ),
      });

      switch (updatedAnnotate.type) {
        case AnnotateType.Column:
          get().enqueueChange({
            type: AutoCertChangeType.AnnotateColumnUpdate,
            data: {
              ...updatedAnnotate,
              page: page,
            },
          });
          break;
        case AnnotateType.Signature:
          get().enqueueChange({
            type: AutoCertChangeType.AnnotateSignatureUpdate,
            data: {
              ...updatedAnnotate,
              page: page,
            },
          });
          break;
      }
    },

    isSignatoryToAnnotate: (annot: SignatureAnnotateState) => {
      const { user } = get();
      return user.email.toLowerCase() === annot.email.toLowerCase();
    },

    getAnnotateLockState: (annot) => {
      const { roles = [], project, user } = get();

      const noRoles = !Array.isArray(roles) || roles.length === 0;
      const isRequestor = hasRole(roles, ProjectRole.Requestor);
      const isSignatory =
        annot.type === AnnotateType.Signature &&
        get().isSignatoryToAnnotate(annot);
      const isDraft = project.status === ProjectStatus.Draft;

      const disableAll = <T = BaseAnnotateLock>(lock: T): T => {
        // logger.debug(`Disabling all annotate actions`);

        return {
          ...lock,
          showBg: false,
          disable: true,
        };
      };

      switch (annot.type) {
        case AnnotateType.Column: {
          let colLock: ColumnAnnotateLock = { ...DefaultColumnLock };

          if (noRoles || !isDraft || !isRequestor) {
            return disableAll(colLock) as GetAnnotateLockReturn<typeof annot>;
          }

          if (hasPermission(roles, [ProjectPermission.AnnotateColumnUpdate])) {
            colLock = {
              ...colLock,
              resize: true,
              drag: true,
              update: true,
              showBg: true,
              disable: false,
            };
          }

          if (hasPermission(roles, [ProjectPermission.AnnotateColumnRemove])) {
            colLock = {
              ...colLock,
              remove: true,
              showBg: true,
              disable: false,
            };
          }

          return colLock as GetAnnotateLockReturn<typeof annot>;
        }
        case AnnotateType.Signature: {
          let sigLock: SignatureAnnotateLock = { ...DefaultSignatureLock };

          if (noRoles || !isDraft) {
            return disableAll(sigLock) as GetAnnotateLockReturn<typeof annot>;
          }

          if (
            hasPermission(roles, [ProjectPermission.AnnotateSignatureUpdate])
          ) {
            sigLock = {
              ...sigLock,
              resize: true,
              drag: true,
              update: true,
              showBg: true,
              disable: false,
            };

            if (
              annot.status === SignatoryStatus.NotInvited &&
              hasPermission(roles, [ProjectPermission.AnnotateSignatureInvite])
            ) {
              sigLock = {
                ...sigLock,
                invite: true,
                showBg: true,
                disable: false,
              };
            }
          }

          if (
            hasPermission(roles, [ProjectPermission.AnnotateSignatureRemove])
          ) {
            sigLock = {
              ...sigLock,
              remove: true,
              showBg: true,
              disable: false,
            };
          }

          if (
            annot.status === SignatoryStatus.Invited &&
            isSignatory &&
            hasPermission(roles, [ProjectPermission.AnnotateSignatureApprove])
          ) {
            sigLock = {
              ...sigLock,
              sign: true,
              showBg: true,
              disable: false,
            };
          } else {
            // If the user is not the requestor, disable the annot which hide annot bg and border
            if (!isRequestor) {
              disableAll(sigLock);
            }
          }

          if (annot.status === SignatoryStatus.Signed) {
            sigLock = {
              ...DefaultSignatureLock,
              drag: false,
              resize: false,
              update: false,
              // intentionally leave remove because we allow removing signed signatures
              remove: sigLock.remove,
              showBg: isRequestor || isSignatory,
              disable: false,
            };
          }

          return sigLock as GetAnnotateLockReturn<typeof annot>;
        }

        default:
          logger.warn(
            `Annotate lock: unknown annotate type: ${String((annot as any).type)}`,
          );
          return {
            ...DefaultBaseAnnotateLock,
            disable: true,
          } as GetAnnotateLockReturn<typeof annot>;
      }
    },

    replaceAnnotatesColumnValue: (oldTitle, newTitle) => {
      logger.debug(
        `Replace annotates column value: ${oldTitle} -> ${newTitle}`,
      );

      if (
        !hasPermission(get().roles, [ProjectPermission.AnnotateColumnUpdate])
      ) {
        logger.warn("Permission denied to replace column value");
        message.error("You do not have permission to update annotate");
        return;
      }

      const pages = Object.keys(get().annotates);
      const newAnnotates = { ...get().annotates };

      // update value of annotate column with value of oldTitle to newTitle
      pages.forEach((p) => {
        const pageAnnotates = newAnnotates[Number(p)];
        pageAnnotates.forEach((a) => {
          if (a.type === AnnotateType.Column && a.value === oldTitle) {
            a.value = newTitle;

            get().enqueueChange({
              type: AutoCertChangeType.AnnotateColumnUpdate,
              data: {
                ...a,
                page: Number(p),
              },
            });
          }
        });
      });

      get().setAnnotates(newAnnotates);
    },

    removeUnnecessaryAnnotates: (columns) => {
      logger.debug("Remove unnecessary annotates");

      if (
        !hasPermission(get().roles, [ProjectPermission.AnnotateColumnRemove])
      ) {
        logger.warn("Permission denied to remove unnecessary annotates");
        // message.error("You do not have permission to remove annotate");
        return;
      }

      const tableTitles = columns.map((c) => c.title);
      const pages = Object.keys(get().annotates);
      const newAnnotates = { ...get().annotates };

      pages.forEach((p) => {
        const updatedPageAnnotates = newAnnotates[Number(p)].filter((a) => {
          const shouldKeep = !(
            a.type === AnnotateType.Column && !tableTitles.includes(a.value)
          );
          if (!shouldKeep) {
            get().enqueueChange({
              type: AutoCertChangeType.AnnotateColumnRemove,
              data: {
                id: a.id,
              },
            });
          }
          return shouldKeep;
        });
        newAnnotates[Number(p)] = updatedPageAnnotates;
      });

      get().setAnnotates(newAnnotates);
    },
  };
};
