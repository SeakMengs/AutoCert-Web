import { Button, Popconfirm, Tooltip } from "antd";
import { ColumnAnnotateCardProps } from "./ColumnAnnotateCard";
import { DeleteOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";

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
  const handleRemoveAnnotate = async (): Promise<void> => {
    logger.debug("AutoCert remove column annotate field confirmed");
    try {
      onColumnAnnotateRemove(columnAnnotate.id);
    } catch (error) {
      logger.error("AutoCert remove column annotate field failed", error);
    }
  };

  return (
    <Popconfirm
      title="Are you sure to remove this column annotate?"
      onConfirm={handleRemoveAnnotate}
    >
      <Tooltip title="Remove">
        <Button size="small" type="text" icon={<DeleteOutlined />} danger />
      </Tooltip>
    </Popconfirm>
  );
}
