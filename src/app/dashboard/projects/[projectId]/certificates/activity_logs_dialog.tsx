"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Input, List, Typography, Empty, Flex } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { z } from "zod";
import { ProjectLogSchema } from "@/schemas/autocert_api/project";
import moment from "moment";
import { exportActivityLogToCSV } from "./utils";

const { Text, Paragraph } = Typography;

type ProjectLog = z.infer<typeof ProjectLogSchema>;

interface ActivityLogsDialogProps {
  projectLogs: ProjectLog[];
  projectTitle: string;
  open: boolean;
  onClose: () => void;
}

export function ActivityLogsDialog({
  projectLogs,
  projectTitle,
  open,
  onClose,
}: ActivityLogsDialogProps) {
  const [filteredLog, setFilteredLog] = useState<ProjectLog[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLog(projectLogs);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredLog(
        projectLogs.filter(
          (entry) =>
            entry.action.toLowerCase().includes(query) ||
            entry.role.toLowerCase().includes(query) ||
            entry.description.toLowerCase().includes(query),
        ),
      );
    }
  }, [searchQuery, projectLogs]);

  const handleExportActivityLogToCSV = async () => {
    exportActivityLogToCSV(projectLogs, projectTitle)
  };

  return (
    <Modal
      title="Activity Logs"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{
        body: {
          maxHeight: "70vh",
          overflow: "auto",
        },
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Flex justify="space-between" gap={16}>
          <Input
            placeholder="Search log..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button icon={<DownloadOutlined />} onClick={handleExportActivityLogToCSV}>
            Export to csv
          </Button>
        </Flex>

        {filteredLog.length === 0 ? (
          searchQuery.trim() !== "" ? (
            <Empty description="No log matches your search" />
          ) : (
            <Empty description="No log found for this project" />
          )
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredLog}
            renderItem={(log) => (
              <List.Item>
                <div style={{ width: "100%" }}>
                  <Flex justify="space-between" align="start">
                    <div>
                      <Text strong>{log.action}</Text>
                      <Paragraph type="secondary" style={{ margin: 0 }}>
                        {log.description}
                      </Paragraph>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text>{log.role}</Text>
                      <div>
                        <Text type="secondary">
                          {moment(log.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                        </Text>
                      </div>
                    </div>
                  </Flex>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  );
}
