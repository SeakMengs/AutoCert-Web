import { IS_PRODUCTION } from "@/utils/env";
import { T_ZodErrorFormatted } from "@/utils/error";
import React from "react";
import { Alert, Typography } from "antd";

const { Text } = Typography;

export default function FormErrorMessages<T>({
  errors,
}: {
  errors: T_ZodErrorFormatted<T>;
}) {
  return (
    <Alert
      type="error"
      description={
        IS_PRODUCTION ? (
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {Object.entries(errors).map(([key, value]) => {
              const isUnknownKey = key.toLowerCase() === "unknown";
              const errorMessage = value as string;
              return (
                <li key={key} style={{ color: "darkred" }}>
                  <Text type="danger">
                    {isUnknownKey ? "Something went wrong" : errorMessage}
                  </Text>
                </li>
              );
            })}
          </ul>
        ) : (
          <div>
            {Object.entries(errors).map(([key, value]) => {
              const isUnknownKey = key.toLowerCase() === "unknown";
              const errorMessage = value as string;
              return (
                <div key={key} style={{ marginBottom: 4 }}>
                  <Text strong>
                    {key}
                    <Text
                      type="secondary"
                      style={{ marginLeft: 4, fontSize: 12 }}
                    >
                      (Dev only)
                    </Text>
                    {": "}
                  </Text>
                  <Text type="danger">{errorMessage}</Text>
                </div>
              );
            })}
          </div>
        )
      }
    />
  );
}
