import { Flex, Spin } from "antd";

type FullScreenSpinProps = React.ComponentProps<typeof Spin> & {};

export default function FullScreenSpin({ ...props }: FullScreenSpinProps) {
  return (
    <Flex className="h-screen" justify="center" align="center">
      <Spin size="large" {...props} />
    </Flex>
  );
}
