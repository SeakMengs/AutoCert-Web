import { Flex, Spin } from "antd";

export default function FullScreenSpin() {
  return (
    <Flex className="h-screen" justify="center" align="center">
      <Spin size="large" />
    </Flex>
  );
}
