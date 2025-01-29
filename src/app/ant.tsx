"use client";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider } from "antd";
import theme from "./theme";

// https://ant.design/docs/react/compatible-style#antd-config-layer
// https://ant.design/docs/react/v5-for-19
export default function AntWrapper({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AntdRegistry>
            <ConfigProvider theme={theme}>{children}</ConfigProvider>
        </AntdRegistry>
    );
}
