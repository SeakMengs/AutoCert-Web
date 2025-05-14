"use client";
import { BaseAnnotateProps } from "@/components/builder/annotate/BaseAnnotate";
import { createScopedLogger } from "@/utils/logger";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { BaseColumnAnnotate } from "../annotate/ColumnAnnotate";
import { BaseSignatureAnnotate } from "../annotate/SignatureAnnotate";
import { AutoCertTableColumn } from "../panel/table/AutoCertTable";
import { SignatureAnnotateFormSchema } from "../panel/tool/signature/SignatureTool";
import { ColumnAnnotateFormSchema } from "../panel/tool/column/ColumnTool";
import { SettingsToolProps } from "../panel/tool/settings/settings";
import useAutoCertChange, { AutoCertChangeType } from "./useAutoCertChange";
import { SignatoryStatus } from "@/types/project";
import { UseAutoCertProps } from "./useAutoCert";
import { hasPermission, ProjectPermission } from "@/auth/rbac";
import { App } from "antd";
import { approveSignatureAction } from "../action";
import { responseFailed, responseSomethingWentWrong } from "@/utils/response";
import { generateAndFormatZodError } from "@/utils/error";

const logger = createScopedLogger(
  "components:builder:hook:useAutoCertAnnotate",
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
    fontName: "Arial",
    fontSize: AnnotateFontSize,
    fontWeight: "regular",
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

export interface UseAutoCertAnnotateProps
  extends Pick<UseAutoCertProps, "initialAnnotates" | "projectId"> {
  enqueueChange: ReturnType<typeof useAutoCertChange>["enqueueChange"];
  roles: UseAutoCertProps["initialRoles"];
}

export default function useAutoCertAnnotate({
  projectId,
  initialAnnotates,
  roles,
  enqueueChange,
}: UseAutoCertAnnotateProps) {
  const [annotates, setAnnotates] = useState<AnnotateStates>(initialAnnotates);
  const [columnAnnotates, setColumnAnnotates] = useState<ColumnAnnotateStates>(
    {},
  );
  const [signatureAnnotates, setSignatureAnnotates] =
    useState<SignatureAnnotateStates>({});
  const [selectedAnnotateId, setSelectedAnnotateId] = useState<string>();
  const { message } = App.useApp();

  useEffect(() => {
    setAnnotates(initialAnnotates);
  }, [initialAnnotates]);

  /**
   * Update column and signature annotates when annotates change
   *  Technically not efficient enough, however since we only handle a few annotates, it should be fine
   * */
  useEffect(() => {
    const columns: ColumnAnnotateStates = {};
    const signatures: SignatureAnnotateStates = {};
    const pages = Object.keys(annotates);

    pages.forEach((p) => {
      annotates[Number(p)].forEach((a) => {
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

    setColumnAnnotates(columns);
    setSignatureAnnotates(signatures);
  }, [annotates]);

  const findAnnotateById = (
    id: string,
  ):
    | {
        annotate: AnnotateState;
        page: number;
      }
    | undefined => {
    const pages = Object.keys(annotates);

    for (const page of pages) {
      const annotate = annotates[Number(page)].find(
        (annotate) => annotate.id === id,
      );
      if (annotate) {
        return {
          annotate: annotate,
          page: Number(page),
        };
      }
    }

    return undefined;
  };

  const onColumnAnnotateAdd = (
    page: number,
    data: ColumnAnnotateFormSchema,
  ): void => {
    logger.debug("Adding column annotate");

    if (!hasPermission(roles, [ProjectPermission.AnnotateColumnAdd])) {
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

    setAnnotates((prev) => ({
      ...prev,
      [page]: [...(prev[page] || []), newCA],
    }));
    setSelectedAnnotateId(newCA.id);

    enqueueChange({
      type: AutoCertChangeType.AnnotateColumnAdd,
      data: {
        ...newCA,
        page: page,
      },
    });
  };

  const onColumnAnnotateUpdate = (
    id: string,
    data: ColumnAnnotateFormSchema,
  ): void => {
    logger.debug(`Update column annotate with id ${id}`);

    if (!hasPermission(roles, [ProjectPermission.AnnotateColumnUpdate])) {
      logger.warn("Permission denied to update column annotate");
      message.error("You do not have permission to update column annotate");
      return;
    }

    const existingAnnotate = findAnnotateById(id);
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

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].map((a) => (a.id === id ? updatedAnnotate : a)),
    }));
    setSelectedAnnotateId(updatedAnnotate.id);

    enqueueChange({
      type: AutoCertChangeType.AnnotateColumnUpdate,
      data: {
        ...updatedAnnotate,
        page: page,
      },
    });
  };

  const onColumnAnnotateRemove = (id: string): void => {
    logger.debug(`Remove column annotate with id ${id}`);

    if (!hasPermission(roles, [ProjectPermission.AnnotateColumnRemove])) {
      logger.warn("Permission denied to remove column annotate");
      message.error("You do not have permission to remove column annotate");
      return;
    }

    const existingAnnotate = findAnnotateById(id);
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

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].filter((annotation) => annotation.id !== id),
    }));
    setSelectedAnnotateId(undefined);

    enqueueChange({
      type: AutoCertChangeType.AnnotateColumnRemove,
      data: {
        id: id,
      },
    });
  };

  const onSignatureAnnotateAdd = (
    page: number,
    data: SignatureAnnotateFormSchema,
  ): void => {
    logger.debug("Adding signature annotate");

    if (!hasPermission(roles, [ProjectPermission.AnnotateSignatureAdd])) {
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

    setAnnotates((prev) => ({
      ...prev,
      [page]: [...(prev[page] || []), newSA],
    }));
    setSelectedAnnotateId(newSA.id);

    enqueueChange({
      type: AutoCertChangeType.AnnotateSignatureAdd,
      data: {
        ...newSA,
        page: page,
      },
    });
  };

  const onSignatureAnnotateRemove = (id: string): void => {
    logger.debug(`Remove signature annotate with id ${id}`);

    if (!hasPermission(roles, [ProjectPermission.AnnotateSignatureRemove])) {
      logger.warn("Permission denied to remove signature annotate");
      message.error("You do not have permission to remove signature annotate");
      return;
    }

    const existingAnnotate = findAnnotateById(id);
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

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].filter((annotation) => annotation.id !== id),
    }));
    setSelectedAnnotateId(undefined);

    enqueueChange({
      type: AutoCertChangeType.AnnotateSignatureRemove,
      data: {
        id: id,
      },
    });
  };

  const onSignatureAnnotateInvite = (id: string): void => {
    logger.debug(`Invite signature annotate with id ${id}`);

    if (!hasPermission(roles, [ProjectPermission.AnnotateSignatureInvite])) {
      logger.warn("Permission denied to invite signature annotate");
      message.error("You do not have permission to invite signatory");
      return;
    }

    const existingAnnotate = findAnnotateById(id);
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

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].map((annotation) =>
        annotation.id === id
          ? { ...annotation, status: SignatoryStatus.Invited }
          : annotation,
      ),
    }));

    enqueueChange({
      type: AutoCertChangeType.AnnotateSignatureInvite,
      data: {
        id: id,
      },
    });
  };

  // This one don't enqueue since we need to fetch the signature from server
  const onSignatureAnnotateSign = async (id: string) => {
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

    const existingAnnotate = findAnnotateById(id);
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
      projectId: projectId,
      signatureAnnotateId: id,
    });

    if (res.success) {
      setAnnotates((prev) => ({
        ...prev,
        [page]: prev[page].map((annotation) =>
          annotation.id === id
            ? { ...annotation, status: SignatoryStatus.Signed }
            : annotation,
        ),
      }));
      setSelectedAnnotateId(id);
    }

    return res;
  };

  const onAnnotateResizeStop: BaseAnnotateProps["onResizeStop"] = (
    id,
    e,
    rect,
    pageNumber,
  ): void => {
    logger.debug(
      `Resize annotation, w:${rect.width}, h:${rect.height},  Position: x:${rect.x}, y:${rect.y}, `,
    );

    if (
      !hasPermission(roles, [
        ProjectPermission.AnnotateColumnUpdate,
        ProjectPermission.AnnotateSignatureUpdate,
      ])
    ) {
      logger.warn("Permission denied to resize annotate");
      message.error("You do not have permission to resize annotate");
      return;
    }

    const existingAnnotate = findAnnotateById(id);
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

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].map((a) => (a.id === id ? updatedAnnotate : a)),
    }));

    switch (updatedAnnotate.type) {
      case AnnotateType.Column:
        enqueueChange({
          type: AutoCertChangeType.AnnotateColumnUpdate,
          data: {
            ...updatedAnnotate,
            page: page,
          },
        });
        break;
      case AnnotateType.Signature:
        enqueueChange({
          type: AutoCertChangeType.AnnotateSignatureUpdate,
          data: {
            ...updatedAnnotate,
            page: page,
          },
        });
        break;
    }
  };

  const onAnnotateDragStop: BaseAnnotateProps["onDragStop"] = (
    id,
    e,
    position,
    pageNumber,
  ): void => {
    logger.debug(`Drag annotation, Position: x:${position.x}, y:${position.y}`);

    if (
      !hasPermission(roles, [
        ProjectPermission.AnnotateColumnUpdate,
        ProjectPermission.AnnotateSignatureUpdate,
      ])
    ) {
      logger.warn("Permission denied to drag annotate");
      message.error("You do not have permission to drag annotate");
      return;
    }

    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Annotate with id ${id} not found`);
      return;
    }

    const { annotate, page } = existingAnnotate;

    // if (annotate.x === position.x && annotate.y === position.y) {
    //   logger.debug(
    //     `Drag annotation event: ${id} (skip state update cause same position)`,
    //   );
    //   return;
    // }

    const updatedAnnotate = {
      ...annotate,
      x: position.x,
      y: position.y,
    } satisfies AnnotateState;

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].map((a) => (a.id === id ? updatedAnnotate : a)),
    }));

    switch (updatedAnnotate.type) {
      case AnnotateType.Column:
        enqueueChange({
          type: AutoCertChangeType.AnnotateColumnUpdate,
          data: {
            ...updatedAnnotate,
            page: page,
          },
        });
        break;
      case AnnotateType.Signature:
        enqueueChange({
          type: AutoCertChangeType.AnnotateSignatureUpdate,
          data: {
            ...updatedAnnotate,
            page: page,
          },
        });
        break;
    }
  };

  const onAnnotateSelect = (id: string | undefined): void => {
    if (id === selectedAnnotateId) {
      logger.debug(`Select annotation event: ${id} (skip state update)`);
      return;
    }

    logger.debug(`Select annotation event: ${id}`);

    setSelectedAnnotateId(id);
  };

  const replaceAnnotatesColumnValue = (
    oldTitle: string,
    newTitle: string,
  ): void => {
    logger.debug(`Replace annotates column value: ${oldTitle} -> ${newTitle}`);

    if (!hasPermission(roles, [ProjectPermission.AnnotateColumnUpdate])) {
      logger.warn("Permission denied to replace column value");
      message.error("You do not have permission to update annotate");
      return;
    }

    const pages = Object.keys(annotates);
    const newAnnotates = { ...annotates };

    // update value of annotate column with value of oldTitle to newTitle
    pages.forEach((p) => {
      const pageAnnotates = newAnnotates[Number(p)];
      pageAnnotates.forEach((a) => {
        if (a.type === AnnotateType.Column && a.value === oldTitle) {
          a.value = newTitle;

          enqueueChange({
            type: AutoCertChangeType.AnnotateColumnUpdate,
            data: {
              ...a,
              page: Number(p),
            },
          });
        }
      });
    });

    setAnnotates(newAnnotates);
  };

  // Remove annotates that does not exist in the table column
  const removeUnnecessaryAnnotates = (columns: AutoCertTableColumn[]): void => {
    logger.debug("Remove unnecessary annotates");

    if (!hasPermission(roles, [ProjectPermission.AnnotateColumnRemove])) {
      logger.warn("Permission denied to remove unnecessary annotates");
      message.error("You do not have permission to remove annotate");
      return;
    }

    const tableTitles = columns.map((c) => c.title);
    const pages = Object.keys(annotates);
    const newAnnotates = { ...annotates };

    pages.forEach((p) => {
      const updatedPageAnnotates = newAnnotates[Number(p)].filter((a) => {
        const shouldKeep = !(
          a.type === AnnotateType.Column && !tableTitles.includes(a.value)
        );
        if (!shouldKeep) {
          enqueueChange({
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

    setAnnotates(newAnnotates);
  };

  return {
    annotates,
    columnAnnotates,
    signatureAnnotates,
    selectedAnnotateId,
    onColumnAnnotateAdd,
    onColumnAnnotateUpdate,
    onColumnAnnotateRemove,
    onSignatureAnnotateAdd,
    onSignatureAnnotateRemove,
    onSignatureAnnotateInvite,
    onSignatureAnnotateSign,
    onAnnotateResizeStop,
    onAnnotateDragStop,
    onAnnotateSelect,
    replaceAnnotatesColumnValue,
    removeUnnecessaryAnnotates,
  };
}
