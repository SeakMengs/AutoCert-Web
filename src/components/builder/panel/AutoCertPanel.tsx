import {
  Button,
  Collapse,
  CollapseProps,
  Flex,
  Tabs,
  TabsProps,
  theme,
} from "antd";
import ColumnTool, { ColumnToolProps } from "./tool/column/ColumnTool";
import SignatureTool, {
  SignatureToolProps,
} from "./tool/signature/SignatureTool";
import AutoCertTable, { AutoCertTableProps } from "./table/AutoCertTable";
import {
  FontSizeOutlined,
  FormOutlined,
  TableOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { BarSize } from "@/app/dashboard/layout_client";
import { memo, PropsWithChildren, useMemo, useCallback } from "react";

export interface AutoCertPanelProps
  extends ColumnToolProps,
    SignatureToolProps,
    AutoCertTableProps {
  onGenerateCertificates: () => void;
}

function AutoCertPanel({
  // Annotate
  selectedAnnotateId,
  currentPdfPage,
  columnAnnotates,
  signatureAnnotates,
  onAnnotateSelect,
  onColumnAnnotateAdd,
  onColumnAnnotateUpdate,
  onColumnAnnotateRemove,
  onSignatureAnnotateAdd,
  onSignatureAnnotateRemove,
  onSignatureAnnotateInvite,
  onGenerateCertificates,
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
          <FontSizeOutlined /> Column Fields
        </span>
      ),
      children: (
        <ColumnTool
          selectedAnnotateId={selectedAnnotateId}
          columnAnnotates={columnAnnotates}
          currentPdfPage={currentPdfPage}
          columns={columns}
          onColumnAnnotateAdd={onColumnAnnotateAdd}
          onColumnAnnotateUpdate={onColumnAnnotateUpdate}
          onColumnAnnotateRemove={onColumnAnnotateRemove}
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
        <SignatureTool
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
        <Layout onGenerateCertificates={onGenerateCertificates}>
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
        <Layout onGenerateCertificates={onGenerateCertificates}>
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
        destroyInactiveTabPane
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

export default memo(AutoCertPanel);

interface LayoutProps
  extends Pick<AutoCertPanelProps, "onGenerateCertificates"> {}

const Layout = memo(
  ({ onGenerateCertificates, children }: PropsWithChildren<LayoutProps>) => {
    const {
      token: { colorSplit },
    } = theme.useToken();

    const handleGenerateCertificates = useCallback(() => {
      onGenerateCertificates();
    }, [onGenerateCertificates]);

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
            <Button type="primary" onClick={handleGenerateCertificates}>
              Generate certificates
            </Button>
          </Flex>
        </div>
      </Flex>
    );
  },
);
