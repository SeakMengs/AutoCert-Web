import { createScopedLogger } from "@/utils/logger";
import { BaseAnnotateProps } from "../annotate/BaseAnnotate";
import { BaseColumnAnnotate, FontWeight } from "../annotate/ColumnAnnotate";
import { BaseSignatureAnnotate } from "../annotate/SignatureAnnotate";
import { SignatoryStatus } from "@/types/project";
import { nanoid } from "nanoid";
import {
  ColumnAnnotateFormSchema,
  FontOptions,
} from "../panel/tool/column/ColumnTool";
import { SignatureAnnotateFormSchema } from "../panel/tool/signature/SignatureTool";
import { approveSignatureAction } from "../action";
import { AutoCertTableColumn } from "../panel/table/AutoCertTable";
import { StateCreator } from "zustand";
import { AutoCertStore } from "./useAutoCertStore";
import { hasPermission, ProjectPermission } from "@/auth/rbac";
import { App } from "antd";
import { AutoCertChangeType } from "./autocertChangeSlice";
import { responseFailed } from "@/utils/response";
import { generateAndFormatZodError } from "@/utils/error";

const logger = createScopedLogger(
  "components:builder:store:autocertAnnotateSlice",
);

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

export const AnnotateColor = "#FFC4C4";
export const AnnotateFontSize = 24;

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
    fontColor: "#000000",
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
    signatureData: "",
    email: "",
    status: SignatoryStatus.NotInvited,
    color: AnnotateColor,
  };
};

export type AutocertAnnotateSliceState = {
  annotates: AnnotateStates;
  columnAnnotates: ColumnAnnotateStates; // Derived from annotates
  signatureAnnotates: SignatureAnnotateStates; // Derived from annotates
  selectedAnnotateId?: string;
};

export interface AutocertAnnotateSliceActions {
  initAnnotates: (annotates: AnnotateStates) => void;

  setAnnotates: (annotates: AnnotateStates) => void;

  setSelectedAnnotateId: (id?: string) => void;

  addColumnAnnotate: (page: number, data: ColumnAnnotateFormSchema) => void;
  updateColumnAnnotate: (id: string, data: ColumnAnnotateFormSchema) => void;
  removeColumnAnnotate: (id: string) => void;

  addSignatureAnnotate: (
    page: number,
    data: SignatureAnnotateFormSchema,
  ) => void;
  removeSignatureAnnotate: (id: string) => void;
  inviteSignatureAnnotate: (id: string) => void;
  signSignatureAnnotate: (
    id: string,
  ) => ReturnType<typeof approveSignatureAction>;

  onAnnotateResizeStop: BaseAnnotateProps["onResizeStop"];
  onAnnotateDragStop: BaseAnnotateProps["onDragStop"];

  replaceAnnotatesColumnValue: (oldTitle: string, newTitle: string) => void;
  removeUnnecessaryAnnotates: (tableColumns: AutoCertTableColumn[]) => void;

  _updateDerivedAnnotates: () => void;
  findAnnotateById: (
    id: string,
  ) => { annotate: AnnotateState; page: number } | undefined;
}

export type AutocertAnnotateSlice = AutocertAnnotateSliceState &
  AutocertAnnotateSliceActions;

export const createAutocertAnnotateSlice: StateCreator<
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

    initAnnotates: (annotates) => {
      logger.debug("Initializing annotates");
      get().setAnnotates(annotates);
      set((state) => {
        state.selectedAnnotateId = undefined;
      });
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

      pages.forEach((p) => {
        get().annotates[Number(p)].forEach((a) => {
          switch (a.type) {
            case AnnotateType.Column:
              columns[Number(p)] = [...(columns[Number(p)] || []), a];
              break;
            case AnnotateType.Signature:
              signatures[Number(p)] = [...(signatures[Number(p)] || []), a];
              break;
          }
        });
      });

      set((state) => {
        state.columnAnnotates = columns;
        state.signatureAnnotates = signatures;
      });
    },

    setSelectedAnnotateId: (id) => {
      if (id === get().selectedAnnotateId) {
        logger.debug(`Select annotation event: ${id} (skip state update)`);
        return;
      }
      logger.debug(`Select annotation event: ${id}`);
      set((state) => {
        state.selectedAnnotateId = id;
      });
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
        value: data.value,
        color: data.color,
        textFitRectBox: data.textFitRectBox,
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
        value: data.value,
        color: data.color,
        textFitRectBox: data.textFitRectBox,
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
        message.error("You do not have permission to invite signatory");
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
        },
      });
    },

    signSignatureAnnotate: async (id) => {
      logger.debug(`Sign signature annotate with id ${id}`);
      // Don't check permission, let the server handle it
      // if (!hasPermission(roles, [ProjectPermission.AnnotateSignatureApprove])) {
      //   logger.warn("Permission denied to sign signature annotate");
      //   return responseFailed(
      //     "Permission denied to sign signature annotate",
      //     generateAndFormatZodError(
      //       "forbidden",
      //       "Permission denied to approve signature",
      //     ),
      //   );
      // }

      const existingAnnotate = get().findAnnotateById(id);
      if (!existingAnnotate) {
        logger.warn(`Signature annotate with id ${id} not found`);
        return responseFailed(
          "Signature annotate not found",
          generateAndFormatZodError("notFound", "Signature annotate not found"),
        );
      }

      const { annotate, page } = existingAnnotate;
      if (annotate.type !== AnnotateType.Signature) {
        logger.warn(
          `Signature annotate with id ${id} found, but not a signature`,
        );
        return responseFailed(
          "Signature annotate not found",
          generateAndFormatZodError("type", "Signature annotate not found"),
        );
      }

      if (annotate.status !== SignatoryStatus.Invited) {
        logger.warn(`Signature annotate with id ${id} found, but not invited`);
        return responseFailed(
          "Signature annotate not invited",
          generateAndFormatZodError("status", "Signature annotate not invited"),
        );
      }

      const res = await approveSignatureAction({
        projectId: get().projectId,
        signatureAnnotateId: id,
      });

      if (res.success) {
        get().setAnnotates({
          ...get().annotates,
          [page]: get().annotates[page].map((a) =>
            a.id === id ? { ...a, status: SignatoryStatus.Signed } : a,
          ),
        });
        get().setSelectedAnnotateId(id);
      }

      return res;
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
        message.error("You do not have permission to remove annotate");
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
