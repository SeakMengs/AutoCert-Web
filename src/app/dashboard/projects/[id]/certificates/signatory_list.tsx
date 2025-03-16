"use client";

import { useState, useEffect } from "react";
import { List, Avatar, Typography, Spin, Empty, Flex } from "antd";
import { getSignatories, Signatory } from "./temp";

const { Text } = Typography;

interface SignatoryListProps {}

export function SignatoryList({}: SignatoryListProps) {
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSignatories = async () => {
      try {
        const data = await getSignatories();
        setSignatories(data);
      } catch (error) {
        console.error("Failed to load signatories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSignatories();
  }, []);

  if (isLoading) {
    return (
      <Flex className="w-full h-full" justify="center" align="center">
        <Spin />
      </Flex>
    );
  }

  if (signatories.length === 0) {
    return (
      <Flex className="w-full h-full" justify="center" align="center">
        <Empty description="No signatories found for this certificate" />
      </Flex>
    );
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={signatories}
      renderItem={(signatory) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar
                src={signatory.avatarUrl}
                style={{
                  backgroundColor: !signatory.avatarUrl ? "#1677ff" : undefined,
                }}
              >
                {!signatory.avatarUrl
                  ? signatory.name.substring(0, 2).toUpperCase()
                  : null}
              </Avatar>
            }
            title={signatory.name}
            description={
              <div>
                <Text type="secondary">{signatory.email}</Text>
                {signatory.position && (
                  <div>
                    <Text type="secondary">{signatory.position}</Text>
                  </div>
                )}
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}
