import {
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createScopedLogger } from "@/utils/logger";
import { useRouter } from "next/navigation";
import { getTranslatedErrorMessage } from "@/utils/error";
import { useAutoCertStore } from "../providers/AutoCertStoreProvider";
import { useShallow } from "zustand/react/shallow";
import { hasRole } from "@/auth/rbac";
import { ProjectRole, ProjectStatus } from "@/types/project";
import { QueryKey } from "@/utils/react_query";
import { ProjectById } from "@/app/dashboard/projects/[projectId]/builder/action";

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
        selectedAnnotateId: state.selectedAnnotateId,
        currentPdfPage: state.currentPdfPage,
        columnAnnotates: state.columnAnnotates,
        signatureAnnotates: state.signatureAnnotates,
        settings: state.settings,
        roles: state.roles,
        getAnnotateLockState: state.getAnnotateLockState,
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
    <Layout>
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

interface LayoutProps {}

const Layout = memo(({ children }: PropsWithChildren<LayoutProps>) => {
  const {
    project,
    roles,
    signaturesSigned,
    signatureCount,
    onGenerateCertificates,
    invalidateBuilderQueries,
  } = useAutoCertStore(
    useShallow((state) => {
      return {
        project: state.project,
        roles: state.roles,
        signaturesSigned: state.signaturesSigned,
        signatureCount: state.signatureCount,
        onGenerateCertificates: state.onGenerateCertificates,
        invalidateBuilderQueries: state.invalidateQueries,
      };
    }),
  );
  
  const queryClient = useQueryClient();

  const router = useRouter();
  const { message, modal } = App.useApp();
  const {
    token: { colorSplit },
  } = theme.useToken();

  const { mutateAsync: onGenerateCertificatesMutation, isPending: generating } =
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
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries({
          queryKey: [QueryKey.ProjectBuilderById, project.id],
        });

        const previousData = queryClient.getQueryData<ProjectById>([
          QueryKey.ProjectBuilderById,
          project.id,
        ]);

        if (previousData && previousData.success) {
          // Optimistically update the project status
          const updatedProject = {
            ...previousData.data.project,
            status: ProjectStatus.Processing,
          };

          queryClient.setQueryData<ProjectById>(
            [QueryKey.ProjectBuilderById, project.id],
            {
              ...previousData,
              data: {
                ...previousData.data,
                project: updatedProject,
              },
            },
          );
        }

        return {
          previousData,
        };
      },
      onError: (error, variables, context: any) => {
        logger.error("Failed to generate certificates", error);
        message.error("Failed to generate certificates");

        if (context?.previousData) {
          queryClient.setQueryData(
            [QueryKey.ProjectBuilderById, project.id],
            context.previousData,
          );
        }
      },
      onSettled: async () => {
        await invalidateBuilderQueries();
      },
    });

  const handleGenerateCertificates = async () => {
    await onGenerateCertificatesMutation();
  };

  const isRequestor = hasRole(roles, ProjectRole.Requestor);
  const isDraft = project.status === ProjectStatus.Draft;
  const isProcessing = project.status === ProjectStatus.Processing;
  const allSignaturesSigned = signaturesSigned === signatureCount;
  const canGenerate =
    !generating && !isProcessing && isDraft && isRequestor && allSignaturesSigned;

  return (
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
            <Tooltip
              title={
                generating
                  ? "Generating certificates."
                  : !isDraft
                    ? "Certificates can only be generated when the project is in draft status."
                    : !isRequestor
                      ? "Only the requestor can generate certificates."
                      : !allSignaturesSigned
                        ? "All signatures must be signed before generating certificates."
                        : // Most likely this never happen
                          "Unable to generate certificates."
              }
            >
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
  );
});

const TabItemLayout = memo(({ children }: PropsWithChildren) => {
  return <div className="m-2">{children}</div>;
});
