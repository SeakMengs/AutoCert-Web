import { cn } from "@/utils";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

type FullScreenSpinProps = React.ComponentProps<typeof Spin> & {
  parentClassName?: string;
};

export default function FullScreenSpin({ parentClassName,...props }: FullScreenSpinProps) {
  return (
    <Flex className={cn("h-screen", parentClassName)} justify="center" align="center">
      <Spin indicator={<LoadingOutlined spin />} size="large" {...props} />
    </Flex>
  );
}
