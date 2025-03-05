import {
  Button,
  Collapse,
  CollapseProps,
  Flex,
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
  onSignatureAnnotateRemove,
  onSignatureAnnotateInvite,
  // Table,
  columns,
  ...autoCertTableProps
}: AutoCertPanelProps) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const collapseItems = [
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
          onSignatureAnnotateRemove={onSignatureAnnotateRemove}
          onSignatureAnnotateInvite={onSignatureAnnotateInvite}
          selectedAnnotateId={selectedAnnotateId}
        />
      ),
    },
  ] satisfies CollapseProps["items"];

  const tabs = [
    {
      key: "1",
      label: (
        <span>
          <ToolOutlined /> Tools
        </span>
      ),
      children: (
        <Layout>
          <Collapse
            defaultActiveKey={["1", "2"]}
            items={collapseItems}
            bordered={false}
            expandIconPosition="end"
          />
        </Layout>
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
        <Layout>
          <AutoCertTable columns={columns} {...autoCertTableProps} />
        </Layout>
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
          margin: 0,
        }}
      />
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const {
    token: { colorSplit },
  } = theme.useToken();

  return (
    <Flex
      vertical
      justify="space-between"
      style={{
        height: `calc(100vh - ${BarSize}px)`,
      }}
    >
      <div className="overflow-auto">
        <div className="m-2">{children}</div>
      </div>
      <div style={{ borderTop: `1px solid ${colorSplit}` }}>
        <Flex className="m-2" justify="center">
          <Button type="primary">Generate certificates</Button>
        </Flex>
      </div>
    </Flex>
  );
}
