import {
  App,
  Button,
  Collapse,
  CollapseProps,
  Flex,
  Tabs,
  TabsProps,
  theme,
  Typography,
} from "antd";
import ColumnTool from "./tool/column/ColumnTool";
import SignatureTool from "./tool/signature/SignatureTool";
import AutoCertTable from "./table/AutoCertTable";
import {
  FontSizeOutlined,
  FormOutlined,
  SettingOutlined,
  TableOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { BarSize } from "@/app/dashboard/layout_client";
import { memo, PropsWithChildren } from "react";
import SettingsTool from "./tool/settings/settings";
import { useMutation } from "@tanstack/react-query";
import { createScopedLogger } from "@/utils/logger";
import { useRouter } from "next/navigation";
import { getTranslatedErrorMessage } from "@/utils/error";
import { useAutoCertStore } from "../providers/AutoCertStoreProvider";

const logger = createScopedLogger(
  "src:app:components:builder:panel:AutoCertPanel.ts",
);

export interface AutoCertPanelProps {}

const { Text } = Typography;

function AutoCertPanel({}: AutoCertPanelProps) {
  const {
    // Annotate
    selectedAnnotateId,
    currentPdfPage,
    columnAnnotates,
    signatureAnnotates,

    settings,
    onQrCodeEnabledChange,
    setSelectedAnnotateId: onAnnotateSelect,
    addColumnAnnotate: onColumnAnnotateAdd,
    updateColumnAnnotate: onColumnAnnotateUpdate,
    removeColumnAnnotate: onColumnAnnotateRemove,
    addSignatureAnnotate: onSignatureAnnotateAdd,
    removeSignatureAnnotate: onSignatureAnnotateRemove,
    inviteSignatureAnnotate: onSignatureAnnotateInvite,
    signSignatureAnnotate: onSignatureAnnotateSign,

    // Table,
    columns,
    rows,
    tableLoading,
    onColumnAdd,
    onColumnDelete,
    onColumnUpdate,
    onRowAdd,
    onRowUpdate,
    onRowsDelete,
    onImportFromCSV,
    onExportToCSV,
  } = useAutoCertStore((state) => state);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const collapseItems = [
    {
      key: "1",
      label: (
        <Text className="select-none">
          <FontSizeOutlined /> Column Fields
        </Text>
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
        <Text className="select-none">
          <FormOutlined /> Signatories
        </Text>
      ),
      children: (
        <SignatureTool
          currentPdfPage={currentPdfPage}
          signatureAnnotates={signatureAnnotates}
          onAnnotateSelect={onAnnotateSelect}
          onSignatureAnnotateAdd={onSignatureAnnotateAdd}
          onSignatureAnnotateRemove={onSignatureAnnotateRemove}
          onSignatureAnnotateInvite={onSignatureAnnotateInvite}
          onSignatureAnnotateSign={onSignatureAnnotateSign}
          selectedAnnotateId={selectedAnnotateId}
        />
      ),
    },
    {
      key: "3",
      label: (
        <Text className="select-none">
          <SettingOutlined /> Settings
        </Text>
      ),
      children: (
        <SettingsTool
          qrCodeEnabled={settings.qrCodeEnabled}
          onQrCodeEnabledChange={onQrCodeEnabledChange}
        />
      ),
    },
  ] satisfies CollapseProps["items"];

  const tabs = [
    {
      key: "1",
      label: (
        <Text className="select-none">
          <ToolOutlined /> Tools
        </Text>
      ),
      children: (
        <Layout>
          <Collapse
            defaultActiveKey={["1", "2", "3"]}
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
        <Text className="select-none">
          <TableOutlined /> Data
        </Text>
      ),
      children: (
        <Layout>
          <AutoCertTable
            columns={columns}
            rows={rows}
            tableLoading={tableLoading}
            onColumnAdd={onColumnAdd}
            onColumnDelete={onColumnDelete}
            onColumnUpdate={onColumnUpdate}
            onRowAdd={onRowAdd}
            onRowUpdate={onRowUpdate}
            onRowsDelete={onRowsDelete}
            onImportFromCSV={onImportFromCSV}
            onExportToCSV={onExportToCSV}
          />
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

interface LayoutProps {}

const Layout = memo(({ children }: PropsWithChildren<LayoutProps>) => {
  const { onGenerateCertificates, project } = useAutoCertStore(
    (state) => state,
  );

  const router = useRouter();
  const { message, modal } = App.useApp();
  const {
    token: { colorSplit },
  } = theme.useToken();

  const { mutateAsync: onGenerateCertificatesMutation, isPending } =
    useMutation({
      mutationFn: onGenerateCertificates,
      onSuccess: (data, variables) => {
        if (!data.success) {
          const { errors } = data;

          // TODO: add more specific error handling
          const specificError = getTranslatedErrorMessage(errors, {
            status:
              "Certificates cannot be generated as the project is not in draft status!",
            noAnnotate:
              "Certificates cannot be generated as because there are no annotations!",
          });
          if (specificError) {
            message.error(specificError);
            return;
          }

          message.error("Failed to generate certificates");
          return;
        }

        modal.success({
          title: "Certificates generated successfully",
          content: (
            <div className="motion-preset-confetti">
              <p>Certificates have been generated successfully.</p>
              <p>
                <Button
                  type="link"
                  onClick={() => {
                    router.push(
                      `/dashboard/projects/${project.id}/certificates`,
                    );
                  }}
                >
                  Go to Generated Certificates Page
                </Button>
              </p>
            </div>
          ),
        });
      },
      onError: (error) => {
        logger.error("Failed to generate certificates", error);
        message.error("Failed to generate certificates");
      },
    });

  const handleGenerateCertificates = async () => {
    await onGenerateCertificatesMutation();
  };

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
          <Button
            type="primary"
            onClick={handleGenerateCertificates}
            loading={isPending}
            disabled={isPending}
          >
            Generate certificates
          </Button>
        </Flex>
      </div>
    </Flex>
  );
});
