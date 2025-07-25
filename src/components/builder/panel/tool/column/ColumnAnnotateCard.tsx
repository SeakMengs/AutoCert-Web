import { Card, Flex, Space, Tag, theme, Tooltip, Typography } from "antd";
import { ColumnToolProps } from "./ColumnTool";
import ColumnAnnotateEdit from "./ColumnAnnotateEdit";
import ColumnAnnotateRemove from "./ColumnAnnotateRemove";
import { FontSizeOutlined } from "@ant-design/icons";
import { ColumnAnnotateState } from "@/components/builder/store/autocertAnnotate";
import { ColumnAnnotateLock } from "@/components/builder/annotate/ColumnAnnotate";

export interface ColumnAnnotateCardProps
  extends Pick<
    ColumnToolProps,
    | "selectedAnnotateId"
    | "columns"
    | "onAnnotateSelect"
    | "onColumnAnnotateUpdate"
    | "onColumnAnnotateRemove"
  > {
  columnAnnotate: ColumnAnnotateState;
  pageNumber: number;
  lock: ColumnAnnotateLock;
}

const { Text } = Typography;

export default function ColumnAnnotateCard({
  pageNumber,
  columnAnnotate,
  selectedAnnotateId,
  columns,
  lock,
  onAnnotateSelect,
  onColumnAnnotateUpdate,
  onColumnAnnotateRemove,
}: ColumnAnnotateCardProps) {
  const {
    token: { colorPrimary },
  } = theme.useToken();
  return (
    <Card
      onClick={() => {
        onAnnotateSelect(columnAnnotate.id);
      }}
      size="small"
      className="w-full"
      style={{
        border: "1px solid transparent",
        borderColor:
          columnAnnotate.id === selectedAnnotateId ? colorPrimary : undefined,
      }}
    >
      <Flex justify="space-between" align="center" wrap>
        <Space>
          <Tooltip title="Table column">
            <Tag>{columnAnnotate.value}</Tag>
          </Tooltip>
            {columnAnnotate.fontName && (
            <Tooltip title={columnAnnotate.fontName}>
              <span
              className="inline-flex items-center gap-1 sm:gap-1.5 max-w-[100px] sm:max-w-none"
              >
              <FontSizeOutlined style={{ color: colorPrimary }} />
              <Text
                ellipsis
                className="align-middle truncate"
                style={{
                fontFamily: columnAnnotate.fontName,
                }}
              >
                {columnAnnotate.fontName}
              </Text>
              </span>
            </Tooltip>
            )}
          {/* TODO: uncomment this if we allow multiple pdf pages */}
          {/* <Text type="secondary" className="text-xs">
            Page: {pageNumber}
          </Text> */}
        </Space>
        <Space>
          <ColumnAnnotateEdit
            columnAnnotate={columnAnnotate}
            columns={columns}
            canEdit={!lock.disable && lock.update}
            onColumnAnnotateUpdate={onColumnAnnotateUpdate}
          />
          <ColumnAnnotateRemove
            columnAnnotate={columnAnnotate}
            canRemove={!lock.disable && lock.remove}
            onColumnAnnotateRemove={onColumnAnnotateRemove}
          />
        </Space>
      </Flex>
    </Card>
  );
}
