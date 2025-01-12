"use client";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";

// https://ant.design/docs/react/v5-for-19
export default function AntWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AntdRegistry>{children}</AntdRegistry>;
}