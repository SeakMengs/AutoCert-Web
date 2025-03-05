import {
  Collapse,
  CollapseProps,
  Space,
  Tabs,
  TabsProps,
  theme,
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
  onTextAnnotateAdd,
  onTextAnnotateUpdate,
  onTextAnnotateRemove,
  onSignatureAnnotateAdd,

  // Table,
  columns,
  ...autoCertTableProps
}: AutoCertPanelProps) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

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
          onTextAnnotateAdd={onTextAnnotateAdd}
          onTextAnnotateUpdate={onTextAnnotateUpdate}
          onTextAnnotateRemove={onTextAnnotateRemove}
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
          onSignatureAnnotateAdd={onSignatureAnnotateAdd}
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
    <>
      <style>
        {/* to enforce nav list to be the same height as Bar size */}
        {`
          .ant-tabs-nav-list {
            height: ${BarSize}px;
          }

          /*  When adding headerStyle to tabBarStyle, seems like the width is not 100%, this is to fix that temporarily :) */
          .ant-tabs-nav {
            position: sticky;
            top: 0;
            z-index: 1;
          }
        `}
      </style>
      <Tabs
        centered
        defaultActiveKey="1"
        items={tabs}
        tabBarStyle={{
          // ...headerStyle,
          height: BarSize,
          background: colorBgContainer,
        }}
      />
    </>
  );
}
