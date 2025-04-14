"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  List,
  Typography,
  Spin,
  Empty,
  Flex,
} from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import {
  ActivityLogEntry,
  exportActivityLogAsPdf,
  getActivityLog,
} from "./temp";

const { Text, Paragraph } = Typography;

interface ActivityLogDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ActivityLogDialog({ open, onClose }: ActivityLogDialogProps) {
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [filteredLog, setFilteredLog] = useState<ActivityLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivityLog = async () => {
      if (open) {
        try {
          setIsLoading(true);
          const data = await getActivityLog();
          setActivityLog(data);
          setFilteredLog(data);
        } catch (error) {
          console.error("Failed to load activity log:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadActivityLog();
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLog(activityLog);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredLog(
        activityLog.filter(
          (entry) =>
            entry.action.toLowerCase().includes(query) ||
            entry.user.toLowerCase().includes(query) ||
            entry.details.toLowerCase().includes(query),
        ),
      );
    }
  }, [searchQuery, activityLog]);

  const handleExportPdf = async () => {
    await exportActivityLogAsPdf();
  };

  return (
    <Modal
      title="Activity Log"
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
            placeholder="Search activity log..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button icon={<DownloadOutlined />} onClick={handleExportPdf}>
            Export to csv
          </Button>
        </Flex>

        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
            }}
          >
            <Spin />
          </div>
        ) : filteredLog.length === 0 ? (
          <Empty description="No activity log entries found" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredLog}
            renderItem={(entry) => (
              <List.Item>
                <div style={{ width: "100%" }}>
                  <Flex justify="space-between" align="start">
                    <div>
                      <Text strong>{entry.action}</Text>
                      <Paragraph type="secondary" style={{ margin: 0 }}>
                        {entry.details}
                      </Paragraph>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text>{entry.user}</Text>
                      <div>
                        <Text type="secondary">{entry.timestamp}</Text>
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
