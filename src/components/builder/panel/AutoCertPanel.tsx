import {
  Alert,
  App,
  Button,
  Collapse,
  CollapseProps,
  Flex,
  Tabs,
  TabsProps,
  theme,
  Tooltip,
  Typography,
} from "antd";
import ColumnTool, { FontOptions } from "./tool/column/ColumnTool";
import SignatureTool from "./tool/signature/SignatureTool";
import AutoCertTable from "./table/AutoCertTable";
import {
  CheckCircleOutlined,
  FontSizeOutlined,
  FormOutlined,
  SettingOutlined,
  TableOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { BarSize } from "@/app/dashboard/layout_client";
import { memo, PropsWithChildren, useCallback, useEffect, useRef } from "react";
import SettingsTool from "./tool/settings/settings";
import { useMutation } from "@tanstack/react-query";
import { createScopedLogger } from "@/utils/logger";
import { useRouter } from "next/navigation";
import { getTranslatedErrorMessage } from "@/utils/error";
import { useAutoCertStore } from "../providers/AutoCertStoreProvider";
import { useShallow } from "zustand/react/shallow";
import { ProjectStatus, ProjectStatusLabels } from "@/types/project";
import { getApiBaseUrl } from "@/utils";
import { getCookie } from "@/utils/server/cookie";
import { AccessTokenCookie } from "@/auth/cookie";
import { getCanGenerateCertificateState } from "../utils";
import Link from "next/link";
import useModal from "antd/es/modal/useModal";
import { loadCustomFont } from "@/utils/font";

const logger = createScopedLogger(
  "src:app:components:builder:panel:AutoCertPanel.ts",
);

export interface AutoCertPanelProps {}

const { Text, Title } = Typography;

function AutoCertPanel({}: AutoCertPanelProps) {
  const {
    project,
    roles,
    signaturesSigned,
    signatureCount,
    // Annotate
    selectedAnnotateId,
    currentPdfPage,
    columnAnnotates,
    signatureAnnotates,
    settings,
    pendingChanges,
    hasAtLeastOneAnnotate,
    onQrCodeEnabledChange,
    onAnnotateSelect,
    onColumnAnnotateAdd,
    onColumnAnnotateUpdate,
    onColumnAnnotateRemove,
    onSignatureAnnotateAdd,
    onSignatureAnnotateRemove,
    onSignatureAnnotateInvite,
    onSignatureAnnotateReject,
    onSignatureAnnotateSign,

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
  } = useAutoCertStore(
    useShallow((state) => {
      return {
        project: state.project,
        signaturesSigned: state.signaturesSigned,
        signatureCount: state.signatureCount,

        selectedAnnotateId: state.selectedAnnotateId,
        currentPdfPage: state.currentPdfPage,
        columnAnnotates: state.columnAnnotates,
        signatureAnnotates: state.signatureAnnotates,
        settings: state.settings,
        roles: state.roles,
        pendingChanges: state.changes,
        hasAtLeastOneAnnotate: state.hasAtLeastOneAnnotate,
        onQrCodeEnabledChange: state.onQrCodeEnabledChange,
        onAnnotateSelect: state.setSelectedAnnotateId,
        onColumnAnnotateAdd: state.addColumnAnnotate,
        onColumnAnnotateUpdate: state.updateColumnAnnotate,
        onColumnAnnotateRemove: state.removeColumnAnnotate,
        onSignatureAnnotateAdd: state.addSignatureAnnotate,
        onSignatureAnnotateRemove: state.removeSignatureAnnotate,
        onSignatureAnnotateReject: state.rejectSignatureAnnotate,
        onSignatureAnnotateInvite: state.inviteSignatureAnnotate,
        onSignatureAnnotateSign: state.signSignatureAnnotate,

        // Table
        columns: state.columns,
        rows: state.rows,
        tableLoading: state.tableLoading,
        onColumnAdd: state.onColumnAdd,
        onColumnDelete: state.onColumnDelete,
        onColumnUpdate: state.onColumnUpdate,
        onRowAdd: state.onRowAdd,
        onRowUpdate: state.onRowUpdate,
        onRowsDelete: state.onRowsDelete,
        onImportFromCSV: state.onImportFromCSV,
        onExportToCSV: state.onExportToCSV,
      };
    }),
  );

  const { canGenerate, cannotGenerateReasons } = getCanGenerateCertificateState(
    {
      roles,
      project,
      signatureCount,
      signaturesSigned,
      hasAtLeastOneAnnotate: hasAtLeastOneAnnotate(),
      hasPendingChange: pendingChanges.length > 0,
    },
  );

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
          onSignatureAnnotateReject={onSignatureAnnotateReject}
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
        <TabItemLayout>
          <Collapse
            defaultActiveKey={["1", "2", "3"]}
            items={collapseItems}
            bordered={false}
            expandIconPosition="end"
          />
          {/* Show reason if cannot generate */}
          {!canGenerate && project.status !== ProjectStatus.Completed && (
            <div className="mt-2">
              <Alert
                message={
                  <Text className="text-amber-800" strong>
                    Cannot generate certificates because:
                  </Text>
                }
                description={
                  cannotGenerateReasons.length > 0 ? (
                    <ul className="m-0 pl-5">
                      {cannotGenerateReasons.map((reason, index) => (
                        <li key={index} className="text-amber-800 text-sm">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "Unable to generate certificates."
                  )
                }
                type="warning"
                showIcon
              />
            </div>
          )}
          {project.status === ProjectStatus.Completed && (
            <div className="mt-2">
              <Alert
                message={
                  <Text className="text-green-700">
                    This project has already generated certificates.{" "}
                    <Link
                      href={`/dashboard/projects/${project.id}/certificates`}
                      className="text-green-600 hover:text-green-700 transition underline"
                    >
                      View the generated certificates
                    </Link>
                  </Text>
                }
                type="success"
                showIcon
                className="border-green-200"
              />
            </div>
          )}
        </TabItemLayout>
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
        <TabItemLayout>
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
        </TabItemLayout>
      ),
    },
  ] satisfies TabsProps["items"];

  return (
    <Layout
      canGenerate={canGenerate}
      cannotGenerateReasons={cannotGenerateReasons}
    >
      <style>
        {`
          /*  
          to enforce nav list to be the same height as Bar size
          When adding headerStyle to tabBarStyle, seems like the width is not 100%, this is to fix that temporarily :) 
          */
          .ant-tabs-nav {
            position: sticky !important;
            top: 0 !important;
            z-index: 1 !important;
          }

          .ant-tabs-nav-list {
            margin: 0!important;
          }

          .ant-tabs-nav-wrap {
            justify-content: center;
          }
        `}
      </style>
      <Tabs
        centered
        defaultActiveKey="1"
        items={tabs}
        destroyOnHidden
        tabBarStyle={{
          height: BarSize,
          background: colorBgContainer,
          margin: 0,
          // position: "sticky",
        }}
      />
    </Layout>
  );
}

export default memo(AutoCertPanel);

interface LayoutProps
  extends ReturnType<typeof getCanGenerateCertificateState> {}

function Layout({
  children,
  canGenerate,
  cannotGenerateReasons,
}: PropsWithChildren<LayoutProps>) {
  const {
    project,
    setProject,
    invalidateBuilderQueries,
    cancelBuilderInvalidQueries,
    onGenerateCertificates,
  } = useAutoCertStore(
    useShallow((state) => {
      return {
        project: state.project,
        setProject: state.setProject,
        onGenerateCertificates: state.onGenerateCertificates,
        invalidateBuilderQueries: state.invalidateQueries,
        cancelBuilderInvalidQueries: state.cancelInvalidateQueries,
      };
    }),
  );
  const isProcessing = project.status === ProjectStatus.Processing;
  const router = useRouter();
  const { message } = App.useApp();
  const [modal, contextHolder] = useModal();
  const {
    token: { colorSplit },
  } = theme.useToken();

  type StatusMessageEvent = {
    status: ProjectStatus;
    error?: any;
  };

  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingRef = useRef<boolean>(false);

  useEffect(() => {
    // Don't start streaming if not in processing status
    if (!isProcessing) {
      cleanupStream();
      return;
    }

    if (streamingRef.current) {
      logger.info("Already streaming SSE, skipping new connection.");
      return;
    }

    startSSEStream();

    return () => {
      cleanupStream();
    };
  }, [project.id, project.status]);

  const cleanupStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    streamingRef.current = false;
  }, []);

  const startSSEStream = useCallback(async () => {
    // Prevent multiple concurrent streams
    if (streamingRef.current) {
      return;
    }

    streamingRef.current = true;
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    try {
      await cancelBuilderInvalidQueries();

      const accessToken = await getCookie(AccessTokenCookie);
      const response = await fetch(
        `${getApiBaseUrl()}/api/v1/projects/${project.id}/sse/status`,
        {
          signal: currentController.signal,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "text/event-stream",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body for SSE fetch.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (!currentController.signal.aborted) {
          const { value, done } = await reader.read();

          if (done) {
            logger.info("Status SSE stream completed normally");
            break;
          }

          if (value) {
            buffer += decoder.decode(value, { stream: true });
            // Example line: event:status,data:{"status":1}
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            let eventType: string | null = null;

            for (const line of lines) {
              if (line.startsWith("event:")) {
                // 'event:' length is 6, so we slice from index 6
                eventType = line.slice(6).trim();
              } else if (line.startsWith("data:")) {
                try {
                  const data: StatusMessageEvent = JSON.parse(
                    line.slice(5).trim(),
                  );

                  logger.info(
                    `Received SSE event: ${eventType ?? "unknown"}, status: ${ProjectStatusLabels[data.status] ?? "Unknown Status"}`,
                  );

                  if (
                    data.status === ProjectStatus.Completed ||
                    data.status === ProjectStatus.Draft
                  ) {
                    logger.info(
                      `Project status changed to terminal state: ${ProjectStatusLabels[data.status] ?? "Unknown Status"}`,
                    );

                    await reader.cancel();
                    cleanupStream();

                    handleTerminalStatus(data.status);

                    await cancelBuilderInvalidQueries();
                    await invalidateBuilderQueries();

                    return;
                  }
                } catch (parseError) {
                  logger.error("Error parsing SSE event data:", parseError);
                } finally {
                  eventType = null;
                }
              }
            }
          }
        }
      } finally {
        try {
          reader.releaseLock();
        } catch (e) {
          // Reader might already be released
          logger.debug("Reader already released or error releasing:", e);
        }
        streamingRef.current = false;
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        logger.debug("SSE stream was intentionally aborted");
      } else {
        logger.error("Error in SSE stream:", error);

        message.error(
          "Project status stream connection lost. Please refresh the page.",
        );
      }
    } finally {
      streamingRef.current = false;
    }
  }, [project.id]);

  const handleTerminalStatus = useCallback(
    (status: ProjectStatus) => {
      switch (status) {
        case ProjectStatus.Completed:
          modal.success({
            title: (
              <div className="text-green-600 font-semibold text-lg flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500" />
                <Title level={5} className="!mb-0 !text-green-600">
                  Certificates Generated Successfully!
                </Title>
              </div>
            ),
            content: (
              <div className="motion-preset-confetti mt-2 text-gray-700 text-sm space-y-2">
                <Text>Your certificates has been generated successfully.</Text>
                <div>
                  <Link
                    href={`/dashboard/projects/${project.id}/certificates`}
                    className="text-green-600 hover:text-green-700 transition underline"
                  >
                    View the generated certificates
                  </Link>
                </div>
              </div>
            ),
            icon: null,
            centered: true,
          });

          break;
        case ProjectStatus.Draft:
          modal.warning({
            title: "Could not generate certificates",
            content: (
              <div>
                <p>
                  There was an issue generating the certificates. The project
                  has been reset to draft status.
                </p>
              </div>
            ),
          });
          break;
      }
    },
    [project.id, router, modal],
  );

  const { mutateAsync: onGenerateCertificatesMutation, isPending: generating } =
    useMutation({
      mutationFn: onGenerateCertificates,
      onSuccess: async (data, variables) => {
        if (!data.success) {
          const { errors } = data;
          // TODO: add more specific error handling
          const specificError = getTranslatedErrorMessage(errors, {
            status:
              "Certificates cannot be generated as the project is not in draft status!",
            noAnnotate:
              "Certificates cannot be generated because there is no annotates!",
          });
          if (specificError) {
            message.error(specificError);
            return;
          }
          message.error("Failed to generate certificates");
          return;
        }

        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await cancelBuilderInvalidQueries();

        setProject({
          ...project,
          status: ProjectStatus.Processing,
        });
      },
      onError: (error, variables, context: any) => {
        logger.error("Failed to generate certificates", error);
        message.error("Failed to generate certificates");
      },
      onSettled: async () => {
        // don't invalidate since sse will handle it
        // await invalidateBuilderQueries();
      },
    });

  const handleGenerateCertificates = async () => {
    await onGenerateCertificatesMutation();
  };

  useEffect(() => {
    // Preload font options
    FontOptions.forEach((font) => {
      loadCustomFont(font.value, font.path).catch((error) => {
        logger.error(`Failed to load font ${font.label}:`, error);
      });
    });
  }, [FontOptions]);

  return (
    <>
      <Flex
        vertical
        justify="space-between"
        style={{
          height: "100%",
        }}
      >
        <div className="overflow-auto">{children}</div>
        <div style={{ borderTop: `1px solid ${colorSplit}` }}>
          <Flex className="m-2" justify="center">
            {!canGenerate ? (
              <Tooltip title={cannotGenerateReasons[0]}>
                <Button
                  type="primary"
                  onClick={handleGenerateCertificates}
                  loading={isProcessing || generating}
                  disabled
                >
                  Generate certificates
                </Button>
              </Tooltip>
            ) : (
              <Button
                type="primary"
                onClick={handleGenerateCertificates}
                loading={isProcessing || generating}
              >
                Generate certificates
              </Button>
            )}
          </Flex>
        </div>
      </Flex>
      {contextHolder}
    </>
  );
}

function TabItemLayout({ children }: PropsWithChildren) {
  return <div className="m-2">{children}</div>;
}
