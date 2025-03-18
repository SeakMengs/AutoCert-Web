import { ColumnAnnotateState } from "@/components/builder/hooks/useAutoCert";
import {
  Button,
  Card,
  Flex,
  Space,
  Tag,
  theme,
  Tooltip,
  Typography,
} from "antd";
import { ColumnToolProps } from "./ColumnTool";
import ColumnAnnotateEdit from "./ColumnAnnotateEdit";
import ColumnAnnotateRemove from "./ColumnAnnotateRemove";
import { FontSizeOutlined } from "@ant-design/icons";

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
}

const { Text } = Typography;

export default function ColumnAnnotateCard({
  pageNumber,
  columnAnnotate,
  selectedAnnotateId,
  columns,
  onAnnotateSelect,
  onColumnAnnotateUpdate,
  onColumnAnnotateRemove,
}: ColumnAnnotateCardProps) {
  const {
    token: { colorPrimary },
  } = theme.useToken();

  return (
    <Card
      onClick={() => onAnnotateSelect(columnAnnotate.id)}
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
          <Tooltip
            title={`Text fit rectangle box enabled: ${columnAnnotate.textFitRectBox ? "Yes" : "No"}`}
          >
            <FontSizeOutlined
              style={{
                color: columnAnnotate.textFitRectBox ? colorPrimary : undefined,
              }}
            />
          </Tooltip>
          <Text type="secondary" className="text-xs">
            Page: {pageNumber}
          </Text>
        </Space>
        <Space>
          <ColumnAnnotateEdit
            columnAnnotate={columnAnnotate}
            columns={columns}
            onColumnAnnotateUpdate={onColumnAnnotateUpdate}
          />
          <ColumnAnnotateRemove
            columnAnnotate={columnAnnotate}
            onColumnAnnotateRemove={onColumnAnnotateRemove}
          />
        </Space>
      </Flex>
    </Card>
  );
}
