import { Button, Popconfirm, Tooltip } from "antd";
import { ColumnAnnotateCardProps } from "./ColumnAnnotateCard";
import { DeleteOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";
import { useState } from "react";
import { wait } from "@/utils";
import { FAKE_LOADING_TIME } from "@/components/builder/store/autocertChangeSlice";

const logger = createScopedLogger(
  "components:builder:panel:tool:column:ColumnAnnotateRemove",
);

export interface ColumnAnnotateRemoveProps
  extends Pick<
    ColumnAnnotateCardProps,
    "onColumnAnnotateRemove" | "columnAnnotate"
  > {
  canRemove: boolean;
}

export default function ColumnAnnotateRemove({
  columnAnnotate,
  canRemove,
  onColumnAnnotateRemove,
}: ColumnAnnotateRemoveProps) {
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleRemoveAnnotate = async (): Promise<void> => {
    logger.debug("AutoCert remove column annotate field confirmed");

    if (!canRemove) {
      logger.warn("AutoCert remove column annotate field is not allowed");
      return;
    }

    setDeleting(true);

    try {
      await wait(FAKE_LOADING_TIME);

      onColumnAnnotateRemove(columnAnnotate.id);
    } catch (error) {
      logger.error("AutoCert remove column annotate field failed", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Popconfirm
      title="Are you sure to remove this column annotate?"
      onConfirm={handleRemoveAnnotate}
    >
      <Tooltip title="Remove">
        <Button
          size="small"
          type="text"
          icon={<DeleteOutlined />}
          danger
          loading={deleting}
          disabled={!canRemove || deleting}
        />
      </Tooltip>
    </Popconfirm>
  );
}
