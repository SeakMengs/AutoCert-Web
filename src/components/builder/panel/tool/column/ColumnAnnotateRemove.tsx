import { Button, Popconfirm, Tooltip } from "antd";
import { ColumnAnnotateCardProps } from "./ColumnAnnotateCard";
import { DeleteOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";
import { useState } from "react";
import { FAKE_LOADING_TIME } from "@/components/builder/hooks/useAutoCertChange";
import { wait } from "@/utils";

const logger = createScopedLogger(
  "components:builder:panel:tool:column:ColumnAnnotateRemove",
);

export interface ColumnAnnotateRemoveProps
  extends Pick<
    ColumnAnnotateCardProps,
    "onColumnAnnotateRemove" | "columnAnnotate"
  > {}

export default function ColumnAnnotateRemove({
  columnAnnotate,
  onColumnAnnotateRemove,
}: ColumnAnnotateRemoveProps) {
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleRemoveAnnotate = async (): Promise<void> => {
    logger.debug("AutoCert remove column annotate field confirmed");
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
          disabled={deleting}
        />
      </Tooltip>
    </Popconfirm>
  );
}
