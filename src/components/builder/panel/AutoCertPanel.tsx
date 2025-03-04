import {
  Collapse,
  CollapseProps,
  Space,
  Tabs,
  TabsProps,
  Typography,
} from "antd";
import AutoCertTextTool, {
  AutoCertTextToolProps,
} from "./tool/text/AutoCertTextTool";
import AutoCertSignatoryTool, {
  AutoCertSignatoryToolProps,
} from "./tool/signatory/AutoCertSignatoryTool";
import AutoCertTable, { AutoCertTableProps } from "./table/AutoCertTable";
import {
  AppstoreOutlined,
  FontSizeOutlined,
  FormOutlined,
  TableOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { BarSize, headerStyle } from "@/app/dashboard/layout_client";

export interface AutoCertPanelProps
  extends AutoCertTextToolProps,
    AutoCertSignatoryToolProps,
    AutoCertTableProps {}

const { Title } = Typography;

export default function AutoCertPanel({
  // Annotate
  selectedAnnotateId,
  currentPdfPage,
  textAnnotates,
  signatureAnnotates,
  onAnnotateSelect,
  onAddTextField,
  onUpdateTextField,
  onDeleteTextField,
  onAddSignatureField,

  // Table,
  columns,
  ...autoCertTableProps
}: AutoCertPanelProps) {
  const collapseItems: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <span>
          <FontSizeOutlined /> Text Fields
        </span>
      ),
      children: (
        <AutoCertTextTool
          selectedAnnotateId={selectedAnnotateId}
          textAnnotates={textAnnotates}
          currentPdfPage={currentPdfPage}
          columns={columns}
          onAddTextField={onAddTextField}
          onUpdateTextField={onUpdateTextField}
          onDeleteTextField={onDeleteTextField}
          onAnnotateSelect={onAnnotateSelect}
        />
      ),
      // extra: <PlusOutlined onClick={addTextField} />,
    },
    {
      key: "2",
      label: (
        <span>
          <FormOutlined /> Signatories
        </span>
      ),
      children: (
        <AutoCertSignatoryTool
          currentPdfPage={currentPdfPage}
          signatureAnnotates={signatureAnnotates}
          onAnnotateSelect={onAnnotateSelect}
          onAddSignatureField={onAddSignatureField}
          selectedAnnotateId={selectedAnnotateId}
        />
      ),
      // extra: <PlusOutlined onClick={addSignatureField} />,
    },
  ];

  const tabs = [
    {
      key: "1",
      label: (
        <span>
          <ToolOutlined /> Tools
        </span>
      ),
      children: (
        <div className="px-2">
          <Collapse
            defaultActiveKey={["1", "2"]}
            items={collapseItems}
            bordered={false}
            expandIconPosition="end"
          />
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <TableOutlined /> Data
        </span>
      ),
      children: (
        <div className="px-2">
          <AutoCertTable columns={columns} {...autoCertTableProps} />
        </div>
      ),
    },
  ] satisfies TabsProps["items"];

  return (
    <Tabs
      centered
      defaultActiveKey="1"
      items={tabs}
      // TODO: fix tab bar scroll
      tabBarStyle={{
        // ...headerStyle,
        height: BarSize,
      }}
    />
  );
}
