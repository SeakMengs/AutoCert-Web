import { cn } from "@/utils";
import { Flex, Spin } from "antd";

type FullScreenSpinProps = React.ComponentProps<typeof Spin> & {
  parentClassName?: string;
};

export default function FullScreenSpin({ parentClassName,...props }: FullScreenSpinProps) {
  return (
    <Flex className={cn("h-screen", parentClassName)} justify="center" align="center">
      <Spin size="large" {...props} />
    </Flex>
  );
}
