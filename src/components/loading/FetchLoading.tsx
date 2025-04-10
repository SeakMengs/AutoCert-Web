import { Flex, Spin } from "antd";

type FetchLoadingProps = React.ComponentProps<typeof Spin> & {};

export default function FetchLoading({ ...props }: FetchLoadingProps) {
  return <Spin size="large" {...props} />;
}
